import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokenizationSnapshot } from '../server/tokenization.js';
import { extractL2BeatProjectIcons, normalizeL2BeatSummary } from '../server/l2beat.js';
import { SOURCE_REGISTRY, buildFiscalSnapshot, checkFiscalSource, validateFiscalSnapshot } from '../server/fiscal.js';
import { REGULATORY_SOURCES, buildRegulationSnapshot, checkRegulatorySource, validateRegulationSnapshot } from '../server/regulation.js';
import { buildEthereumFeeSnapshot } from '../server/auxiliary.js';
import { buildExchangeFeeRegistry } from '../server/exchange-fees.js';
import { buildDominanceSnapshot, buildOpenInterestSnapshot, buildDvolSnapshot, buildEtfFlowSnapshot } from '../server/market-context.js';
import { buildIsharesIssuerObservation, reconcileEtfFlows } from '../server/etf-flows.js';
import { buildWalletIntelligence } from '../server/wallet-intelligence.js';
import { buildWeb3Telemetry } from '../server/web3-telemetry.js';
import { fetchDexPairForAsset, fetchOnchainSwapEvidence, verifyDexPair } from '../server/dexscreener.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const receivedAt = new Date().toISOString();
const headers = { accept: 'application/json', 'user-agent': 'Kaufman-Public-Snapshot/1.0 contact@kaufmanadvisory.io' };

async function previousPlatformSnapshot() {
  try {
    const raw = await fs.readFile(path.join(root, 'assets', 'platform-data.js'), 'utf8');
    return JSON.parse(raw.slice('window.KAUFMAN_PLATFORM_DATA = '.length).replace(/;\s*$/, ''));
  } catch { return null; }
}

const previousPlatform = await previousPlatformSnapshot();

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) }, signal: AbortSignal.timeout(options.timeout || 25_000) });
  if (!response.ok) throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
  return response.json();
}

async function fetchJsonWithMeta(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) }, signal: AbortSignal.timeout(options.timeout || 25_000) });
  if (!response.ok) throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
  return { payload: await response.json(), response_at: response.headers.get('date') || new Date().toUTCString() };
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, accept: 'text/html', ...(options.headers || {}) }, signal: AbortSignal.timeout(options.timeout || 25_000) });
  if (!response.ok) throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
  return response.text();
}

async function attempt(task, fallback = null) {
  try { return await task(); } catch (error) { console.warn(error.message); return fallback; }
}

function median(values) {
  const rows = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!rows.length) return null;
  const middle = Math.floor(rows.length / 2);
  return rows.length % 2 ? rows[middle] : (rows[middle - 1] + rows[middle]) / 2;
}

