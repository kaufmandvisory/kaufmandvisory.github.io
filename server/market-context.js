const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const round = (value, digits = 4) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const isoFromUnixSeconds = (value) => {
  const number = asNumber(value);
  if (!Number.isFinite(number)) return null;
  const date = new Date(number * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export function buildDominanceSnapshot(payload, receivedAt = new Date().toISOString()) {
  const data = payload?.data;
  const btc = asNumber(data?.market_cap_percentage?.btc);
  const eth = asNumber(data?.market_cap_percentage?.eth);
  const totalMarketCapUsd = asNumber(data?.total_market_cap?.usd);
  const providerTimestamp = isoFromUnixSeconds(data?.updated_at);
  if (![btc, eth, totalMarketCapUsd].every(Number.isFinite) || !providerTimestamp) throw new Error('CoinGecko global response incomplete');
  if (btc < 0 || eth < 0 || btc + eth > 100 || totalMarketCapUsd <= 0) throw new Error('CoinGecko dominance values invalid');
  return {
    btc_pct: round(btc, 3),
    eth_pct: round(eth, 3),
    others_pct: round(100 - btc - eth, 3),
    total_market_cap_usd: round(totalMarketCapUsd, 2),
    provider_timestamp: providerTimestamp,
    received_at: receivedAt,
    source: 'CoinGecko Global Market Data',
    source_url: 'https://docs.coingecko.com/reference/crypto-global',
    verification_status: 'SOURCE_OBSERVED',
    methodology: 'Cuota de la capitalización de BTC y ETH sobre la capitalización total publicada por CoinGecko; CoinGecko no interviene en el ticker en vivo Kaufman.'
  };
}

export function buildOpenInterestSnapshot(payload, receivedAt = new Date().toISOString()) {
  const current = asNumber(payload?.total24h);
  if (!Number.isFinite(current) || current < 0) throw new Error('DefiLlama open interest response incomplete');
  const chart = Array.isArray(payload?.totalDataChart) ? payload.totalDataChart : [];
  const latest = [...chart].reverse().find((row) => Array.isArray(row) && Number.isFinite(Number(row[0])) && Number.isFinite(Number(row[1])));
  const providerTimestamp = latest ? isoFromUnixSeconds(latest[0]) : receivedAt;
  const topVenues = (Array.isArray(payload?.protocols) ? payload.protocols : [])
    .map((row) => ({
      name: String(row?.displayName || row?.name || '').trim(),
      open_interest_usd: asNumber(row?.total24h),
      chains: Array.isArray(row?.chains) ? row.chains.map(String) : []
    }))
    .filter((row) => row.name && Number.isFinite(row.open_interest_usd) && row.open_interest_usd > 0)
    .sort((a, b) => b.open_interest_usd - a.open_interest_usd)
    .slice(0, 5);
  return {
    open_interest_usd: round(current, 2),
    change_1d_pct: asNumber(payload?.change_1d),
    change_7d_pct: asNumber(payload?.change_7d),
    change_30d_pct: asNumber(payload?.change_1m),
    provider_timestamp: providerTimestamp,
    received_at: receivedAt,
    top_venues: topVenues,
    source: 'DefiLlama Open Interest',
    source_url: 'https://defillama.com/open-interest',
    verification_status: 'SOURCE_OBSERVED',
    methodology: 'Interés abierto agregado de los adaptadores incluidos por DefiLlama. El perímetro combina protocolos y mercados monitorizados por esa fuente; no equivale a todo el mercado mundial de derivados.'
  };
}

export function buildDvolSnapshot(payloadByAsset, receivedAt = new Date().toISOString()) {
  const assets = {};
  for (const asset of ['BTC', 'ETH']) {
    const rows = payloadByAsset?.[asset]?.result?.data;
    const latest = Array.isArray(rows) ? [...rows].reverse().find((row) => Array.isArray(row) && row.length >= 5 && Number.isFinite(Number(row[4]))) : null;
    if (!latest) continue;
    assets[asset.toLowerCase()] = {
      value: round(Number(latest[4]), 2),
      provider_timestamp: new Date(Number(latest[0])).toISOString()
    };
  }
  if (!assets.btc && !assets.eth) throw new Error('Deribit DVOL response incomplete');
  return {
    assets,
    received_at: receivedAt,
    source: 'Deribit DVOL',
    source_url: 'https://docs.deribit.com/api-reference/market-data/public-get_volatility_index_data',
    verification_status: Object.keys(assets).length === 2 ? 'SOURCE_OBSERVED' : 'DEGRADED',
    methodology: 'Cierre del último intervalo solicitado del índice de volatilidad implícita de Deribit para BTC y ETH.'
  };
}

function extractCoinFlowsSeries(decodedHtml, asset) {
  const start = decodedHtml.indexOf(`"${asset}":{"totalInflow"`);
  if (start < 0) return [];
  const nextAsset = asset === 'bitcoin' ? decodedHtml.indexOf('"ethereum":{"totalInflow"', start) : decodedHtml.indexOf('}}}', start);
  const segment = decodedHtml.slice(start, nextAsset > start ? nextAsset : start + 80_000);
  const match = segment.match(/"monthlyData":(\[.*?\]),"providers"/s);
  if (!match) return [];
  const rows = JSON.parse(match[1]);
  return rows.map((row) => ({
    date: String(row?.isoDate || ''),
    inflow_usd: asNumber(row?.inflow),
    outflow_usd: asNumber(row?.outflow),
    net_flow_usd: asNumber(row?.net)
  })).filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && [row.inflow_usd, row.outflow_usd, row.net_flow_usd].every(Number.isFinite));
}

export function buildEtfFlowSnapshot(html, receivedAt = new Date().toISOString()) {
  if (typeof html !== 'string' || html.length < 1000) throw new Error('CoinFlows response incomplete');
  const decoded = html.replaceAll('\\"', '"');
  const receivedDay = receivedAt.slice(0, 10);
  const assets = {};
  for (const asset of ['bitcoin', 'ethereum']) {
    const rows = extractCoinFlowsSeries(decoded, asset)
      .filter((row) => !(row.date >= receivedDay && row.inflow_usd === 0 && row.outflow_usd === 0 && row.net_flow_usd === 0))
      .slice(-30);
    if (!rows.length) continue;
    const latest = rows.at(-1);
    const recent = rows.slice(-7);
    assets[asset] = {
      latest_date: latest.date,
      latest_net_flow_usd: round(latest.net_flow_usd, 2),
      seven_session_net_flow_usd: round(recent.reduce((sum, row) => sum + row.net_flow_usd, 0), 2),
      series: rows
    };
  }
  if (!assets.bitcoin && !assets.ethereum) throw new Error('CoinFlows ETF series unavailable');
  return {
    assets,
    received_at: receivedAt,
    source: 'CoinFlows public ETF tracker',
    source_url: 'https://coinflows.org/',
    verification_status: Object.keys(assets).length === 2 ? 'AGGREGATOR_OBSERVED' : 'DEGRADED',
    methodology: 'Flujo neto diario agregado de ETF spot estadounidenses publicado por CoinFlows. Kaufman conserva el signo y la fecha de mercado, excluye la fila vacía del día en curso y no lo interpreta como flujo mundial.'
  };
}

const ETF_ASSET_IDS = { BTC: 'bitcoin', ETH: 'ethereum' };

const periodStart = (date, days) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - (days - 1));
  return value.toISOString().slice(0, 10);
};

