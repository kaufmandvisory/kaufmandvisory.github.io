const decode = (value = '') => String(value)
  .replaceAll('&quot;', '"')
  .replaceAll('&#x2F;', '/')
  .replaceAll('&amp;', '&');

const numberFromFormatted = (value) => {
  const number = Number(String(value || '').replaceAll(',', '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(number) ? number : null;
};

function extractIsharesField(html, field) {
  const decoded = decode(html);
  const start = decoded.indexOf(`"${field}":{`);
  if (start < 0) return null;
  const segment = decoded.slice(start, start + 2_000);
  const value = segment.match(/"formattedValue":"([^"]+)"/)?.[1] || null;
  const asOf = segment.match(/"formattedAsOfDate":"([^"]+)"/)?.[1] || null;
  return { value, as_of: asOf };
}

export function buildIsharesIssuerObservation({ html, asset, ticker, url, receivedAt = new Date().toISOString(), previous = null }) {
  if (typeof html !== 'string' || html.length < 100_000) throw new Error(`${ticker}: respuesta de emisor incompleta`);
  const sharesField = extractIsharesField(html, 'sharesOutstanding');
  const shares = numberFromFormatted(sharesField?.value);
  const asOfMs = Date.parse(`${sharesField?.as_of || ''} 12:00:00 UTC`);
  if (!Number.isFinite(shares) || shares <= 0 || !Number.isFinite(asOfMs)) throw new Error(`${ticker}: acciones en circulación no extraíbles`);
  const asOf = new Date(asOfMs).toISOString().slice(0, 10);
  const priorShares = Number(previous?.shares_outstanding);
  const priorDate = String(previous?.as_of_date || '');
  const comparable = Number.isFinite(priorShares) && priorShares > 0 && /^\d{4}-\d{2}-\d{2}$/.test(priorDate) && priorDate < asOf;
  return {
    asset,
    ticker,
    issuer: 'iShares · BlackRock',
    shares_outstanding: shares,
    as_of_date: asOf,
    received_at: receivedAt,
    previous_as_of_date: comparable ? priorDate : null,
    previous_shares_outstanding: comparable ? priorShares : null,
    shares_change: comparable ? shares - priorShares : null,
    creation_redemption_direction: comparable ? (shares > priorShares ? 'CREATION' : shares < priorShares ? 'REDEMPTION' : 'FLAT') : 'BASELINE',
    source_url: url,
    verification_status: comparable ? 'ISSUER_DELTA_OBSERVED' : 'ISSUER_BASELINE_OBSERVED',
    methodology: 'Acciones en circulación y fecha publicadas por el emisor. El cambio solo se calcula contra una observación anterior con fecha distinta; no se convierte a flujo USD sin NAV y cesta comparables.'
  };
}

export function reconcileEtfFlows(aggregate, issuerObservations = [], receivedAt = new Date().toISOString()) {
  if (!aggregate?.assets) return null;
  const issuerByAsset = Object.fromEntries(issuerObservations.map((row) => [row.asset, row]));
  const assets = {};
  for (const asset of ['bitcoin', 'ethereum']) {
    const row = aggregate.assets[asset];
    if (!row) continue;
    const issuer = issuerByAsset[asset] || null;
    const aggregateDirection = Number(row.latest_net_flow_usd) > 0 ? 'INFLOW' : Number(row.latest_net_flow_usd) < 0 ? 'OUTFLOW' : 'FLAT';
    const issuerDirection = issuer?.creation_redemption_direction;
    const comparable = issuer && ['CREATION', 'REDEMPTION', 'FLAT'].includes(issuerDirection);
    const directionMatch = comparable
      ? (aggregateDirection === 'INFLOW' && issuerDirection === 'CREATION') || (aggregateDirection === 'OUTFLOW' && issuerDirection === 'REDEMPTION') || (aggregateDirection === 'FLAT' && issuerDirection === 'FLAT')
      : null;
    assets[asset] = {
      ...row,
      aggregate_direction: aggregateDirection,
      issuer_observation: issuer,
      direction_match: directionMatch,
      verification_status: directionMatch === true ? 'AGGREGATE_ISSUER_DIRECTION_MATCH' : directionMatch === false ? 'AGGREGATE_ISSUER_CONFLICT' : issuer ? 'SECOND_SOURCE_BASELINE' : 'SINGLE_SOURCE',
      publishable_as_reconciled: directionMatch === true
    };
  }
  const matched = Object.values(assets).filter((row) => row.direction_match === true).length;
  const conflicts = Object.values(assets).filter((row) => row.direction_match === false).length;
  return {
    ...aggregate,
    assets,
    received_at: receivedAt,
    issuer_observations: issuerObservations,
    reconciliation: {
      aggregate_source: aggregate.source,
      issuer_source: 'iShares · BlackRock',
      assets_with_second_source: issuerObservations.length,
      direction_matches: matched,
      conflicts,
      status: conflicts ? 'CONFLICT' : matched ? 'RECONCILED' : issuerObservations.length ? 'BASELINE_ESTABLISHED' : 'SINGLE_SOURCE'
    },
    verification_status: conflicts ? 'CONFLICT' : matched ? 'MULTI_SOURCE_RECONCILED' : issuerObservations.length ? 'SECOND_SOURCE_BASELINE' : 'SINGLE_SOURCE',
    methodology: `${aggregate.methodology} Kaufman contrasta además la dirección creación/redención del principal producto iShares de cada activo mediante acciones en circulación publicadas por el emisor; nunca equipara esa variación a flujo USD sin datos comparables.`
  };
}
