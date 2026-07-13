import { ASSETS, CONFIG } from './config.js';

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function classifyAge(ageMs, config = CONFIG) {
  if (!Number.isFinite(ageMs) || ageMs > config.unavailableMs) return 'UNAVAILABLE';
  if (ageMs > config.degradedMs) return 'DEGRADED';
  if (ageMs >= config.freshMs) return 'STALE';
  return 'FRESH';
}

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function quoteAge(quote, nowMs) {
  if (!quote.provider_timestamp) return null;
  const timestamp = Date.parse(quote.provider_timestamp);
  return Number.isFinite(timestamp) ? Math.max(0, nowMs - timestamp) : null;
}

function preliminaryCandidate(quote, fxRates, providerHealth, nowMs, config) {
  const price = finitePositive(quote.price);
  const ageMs = quoteAge(quote, nowMs);
  const status = classifyAge(ageMs, config);
  const health = providerHealth[quote.provider];
  const connectionHealthy = health?.connection_status === 'CONNECTED';
  const currency = String(quote.currency || '').toUpperCase();
  const fx = currency === 'USD' ? 1 : fxRates[currency]?.price;
  const fxFresh = currency === 'USD' || fxRates[currency]?.verification_status === 'VERIFIED';
  const volumeQuote = finitePositive(quote.volume_24h_quote);
  const volumeUsd = volumeQuote && finitePositive(fx) ? volumeQuote * fx : null;
  const minVolume = quote.provider === 'dexscreener' ? config.minimumDexVolumeUsd24h : config.minimumVolumeUsd24h;
  const exclusions = [];

  if (!price) exclusions.push('INVALID_PRICE');
  if (!quote.provider_timestamp) exclusions.push('TIMESTAMP_MISSING');
  else if (status !== 'FRESH') exclusions.push(`TIMESTAMP_${status}`);
  if (!connectionHealthy) exclusions.push('CONNECTION_DEGRADED');
  if (!fxFresh || !finitePositive(fx)) exclusions.push(`FX_${currency}_UNAVAILABLE`);
  if (!volumeUsd || volumeUsd < minVolume) exclusions.push('VOLUME_INSUFFICIENT');

  return {
    ...quote,
    age_ms: ageMs,
    freshness: status,
    normalized_price_usd: price && finitePositive(fx) ? price * fx : null,
    normalized_volume_usd_24h: volumeUsd,
    fx_rate: finitePositive(fx),
    eligible_pre_divergence: exclusions.length === 0,
    exclusion_reasons: exclusions
  };
}

function confidenceFor(count, maxDivergencePct) {
  if (count >= 3 && maxDivergencePct <= 0.5) return 'HIGH';
  if (count >= 2) return 'MEDIUM';
  if (count === 1) return 'LOW';
  return 'NONE';
}

