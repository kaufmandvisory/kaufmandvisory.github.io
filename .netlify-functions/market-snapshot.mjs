const ASSETS = {
  bitcoin: { symbol: 'BTC', coinbase: 'BTC-USD', kraken: ['XXBTZUSD', 'XBTUSD'], binance: 'BTCUSDT', minimumVolumeUsd24h: 1_000_000 },
  ethereum: { symbol: 'ETH', coinbase: 'ETH-USD', kraken: ['XETHZUSD', 'ETHUSD'], binance: 'ETHUSDT', minimumVolumeUsd24h: 1_000_000 },
  solana: { symbol: 'SOL', coinbase: 'SOL-USD', kraken: ['SOLUSD'], binance: 'SOLUSDT', minimumVolumeUsd24h: 500_000 },
};

const STABLECOINS = {
  USDT: { coinbase: 'USDT-USD', kraken: ['USDTZUSD', 'USDTUSD'] },
  // Coinbase Exchange does not expose USDC-USD on this public ticker API.
  // Kraken supplies the direct fiat market and Binance is only used through
  // the separately observed USDC/USDT cross, so no USD parity is assumed.
  USDC: { coinbase: null, kraken: ['USDCUSD'] },
};

const FRESH_MS = 5_000;
const DIVERGENCE_THRESHOLD_PCT = 2.5;
const PROVIDER_TIMEOUT_MS = 3_500;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const isoFrom = (value, fallback) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
};

const ageMs = (timestamp, nowMs) => {
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) ? Math.max(0, nowMs - parsed) : Number.POSITIVE_INFINITY;
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Kaufman-Market-Antenna/1.0' },
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const coinbaseProducts = () => [
    ...Object.values(ASSETS).map((asset) => asset.coinbase),
    ...Object.values(STABLECOINS).map((asset) => asset.coinbase),
  ].filter(Boolean);

const fetchCoinbase = async (receivedAt) => {
  const products = coinbaseProducts();
  const settled = await Promise.allSettled(products.map(async (product) => {
    let data;
    try {
      data = await fetchJson(`https://api.exchange.coinbase.com/products/${product}/ticker`);
    } catch (error) {
      throw new Error(`${product}: ${error?.message || 'mercado no disponible'}`);
    }
    const price = Number(data.price);
    const baseVolume = Number(data.volume);
    if (!Number.isFinite(price) || price <= 0) throw new Error(`${product}: precio inválido`);
    return {
      product,
      price,
      volumeUsd24h: Number.isFinite(baseVolume) ? baseVolume * price : 0,
      providerTimestamp: isoFrom(data.time, receivedAt),
      venue: `Coinbase ${product}`,
      provider: 'coinbase',
    };
  }));
  const observations = settled.filter((item) => item.status === 'fulfilled').map((item) => item.value);
  const errors = settled.filter((item) => item.status === 'rejected').map((item) => item.reason?.message || 'Error de mercado');
  if (!observations.length) throw new Error(errors[0] || 'Coinbase no disponible');
  return { observations, errors };
};

const fetchKraken = async (receivedAt) => {
  const data = await fetchJson('https://api.kraken.com/0/public/Ticker?pair=XBTUSD,ETHUSD,SOLUSD,USDTUSD,USDCUSD');
  if (data.error?.length) throw new Error(data.error.join(', '));
  const result = data.result || {};
  const observations = [];
  const definitions = [
    ...Object.entries(ASSETS).map(([assetId, asset]) => ({ id: assetId, symbol: asset.symbol, keys: asset.kraken })),
    ...Object.entries(STABLECOINS).map(([symbol, asset]) => ({ id: symbol, symbol, keys: asset.kraken })),
  ];
  for (const definition of definitions) {
    const key = definition.keys.find((candidate) => result[candidate]);
    const ticker = key ? result[key] : null;
    const price = Number(ticker?.c?.[0]);
    const baseVolume = Number(ticker?.v?.[1]);
    if (!Number.isFinite(price) || price <= 0) continue;
    observations.push({
      product: definition.id,
      price,
      volumeUsd24h: Number.isFinite(baseVolume) ? baseVolume * price : 0,
      providerTimestamp: receivedAt,
      venue: `Kraken ${definition.symbol}/USD`,
      provider: 'kraken',
    });
  }
  if (!observations.length) throw new Error('Kraken no devolvió mercados utilizables');
  return { observations, errors: [] };
};