function round(value, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

const assets = [
  { id: 'bitcoin', symbol: 'BTC', coinbase: 'BTC-USD', kraken: 'XXBTZUSD', krakenOhlc: 'XBTUSD' },
  { id: 'ethereum', symbol: 'ETH', coinbase: 'ETH-USD', kraken: 'XETHZUSD', krakenOhlc: 'ETHUSD' },
  { id: 'solana', symbol: 'SOL', coinbase: 'SOL-USD', kraken: 'SOLUSD', krakenOhlc: 'SOLUSD' }
];

const [coinbaseRows, krakenPayload, coinGeckoRows] = await Promise.all([
  Promise.all(assets.map(async (asset) => [asset.id, await attempt(() => fetchJson(`https://api.exchange.coinbase.com/products/${asset.coinbase}/ticker`))])),
  attempt(() => fetchJson('https://api.kraken.com/0/public/Ticker?pair=XBTUSD,ETHUSD,SOLUSD,USDTUSD,USDCUSD'), { result: {} }),
  attempt(() => fetchJson('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana'), [])
]);
const coinbaseById = Object.fromEntries(coinbaseRows);
const kraken = krakenPayload?.result || {};
const coinGeckoById = Object.fromEntries((coinGeckoRows || []).map((row) => [row.id, row]));

const referencePrices = {};
for (const asset of assets) {
  const cb = coinbaseById[asset.id];
  const kr = kraken[asset.kraken];
  const observations = [
    cb && { venue: `Coinbase ${asset.coinbase}`, price: Number(cb.price), volume: Number(cb.volume) * Number(cb.price), timestamp: cb.time },
    kr && { venue: `Kraken ${asset.symbol}/USD`, price: Number(kr.c?.[0]), volume: Number(kr.v?.[1]) * Number(kr.c?.[0]), timestamp: receivedAt }
  ].filter((row) => Number.isFinite(row?.price) && row.price > 0 && Number.isFinite(row.volume) && row.volume >= 100_000);
  const price = median(observations.map((row) => row.price));
  if (!price) continue;
  const divergence = observations.length > 1 ? Math.max(...observations.map((row) => Math.abs(row.price / price - 1) * 100)) : null;
  referencePrices[asset.id] = {
    asset_id: asset.id,
    price: round(price, asset.id === 'bitcoin' ? 2 : 4),
    currency: 'USD',
    provider_timestamp: receivedAt,
    received_at: receivedAt,
    age_ms: 0,
    venues: observations.map((row) => row.venue),
    methodology: { type: 'median', minimum_volume_usd_24h: 100_000, divergence_threshold_pct: 2.5, delivery: 'daily_public_snapshot' },
    confidence: observations.length > 1 ? 'HIGH' : 'MEDIUM',
    verification_status: observations.length > 1 ? 'VERIFIED' : 'SINGLE_SOURCE',
    metrics: { observations: observations.length, max_divergence_pct: divergence === null ? null : round(divergence, 4) },
    change_24h_pct: null
  };
}

const stablecoinFx = {};
for (const [symbol, key] of [['USDT', 'USDTZUSD'], ['USDC', 'USDCUSD']]) {
  const row = kraken[key];
  const price = Number(row?.c?.[0]);
  if (!Number.isFinite(price)) continue;
  stablecoinFx[symbol] = {
    asset_id: symbol.toLowerCase(), price, currency: 'USD', provider_timestamp: receivedAt, received_at: receivedAt,
    venues: [`Kraken ${symbol}/USD`], methodology: 'Observación directa del par fiat; no se presupone paridad.', confidence: 'MEDIUM', verification_status: 'SINGLE_SOURCE'
  };
}

const metadata = {};
for (const asset of assets) {
  const row = coinGeckoById[asset.id];
  const updated = row?.last_updated ? new Date(row.last_updated).getTime() : NaN;
  if (!row || !Number.isFinite(updated) || Math.abs(new Date(receivedAt).getTime() - updated) > 30 * 60_000) {
    metadata[asset.id] = { name: asset.symbol, verification_status: 'EXCLUDED', exclusion_reason: 'last_updated_at ausente o superior a 30 minutos' };
    continue;
  }
  metadata[asset.id] = {
    id: row.id, name: row.name, symbol: row.symbol, image: row.image, market_cap_usd: Number(row.market_cap), circulating_supply: Number(row.circulating_supply),
    categories: [], last_updated_at: row.last_updated, received_at: receivedAt, verification_status: 'VERIFIED', source: 'CoinGecko metadata; nunca ticker Kaufman'
  };
}

async function historicalReturn(asset) {
  const payload = await fetchJson(`https://api.kraken.com/0/public/OHLC?pair=${asset.krakenOhlc}&interval=1440`);
  const key = Object.keys(payload.result || {}).find((name) => name !== 'last');
  const rows = key ? payload.result[key] : [];
  if (!Array.isArray(rows) || rows.length < 8) return null;
  const current = Number(rows.at(-1)?.[4]);
  const now = Number(rows.at(-1)?.[0]);
  const change = (days) => {
    const target = now - days * 86400;
    const row = [...rows].reverse().find((entry) => Number(entry[0]) <= target) || rows[0];
    const previous = Number(row?.[4]);
    return Number.isFinite(current) && Number.isFinite(previous) && previous > 0 ? round((current / previous - 1) * 100, 3) : null;
  };
  return { asset_id: asset.id, observed_at: receivedAt, source: 'Kraken OHLC diario', source_url: 'https://docs.kraken.com/api/docs/rest-api/get-ohlc-data', change_7d_pct: change(7), change_30d_pct: change(30), change_365d_pct: change(365) };
}
const historicalReturns = Object.fromEntries((await Promise.all(assets.map(async (asset) => [asset.id, await attempt(() => historicalReturn(asset))]))).filter(([, value]) => value));

const dvolEnd = Date.now();
const dvolStart = dvolEnd - 6 * 60 * 60_000;
const dvolUrl = (asset) => `https://www.deribit.com/api/v2/public/get_volatility_index_data?currency=${asset}&start_timestamp=${dvolStart}&end_timestamp=${dvolEnd}&resolution=60`;
const [dominance, openInterest, impliedVolatility, aggregateEtfFlows] = await Promise.all([
  attempt(async () => buildDominanceSnapshot(await fetchJson('https://api.coingecko.com/api/v3/global'), receivedAt)),
  attempt(async () => buildOpenInterestSnapshot(await fetchJson('https://api.llama.fi/overview/open-interest?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=true'), receivedAt)),
  attempt(async () => buildDvolSnapshot({ BTC: await fetchJson(dvolUrl('BTC')), ETH: await fetchJson(dvolUrl('ETH')) }, receivedAt)),
  attempt(async () => buildEtfFlowSnapshot(await fetchText('https://coinflows.org/'), receivedAt))
]);

const issuerEtfSources = [
  { asset: 'bitcoin', ticker: 'IBIT', url: 'https://www.ishares.com/us/products/333011/ishares-bitcoin-trust-etf' },
  { asset: 'ethereum', ticker: 'ETHA', url: 'https://www.ishares.com/us/products/337614/isharesethereum-trust-etf' }
];
const previousIssuerRows = Object.fromEntries((previousPlatform?.market_context?.etf_flows?.issuer_observations || []).map((row) => [row.ticker, row]));
const issuerEtfObservations = (await Promise.all(issuerEtfSources.map((source) => attempt(async () => buildIsharesIssuerObservation({
  ...source,
  html: await fetchText(source.url, { timeout: 35_000 }),
  receivedAt,
  previous: previousIssuerRows[source.ticker] || null
}))))).filter(Boolean);
const etfFlows = reconcileEtfFlows(aggregateEtfFlows, issuerEtfObservations, receivedAt);

const tokenizationMarkets = await attempt(async () => {
  const [protocols, stablecoins] = await Promise.all([
    fetchJson('https://api.llama.fi/protocols'),
    fetchJson('https://stablecoins.llama.fi/stablecoins?includePrices=true')
  ]);
  return buildTokenizationSnapshot(protocols, stablecoins, receivedAt);
});

const l2Intelligence = await attempt(async () => {
  const [summary, page] = await Promise.all([
    fetchJson('https://l2beat.com/api/scaling/summary'),
    fetchText('https://l2beat.com/scaling/summary')
  ]);
  const snapshot = normalizeL2BeatSummary(summary, receivedAt, extractL2BeatProjectIcons(page));
  if (snapshot.projects.some((project) => !project.logo_url)) throw new Error('L2BEAT project logos are incomplete');
  return snapshot;
});

const walletIntelligence = await buildWalletIntelligence({ fetchJson, fetchText, attempt, receivedAt });
const web3Telemetry = await buildWeb3Telemetry({ fetchJson, fetchText, attempt, receivedAt, l2Intelligence });

const fiscalHealth = Object.fromEntries(await Promise.all(SOURCE_REGISTRY.map(async (source) => [source.id, await checkFiscalSource(source)])));
const fiscalIntelligence = buildFiscalSnapshot(fiscalHealth, receivedAt);
validateFiscalSnapshot(fiscalIntelligence);

const regulationHealth = Object.fromEntries(await Promise.all(REGULATORY_SOURCES.map(async (source) => [source.id, await checkRegulatorySource(source)])));
const regulationIntelligence = buildRegulationSnapshot(regulationHealth, receivedAt);
validateRegulationSnapshot(regulationIntelligence);

const auxiliary = { ethereum_gas: null, ethereum_fees: null, etherscan_gas_oracle: null, exchange_fees: null };
const ethereumFees = await attempt(async () => {
  const payload = await fetchJson('https://ethereum-rpc.publicnode.com', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify([
      { jsonrpc: '2.0', method: 'eth_feeHistory', params: ['0x14', 'latest', [10, 50, 90]], id: 1 },
      { jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', false], id: 2 }
    ])
  });
  return buildEthereumFeeSnapshot(payload.find((row) => row.id === 1)?.result, payload.find((row) => row.id === 2)?.result, receivedAt);
});
if (ethereumFees) {
  auxiliary.ethereum_fees = ethereumFees;
  auxiliary.ethereum_gas = { gas_gwei: ethereumFees.tiers.standard.max_fee_gwei, provider_timestamp: ethereumFees.provider_timestamp, received_at: receivedAt, verification_status: ethereumFees.verification_status, methodology: ethereumFees.methodology };
}
const marketContext = {
  schema_version: 'kaufman-market-context-v1',
  delivery_mode: 'STATIC_SNAPSHOT',
  generated_at: receivedAt,
  refresh_interval_ms: 5 * 60_000,
  status: [dominance, openInterest, impliedVolatility, etfFlows, ethereumFees].every(Boolean) ? 'SNAPSHOT' : 'DEGRADED',
  dominance,
  open_interest: openInterest,
  implied_volatility: impliedVolatility,
  etf_flows: etfFlows,
  ethereum_fees: ethereumFees
};
auxiliary.exchange_fees = await attempt(async () => {
  return buildExchangeFeeRegistry(fetch, receivedAt);
});

const onchainAssets = [
  { id: 'ethereum', name: 'Wrapped Ether', chain: 'ethereum', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { id: 'bitcoin', name: 'Wrapped Bitcoin', chain: 'ethereum', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  { id: 'solana', name: 'Wrapped SOL', chain: 'solana', address: 'So11111111111111111111111111111111111111112' }
];
const onchainPools = (await Promise.all(onchainAssets.map(async (asset) => attempt(async () => {
  const selected = await fetchDexPairForAsset(asset);
  const pair = selected.pair;
  const confirmation = await fetchJsonWithMeta(`https://api.dexscreener.com/latest/dex/pairs/${asset.chain}/${pair.pairAddress}`);
  const onchainEvidence = await fetchOnchainSwapEvidence({ chainId: asset.chain, pairAddress: pair.pairAddress });
  return verifyDexPair({
    asset,
    pair,
    confirmation: confirmation.payload.pair || confirmation.payload.pairs?.[0],
    receivedAt,
    sourceResponseAt: selected.source_response_at,
    confirmationResponseAt: confirmation.response_at,
    referencePriceUsd: referencePrices[asset.id]?.price || null,
    onchainEvidence
  });
})))).filter(Boolean);

const providers = {
  coinbase: { connection_status: coinbaseRows.some(([, row]) => row) ? 'SNAPSHOT' : 'DEGRADED', last_message_at: receivedAt, messages: coinbaseRows.filter(([, row]) => row).length },
  kraken: { connection_status: Object.keys(kraken).length ? 'SNAPSHOT' : 'DEGRADED', last_message_at: receivedAt, messages: Object.keys(kraken).length },
  binance: { connection_status: 'UNAVAILABLE', last_message_at: null, last_error: 'No se utiliza en el snapshot estático; reservado para el WebSocket server-side.' },
  dexscreener: {
    connection_status: onchainPools.length === onchainAssets.length ? 'SNAPSHOT' : onchainPools.length ? 'DEGRADED' : 'UNAVAILABLE',
    last_message_at: onchainPools.length ? receivedAt : null,
    messages: onchainPools.length,
    expected_records: onchainAssets.length,
    last_error: onchainPools.length === onchainAssets.length ? null : `Cobertura DEX parcial: ${onchainPools.length}/${onchainAssets.length} pools verificados.`
  },
  coingecko_metadata: { connection_status: Object.values(metadata).some((row) => row.verification_status === 'VERIFIED') ? 'SNAPSHOT' : 'DEGRADED', last_message_at: receivedAt },
  defillama_tokenization: { connection_status: tokenizationMarkets ? 'SNAPSHOT' : 'DEGRADED', last_message_at: tokenizationMarkets?.received_at || null, records: tokenizationMarkets?.coverage?.rwa_protocols || 0 },
  l2beat_projects: { connection_status: l2Intelligence ? 'SNAPSHOT' : 'DEGRADED', last_message_at: l2Intelligence?.received_at || null, records: l2Intelligence?.coverage?.projects || 0 },
  web3_telemetry: { connection_status: web3Telemetry?.coverage?.observed === web3Telemetry?.coverage?.expected ? 'SNAPSHOT' : web3Telemetry?.coverage?.observed ? 'DEGRADED' : 'UNAVAILABLE', last_message_at: web3Telemetry?.generated_at || null, records: web3Telemetry?.coverage?.observed || 0 },
  ethereum_rpc: { connection_status: ethereumFees ? 'SNAPSHOT' : 'DEGRADED', last_message_at: ethereumFees?.received_at || null, block_number: ethereumFees?.block_number || null },
  fiscal_registry: { connection_status: 'SNAPSHOT', last_message_at: fiscalIntelligence.generated_at },
  regulation_registry: { connection_status: 'SNAPSHOT', last_message_at: regulationIntelligence.generated_at }
};
providers.wallet_releases = { connection_status: walletIntelligence.coverage.observed_controls === walletIntelligence.coverage.expected_controls ? 'SNAPSHOT' : walletIntelligence.coverage.observed_controls ? 'DEGRADED' : 'UNAVAILABLE', last_message_at: walletIntelligence.generated_at, records: walletIntelligence.coverage.observed_controls };

const snapshot = {
  schema_version: 'kaufman-public-platform-v1',
  delivery_mode: 'STATIC_SNAPSHOT',
  generated_at: receivedAt,
  reference_prices: referencePrices,
  historical_returns: historicalReturns,
  stablecoin_fx: stablecoinFx,
  providers,
  onchain_pools: onchainPools,
  metadata,
  auxiliary,
  tokenization_markets: tokenizationMarkets,
  l2_intelligence: l2Intelligence,
  fiscal_intelligence: fiscalIntelligence,
  regulation_intelligence: regulationIntelligence,
  wallet_intelligence: walletIntelligence,
  web3_telemetry: web3Telemetry,
  market_context: marketContext,
  thresholds: { snapshot_max_age_ms: 26 * 60 * 60_000, tokenization_max_age_ms: 24 * 60 * 60_000, l2beat_max_age_ms: 24 * 60 * 60_000, wallet_max_age_ms: 48 * 60 * 60_000, fiscal_max_age_ms: 48 * 60 * 60_000 },
  data_quality: {
    reference_assets: Object.keys(referencePrices).length,
    historical_assets: Object.keys(historicalReturns).length,
    onchain_pools: onchainPools.length,
    onchain_pools_expected: onchainAssets.length,
    tokenization_available: Boolean(tokenizationMarkets),
    l2_available: Boolean(l2Intelligence),
    fiscal_jurisdictions: fiscalIntelligence.jurisdictions.length,
    regulation_regimes: regulationIntelligence.regimes.length,
    wallet_releases: walletIntelligence.products.length,
    wallet_controls_observed: walletIntelligence.coverage.observed_controls,
    web3_telemetry_profiles: web3Telemetry.coverage.observed,
    market_context_signals: [dominance, openInterest, impliedVolatility, etfFlows, ethereumFees].filter(Boolean).length
  }
};

await fs.writeFile(path.join(root, 'assets', 'platform-data.js'), `window.KAUFMAN_PLATFORM_DATA = ${JSON.stringify(snapshot)};\n`, 'utf8');
console.log(`Platform snapshot: ${snapshot.data_quality.reference_assets} prices, ${snapshot.data_quality.historical_assets} histories, ${snapshot.data_quality.onchain_pools} DEX pools, tokenization=${snapshot.data_quality.tokenization_available}, l2=${snapshot.data_quality.l2_available}`);