function aggregateAsset(assetId, quotes, fxRates, providerHealth, nowMs, config) {
  const reviewed = quotes.map((quote) => preliminaryCandidate(quote, fxRates, providerHealth, nowMs, config));
  const candidates = reviewed.filter((quote) => quote.eligible_pre_divergence);
  const provisional = median(candidates.map((quote) => quote.normalized_price_usd));
  let conflict = false;

  if (candidates.length === 2 && provisional) {
    const spreadPct = Math.abs(candidates[0].normalized_price_usd - candidates[1].normalized_price_usd) / provisional * 100;
    conflict = spreadPct > config.divergenceThresholdPct;
  }

  const included = [];
  for (const quote of candidates) {
    const divergencePct = provisional ? Math.abs(quote.normalized_price_usd - provisional) / provisional * 100 : 0;
    quote.divergence_pct = divergencePct;
    if (conflict || divergencePct > config.divergenceThresholdPct) {
      quote.exclusion_reasons.push(conflict ? 'DIVERGENCE_CONFLICT' : 'DIVERGENCE_THRESHOLD');
    } else {
      included.push(quote);
    }
  }

  const price = median(included.map((quote) => quote.normalized_price_usd));
  const oldestTimestamp = included.length
    ? Math.min(...included.map((quote) => Date.parse(quote.provider_timestamp)))
    : null;
  const ageMs = oldestTimestamp ? Math.max(0, nowMs - oldestTimestamp) : null;
  const divergences = included.map((quote) => price ? Math.abs(quote.normalized_price_usd - price) / price * 100 : 0);
  const maxDivergencePct = divergences.length ? Math.max(...divergences) : null;
  const venues = included.map((quote) => quote.venue);
  const verificationStatus = included.length >= 2 ? 'VERIFIED' : included.length === 1 ? 'SINGLE_SOURCE' : conflict ? 'CONFLICT' : 'UNAVAILABLE';

  return {
    asset_id: assetId,
    symbol: ASSETS[assetId]?.symbol || assetId.toUpperCase(),
    price,
    currency: 'USD',
    provider_timestamp: oldestTimestamp ? new Date(oldestTimestamp).toISOString() : null,
    received_at: new Date(nowMs).toISOString(),
    age_ms: ageMs,
    freshness: price ? classifyAge(ageMs, config) : 'UNAVAILABLE',
    venues,
    methodology: {
      name: 'Kaufman Reference Price v1',
      aggregation: 'median',
      eligible_observation: 'timestamp < 5s, conexión sana, volumen suficiente y divergencia dentro del umbral',
      stablecoin_conversion: 'tipo USD fresco e independiente; nunca paridad asumida',
      divergence_threshold_pct: config.divergenceThresholdPct,
      minimum_volume_usd_24h: config.minimumVolumeUsd24h
    },
    confidence: confidenceFor(included.length, maxDivergencePct ?? Infinity),
    verification_status: verificationStatus,
    metrics: {
      included_venues: included.length,
      observed_venues: reviewed.length,
      max_divergence_pct: maxDivergencePct,
      mean_divergence_pct: divergences.length ? divergences.reduce((sum, value) => sum + value, 0) / divergences.length : null
    },
    sources: reviewed.map((quote) => ({
      provider: quote.provider,
      venue: quote.venue,
      price: quote.price,
      currency: quote.currency,
      normalized_price_usd: quote.normalized_price_usd,
      provider_timestamp: quote.provider_timestamp,
      received_at: quote.received_at,
      age_ms: quote.age_ms,
      freshness: quote.freshness,
      volume_usd_24h: quote.normalized_volume_usd_24h,
      divergence_pct: quote.divergence_pct ?? null,
      included: included.includes(quote),
      exclusion_reasons: quote.exclusion_reasons,
      verification_status: quote.verification_status || 'OBSERVED'
    }))
  };
}

function directStableReference(currency, quotes, providerHealth, nowMs, config) {
  const assetId = currency.toLowerCase();
  const direct = quotes.filter((quote) => quote.asset_id === assetId && quote.currency === 'USD');
  const reference = aggregateAsset(assetId, direct, {}, providerHealth, nowMs, config);
  return {
    ...reference,
    verification_status: reference.venues.length >= 1 ? 'VERIFIED' : reference.verification_status
  };
}

export function computeReferences(rawQuotes, providerHealth, nowMs = Date.now(), config = CONFIG) {
  const quotes = [...rawQuotes];
  const stablecoins = {
    USDT: directStableReference('USDT', quotes, providerHealth, nowMs, config),
    USDC: directStableReference('USDC', quotes, providerHealth, nowMs, config)
  };
  const fxRates = Object.fromEntries(Object.entries(stablecoins).map(([currency, reference]) => [currency, reference]));
  const references = {};
  for (const assetId of ['bitcoin', 'ethereum', 'solana']) {
    references[assetId] = aggregateAsset(assetId, quotes.filter((quote) => quote.asset_id === assetId), fxRates, providerHealth, nowMs, config);
  }
  return { references, stablecoins };
}