export function buildEtfHistoricalSnapshot(payload, receivedAt = new Date().toISOString()) {
  const input = Array.isArray(payload?.rows) ? payload.rows : [];
  const assets = {};
  for (const [symbol, asset] of Object.entries(ETF_ASSET_IDS)) {
    const allRows = input
      .filter((row) => String(row?.asset || '').toUpperCase() === symbol)
      .map((row) => ({
        date: String(row?.date || ''),
        net_flow_usd: asNumber(row?.net_inflow_usd),
        net_assets_usd: asNumber(row?.net_assets_usd),
        cumulative_inflow_usd: asNumber(row?.cumulative_inflow_usd),
        value_traded_usd: asNumber(row?.value_traded_usd)
      }))
      .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.net_flow_usd))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!allRows.length) continue;
    const latest = allRows.at(-1);
    const cutoff90 = periodStart(latest.date, 90);
    const series = allRows.filter((row) => row.date >= cutoff90);
    const periodNet = {};
    const sessionCounts = {};
    for (const days of [7, 30, 90]) {
      const cutoff = periodStart(latest.date, days);
      const rows = series.filter((row) => row.date >= cutoff);
      periodNet[`${days}d`] = round(rows.reduce((sum, row) => sum + row.net_flow_usd, 0), 2);
      sessionCounts[`${days}d`] = rows.length;
    }
    assets[asset] = {
      latest_date: latest.date,
      latest_net_flow_usd: round(latest.net_flow_usd, 2),
      seven_session_net_flow_usd: periodNet['7d'],
      period_net_flow_usd: periodNet,
      period_session_count: sessionCounts,
      series
    };
  }
  if (!assets.bitcoin && !assets.ethereum) throw new Error('ETF historical dataset unavailable');
  return {
    assets,
    received_at: receivedAt,
    source: 'ByKaranteli public ETF history',
    source_url: 'https://bykaranteli.com/data',
    upstream_source: 'SoSoValue public US spot ETF series',
    verification_status: Object.keys(assets).length === 2 ? 'AGGREGATOR_OBSERVED' : 'DEGRADED',
    methodology: 'Flujo neto diario finalizado de ETF spot estadounidenses, agregado por activo y conservado durante los últimos 90 días naturales. La fuente secundaria declara SoSoValue como origen; Kaufman contrasta la sesión más reciente con CoinFlows y observaciones del emisor cuando están disponibles.'
  };
}
