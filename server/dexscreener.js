const ALLOWED_QUOTES = new Set(['USDC', 'USDT']);

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function normalized(value) {
  return String(value || '').trim().toLowerCase();
}

function differencePct(left, right) {
  const a = numberOrNull(left);
  const b = numberOrNull(right);
  if (a === null || b === null) return null;
  return Math.abs(a / b - 1) * 100;
}

function responseTimeIsCredible(responseAt, receivedAt) {
  const source = Date.parse(responseAt);
  const received = Date.parse(receivedAt);
  return Number.isFinite(source) && Number.isFinite(received) && Math.abs(received - source) <= 120_000;
}

export function selectDexPair(asset, pairs = []) {
  const contract = normalized(asset.contractAddress || asset.address);
  return pairs
    .filter((pair) => normalized(pair.chainId) === normalized(asset.chainId || asset.chain))
    .filter((pair) => normalized(pair.baseToken?.address) === contract)
    .filter((pair) => ALLOWED_QUOTES.has(String(pair.quoteToken?.symbol || '').toUpperCase()))
    .filter((pair) => numberOrNull(pair.priceUsd) !== null && numberOrNull(pair.liquidity?.usd) !== null)
    .sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0))[0] || null;
}

export function verifyDexPair({ asset, pair, confirmation, receivedAt, sourceResponseAt, confirmationResponseAt, referencePriceUsd = null }) {
  if (!pair) throw new Error('DEX pair is required');
  const chainId = String(asset.chainId || asset.chain).toLowerCase();
  const contractAddress = String(asset.contractAddress || asset.address);
  const price = numberOrNull(pair.priceUsd);
  const confirmedPrice = numberOrNull(confirmation?.priceUsd);
  const referenceDeviation = differencePct(price, referencePriceUsd);
  const endpointPriceDeviation = differencePct(price, confirmedPrice);
  const endpointLiquidityDeviation = differencePct(pair.liquidity?.usd, confirmation?.liquidity?.usd);
  const endpointVolumeDeviation = differencePct(pair.volume?.h24, confirmation?.volume?.h24);
  const checks = {
    chain_id_match: normalized(pair.chainId) === normalized(chainId) && normalized(confirmation?.chainId) === normalized(chainId),
    contract_match: normalized(pair.baseToken?.address) === normalized(contractAddress) && normalized(confirmation?.baseToken?.address) === normalized(contractAddress),
    pair_address_match: normalized(pair.pairAddress) !== '' && normalized(pair.pairAddress) === normalized(confirmation?.pairAddress),
    quote_asset_allowed: ALLOWED_QUOTES.has(String(pair.quoteToken?.symbol || '').toUpperCase()) && String(pair.quoteToken?.symbol || '').toUpperCase() === String(confirmation?.quoteToken?.symbol || '').toUpperCase(),
    source_response_time_valid: responseTimeIsCredible(sourceResponseAt, receivedAt) && responseTimeIsCredible(confirmationResponseAt, receivedAt),
    endpoint_price_match: endpointPriceDeviation !== null && endpointPriceDeviation <= 1,
    endpoint_liquidity_match: endpointLiquidityDeviation !== null && endpointLiquidityDeviation <= 5,
    endpoint_volume_match: endpointVolumeDeviation !== null && endpointVolumeDeviation <= 5,
    reference_price_match: referenceDeviation === null ? null : referenceDeviation <= 2.5
  };
  const structuralChecks = Object.entries(checks)
    .filter(([key]) => key !== 'reference_price_match')
    .every(([, value]) => value === true);
  const referenceChecked = checks.reference_price_match !== null;
  const fullyVerified = structuralChecks && (!referenceChecked || checks.reference_price_match === true);
  const verificationStatus = fullyVerified
    ? (referenceChecked ? 'VERIFIED' : 'SOURCE_CROSSCHECKED')
    : 'REVIEW_REQUIRED';
  const sourceObservedAt = new Date(confirmationResponseAt || sourceResponseAt).toISOString();

  return {
    name: asset.name,
    canonical_asset_id: asset.canonicalAssetId || asset.id,
    identity: `${chainId}:${contractAddress.toLowerCase()}`,
    chain_id: chainId,
    contract_address: contractAddress,
    dex: pair.dexId || null,
    pair_address: pair.pairAddress || null,
    quote_contract_address: pair.quoteToken?.address || null,
    quote_symbol: pair.quoteToken?.symbol || null,
    url: pair.url || confirmation?.url || null,
    price,
    currency: 'USD',
    volume_24h_quote: numberOrNull(pair.volume?.h24),
    liquidity_usd: numberOrNull(pair.liquidity?.usd),
    transactions_5m: Number(confirmation?.txns?.m5?.buys || 0) + Number(confirmation?.txns?.m5?.sells || 0),
    provider_timestamp: null,
    source_response_at: sourceObservedAt,
    received_at: receivedAt,
    exact_trade_timestamp_available: false,
    verification_status: verificationStatus,
    verification_method: referenceChecked
      ? 'DEX Screener token-pairs + endpoint del pool + identidad chainId/contrato + contraste Kaufman Reference Price.'
      : 'DEX Screener token-pairs + endpoint del pool + identidad chainId/contrato; no se usa como precio de referencia.',
    verification_checks: checks,
    endpoint_price_deviation_pct: endpointPriceDeviation,
    reference_price_usd: numberOrNull(referencePriceUsd),
    reference_deviation_pct: referenceDeviation
  };
}
