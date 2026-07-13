import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from './config.js';
import { classifyAge, computeReferences, median } from './market-core.js';

const config = { ...CONFIG, minimumVolumeUsd24h: 1, minimumDexVolumeUsd24h: 1, divergenceThresholdPct: 2.5 };
const health = {
  coinbase: { connection_status: 'CONNECTED' },
  kraken: { connection_status: 'CONNECTED' },
  binance: { connection_status: 'CONNECTED' }
};

function quote({ provider, asset = 'bitcoin', price, currency = 'USD', age = 100, volume = 10_000_000 }) {
  const now = Date.now();
  return {
    asset_id: asset,
    price,
    currency,
    provider,
    venue: `${provider} test`,
    provider_timestamp: new Date(now - age).toISOString(),
    received_at: new Date(now).toISOString(),
    volume_24h_quote: volume,
    verification_status: 'OBSERVED'
  };
}

test('median handles odd and even sets', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 3]), 2);
  assert.equal(median([]), null);
});

test('freshness boundaries are explicit', () => {
  assert.equal(classifyAge(4_999, config), 'FRESH');
  assert.equal(classifyAge(5_000, config), 'STALE');
  assert.equal(classifyAge(15_001, config), 'DEGRADED');
  assert.equal(classifyAge(60_001, config), 'UNAVAILABLE');
});

test('reference price is the median and removes a clear outlier', () => {
  const now = Date.now();
  const result = computeReferences([
    quote({ provider: 'coinbase', price: 100 }),
    quote({ provider: 'kraken', price: 101 }),
    quote({ provider: 'binance', price: 130 })
  ], health, now, config).references.bitcoin;
  assert.equal(result.price, 100.5);
  assert.deepEqual(result.venues.sort(), ['coinbase test', 'kraken test']);
  assert.equal(result.sources.find((source) => source.provider === 'binance').exclusion_reasons[0], 'DIVERGENCE_THRESHOLD');
});

test('USDT quote requires a fresh independently observed USDT/USD rate', () => {
  const now = Date.now();
  const withoutFx = computeReferences([
    quote({ provider: 'binance', price: 100, currency: 'USDT' })
  ], health, now, config).references.bitcoin;
  assert.equal(withoutFx.price, null);
  assert.ok(withoutFx.sources[0].exclusion_reasons.includes('FX_USDT_UNAVAILABLE'));

  const withFx = computeReferences([
    quote({ provider: 'coinbase', asset: 'usdt', price: 0.99 }),
    quote({ provider: 'binance', price: 100, currency: 'USDT' })
  ], health, now, config).references.bitcoin;
  assert.equal(withFx.price, 99);
});

test('stale price is not silently carried into the reference', () => {
  const now = Date.now();
  const result = computeReferences([
    quote({ provider: 'coinbase', price: 100, age: 5_100 })
  ], health, now, config).references.bitcoin;
  assert.equal(result.price, null);
  assert.equal(result.verification_status, 'UNAVAILABLE');
  assert.equal(result.sources[0].freshness, 'STALE');
});

test('two conflicting venues block publication instead of choosing silently', () => {
  const now = Date.now();
  const result = computeReferences([
    quote({ provider: 'coinbase', price: 100 }),
    quote({ provider: 'kraken', price: 110 })
  ], health, now, config).references.bitcoin;
  assert.equal(result.price, null);
  assert.equal(result.verification_status, 'CONFLICT');
});