const fetchBinance = async (receivedAt) => {
  const symbols = [...Object.values(ASSETS).map((asset) => asset.binance), 'USDCUSDT'];
  const query = encodeURIComponent(JSON.stringify(symbols));
  let data;
  let lastError;
  for (const host of ['https://api.binance.com', 'https://data-api.binance.vision']) {
    try {
      data = await fetchJson(`${host}/api/v3/ticker/24hr?symbols=${query}`);
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!Array.isArray(data)) throw lastError || new Error('Binance no disponible');
  const observations = data.map((ticker) => ({
    product: ticker.symbol,
    price: Number(ticker.lastPrice),
    volumeUsd24h: Number(ticker.quoteVolume),
    providerTimestamp: isoFrom(ticker.closeTime, receivedAt),
    venue: `Binance ${ticker.symbol}`,
    provider: 'binance',
  })).filter((item) => Number.isFinite(item.price) && item.price > 0);
  if (!observations.length) throw new Error('Binance no devolvió mercados utilizables');
  return { observations, errors: [] };
};

export const providerState = (result, receivedAt) => {
  if (result.status === 'rejected') {
    return {
      connection_status: 'UNAVAILABLE',
      last_message_at: null,
      messages: 0,
      last_error: result.reason?.message || 'Fuente temporalmente no disponible',
    };
  }
  const timestamps = result.value.observations.map((item) => Date.parse(item.providerTimestamp)).filter(Number.isFinite);
  const hasObservations = result.value.observations.length > 0;
  const hasErrors = Boolean(result.value.errors?.length);
  return {
    connection_status: hasObservations ? (hasErrors ? 'DEGRADED' : 'LIVE') : 'UNAVAILABLE',
    last_message_at: timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : receivedAt,
    messages: result.value.observations.length,
    last_error: hasErrors ? result.value.errors.join(' · ') : null,
  };
};

const stablecoinReference = (symbol, coinbase, kraken, receivedAt, nowMs) => {
  const definition = STABLECOINS[symbol];
  const candidates = [
    ...coinbase.filter((item) => item.product === definition.coinbase),
    ...kraken.filter((item) => definition.kraken.includes(item.product) || item.product === symbol),
  ].filter((item) => ageMs(item.providerTimestamp, nowMs) < FRESH_MS && item.volumeUsd24h >= 100_000);
  if (!candidates.length) return null;
  const price = median(candidates.map((item) => item.price));
  return {
    asset_id: symbol.toLowerCase(),
    price,
    currency: 'USD',
    provider_timestamp: new Date(Math.min(...candidates.map((item) => Date.parse(item.providerTimestamp)))).toISOString(),
    received_at: receivedAt,
    age_ms: Math.max(...candidates.map((item) => ageMs(item.providerTimestamp, nowMs))),
    venues: candidates.map((item) => item.venue),
    methodology: 'Mediana de mercados fiat frescos; no se presupone paridad con USD.',
    confidence: candidates.length > 1 ? 'HIGH' : 'MEDIUM',
    verification_status: candidates.length > 1 ? 'VERIFIED' : 'SINGLE_SOURCE',
  };
};

const referencePrice = (assetId, observations, receivedAt, nowMs) => {
  const definition = ASSETS[assetId];
  const eligible = observations.filter((item) => (
    ageMs(item.providerTimestamp, nowMs) < FRESH_MS &&
    Number.isFinite(item.price) && item.price > 0 &&
    item.volumeUsd24h >= definition.minimumVolumeUsd24h
  ));
  if (!eligible.length) {
    return {
      asset_id: assetId,
      price: null,
      currency: 'USD',
      provider_timestamp: null,
      received_at: receivedAt,
      age_ms: null,
      venues: [],
      methodology: {
        type: 'median',
        freshness_ms: FRESH_MS,
        minimum_volume_usd_24h: definition.minimumVolumeUsd24h,
        divergence_threshold_pct: DIVERGENCE_THRESHOLD_PCT,
        delivery: 'kaufman_server_side_edge',
      },
      confidence: 'NONE',
      verification_status: 'UNAVAILABLE',
      metrics: { observations: 0, max_divergence_pct: null },
    };
  }
  const initialMedian = median(eligible.map((item) => item.price));
  const used = eligible.filter((item) => Math.abs(item.price - initialMedian) / initialMedian * 100 <= DIVERGENCE_THRESHOLD_PCT);
  if (!used.length) return referencePrice(assetId, [], receivedAt, nowMs);
  const price = median(used.map((item) => item.price));
  const divergences = used.map((item) => Math.abs(item.price - price) / price * 100);
  return {
    asset_id: assetId,
    price,
    currency: 'USD',
    provider_timestamp: new Date(Math.min(...used.map((item) => Date.parse(item.providerTimestamp)))).toISOString(),
    received_at: receivedAt,
    age_ms: Math.max(...used.map((item) => ageMs(item.providerTimestamp, nowMs))),
    venues: used.map((item) => item.venue),
    methodology: {
      type: 'median',
      freshness_ms: FRESH_MS,
      minimum_volume_usd_24h: definition.minimumVolumeUsd24h,
      divergence_threshold_pct: DIVERGENCE_THRESHOLD_PCT,
      delivery: 'kaufman_server_side_edge',
    },
    confidence: used.length >= 3 ? 'HIGH' : used.length === 2 ? 'MEDIUM' : 'LOW',
    verification_status: used.length >= 2 ? 'VERIFIED' : 'SINGLE_SOURCE',
    metrics: {
      observations: used.length,
      excluded_observations: eligible.length - used.length,
      max_divergence_pct: Math.max(...divergences),
    },
  };
};

const publicHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept',
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'Netlify-CDN-Cache-Control': 'public, s-maxage=2, stale-while-revalidate=2',
  'X-Content-Type-Options': 'nosniff',
};

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: publicHeaders });
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers: publicHeaders });

  const startedAt = Date.now();
  const requestTimestamp = new Date().toISOString();
  const [coinbaseResult, krakenResult, binanceResult] = await Promise.allSettled([
    fetchCoinbase(requestTimestamp),
    fetchKraken(requestTimestamp),
    fetchBinance(requestTimestamp),
  ]);
  const coinbase = coinbaseResult.status === 'fulfilled' ? coinbaseResult.value.observations : [];
  const kraken = krakenResult.status === 'fulfilled' ? krakenResult.value.observations : [];
  const binance = binanceResult.status === 'fulfilled' ? binanceResult.value.observations : [];
  const nowMs = Date.now();
  const calculatedAt = new Date(nowMs).toISOString();

  const usdt = stablecoinReference('USDT', coinbase, kraken, calculatedAt, nowMs);
  const usdcDirect = stablecoinReference('USDC', coinbase, kraken, calculatedAt, nowMs);
  const binanceUsdcUsdt = binance.find((item) => item.product === 'USDCUSDT' && ageMs(item.providerTimestamp, nowMs) < FRESH_MS);
  const usdcCross = usdt && binanceUsdcUsdt ? {
    ...binanceUsdcUsdt,
    price: binanceUsdcUsdt.price * usdt.price,
    venue: 'Binance USDC/USDT × Kaufman USDT/USD',
  } : null;
  const usdcCandidates = [
    ...(usdcDirect ? [{ price: usdcDirect.price, venue: usdcDirect.venues.join(' · '), providerTimestamp: usdcDirect.provider_timestamp }] : []),
    ...(usdcCross ? [usdcCross] : []),
  ];
  const usdc = usdcCandidates.length ? {
    asset_id: 'usdc',
    price: median(usdcCandidates.map((item) => item.price)),
    currency: 'USD',
    provider_timestamp: new Date(Math.min(...usdcCandidates.map((item) => Date.parse(item.providerTimestamp)))).toISOString(),
    received_at: calculatedAt,
    age_ms: Math.max(...usdcCandidates.map((item) => ageMs(item.providerTimestamp, nowMs))),
    venues: usdcCandidates.map((item) => item.venue),
    methodology: 'Mercados fiat directos y cruce USDC/USDT solo cuando USDT/USD es fresco; nunca paridad asumida.',
    confidence: usdcCandidates.length > 1 ? 'HIGH' : 'MEDIUM',
    verification_status: usdcCandidates.length > 1 ? 'VERIFIED' : 'SINGLE_SOURCE',
  } : null;

  const normalizedObservations = [];
  for (const [assetId, definition] of Object.entries(ASSETS)) {
    normalizedObservations.push(...coinbase.filter((item) => item.product === definition.coinbase).map((item) => ({ ...item, assetId })));
    normalizedObservations.push(...kraken.filter((item) => definition.kraken.includes(item.product) || item.product === assetId).map((item) => ({ ...item, assetId })));
    if (usdt) {
      normalizedObservations.push(...binance.filter((item) => item.product === definition.binance).map((item) => ({
        ...item,
        assetId,
        price: item.price * usdt.price,
        volumeUsd24h: item.volumeUsd24h * usdt.price,
        venue: `${item.venue} × Kaufman USDT/USD`,
      })));
    }
  }

  const referencePrices = Object.fromEntries(Object.keys(ASSETS).map((assetId) => [
    assetId,
    referencePrice(assetId, normalizedObservations.filter((item) => item.assetId === assetId), calculatedAt, nowMs),
  ]));
  const published = Object.values(referencePrices).filter((item) => Number.isFinite(item.price));
  const providers = {
    coinbase: providerState(coinbaseResult, requestTimestamp),
    kraken: providerState(krakenResult, requestTimestamp),
    binance: providerState(binanceResult, requestTimestamp),
  };
  const allProvidersHealthy = Object.values(providers).every((provider) => provider.connection_status === 'LIVE' && provider.last_error === null);
  const payload = {
    schema_version: 'kaufman-market-edge-v1',
    delivery_mode: 'LIVE_EDGE',
    generated_at: calculatedAt,
    processing_ms: Date.now() - startedAt,
    reference_prices: referencePrices,
    stablecoin_fx: { USDT: usdt, USDC: usdc },
    providers,
    thresholds: { fresh_ms: FRESH_MS, stale_ms: 5_000, degraded_ms: 15_000, unavailable_ms: 60_000 },
    status: published.length === 3 && allProvidersHealthy ? 'LIVE' : published.length ? 'DEGRADED' : 'UNAVAILABLE',
  };
  return new Response(JSON.stringify(payload), { status: published.length ? 200 : 503, headers: publicHeaders });
};

