import test from 'node:test';
import assert from 'node:assert/strict';
import { selectDexPair, verifyDexPair } from './dexscreener.js';

const asset = {
  id: 'ethereum',
  name: 'Wrapped Ether',
  chain: 'ethereum',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
};

const pair = {
  chainId: 'ethereum',
  dexId: 'uniswap',
  pairAddress: '0xpool',
  url: 'https://dexscreener.com/ethereum/0xpool',
  baseToken: { address: asset.address, symbol: 'WETH' },
  quoteToken: { address: '0xusdc', symbol: 'USDC' },
  priceUsd: '1800',
  volume: { h24: 80_000_000 },
  liquidity: { usd: 90_000_000 },
  txns: { m5: { buys: 3, sells: 2 } }
};

test('selects a pool only when chain, contract and quote asset match', () => {
  const wrong = { ...pair, pairAddress: '0xwrong', baseToken: { address: '0xother', symbol: 'WETH' }, liquidity: { usd: 100_000_000 } };
  assert.equal(selectDexPair(asset, [wrong, pair]), pair);
});

test('verifies the DEX observation through both endpoints and Kaufman reference', () => {
  const result = verifyDexPair({
    asset,
    pair,
    confirmation: { ...pair, priceUsd: '1800.5' },
    receivedAt: '2026-07-13T15:00:01.000Z',
    sourceResponseAt: 'Mon, 13 Jul 2026 15:00:00 GMT',
    confirmationResponseAt: 'Mon, 13 Jul 2026 15:00:01 GMT',
    referencePriceUsd: 1799
  });
  assert.equal(result.verification_status, 'VERIFIED');
  assert.equal(result.identity, `ethereum:${asset.address.toLowerCase()}`);
  assert.equal(result.provider_timestamp, null);
  assert.equal(result.exact_trade_timestamp_available, false);
  assert.equal(result.verification_checks.contract_match, true);
  assert.ok(result.reference_deviation_pct < 2.5);
});

test('blocks a DEX row when the confirmation endpoint disagrees', () => {
  const result = verifyDexPair({
    asset,
    pair,
    confirmation: { ...pair, pairAddress: '0xdifferent', priceUsd: '1900' },
    receivedAt: '2026-07-13T15:00:01.000Z',
    sourceResponseAt: 'Mon, 13 Jul 2026 15:00:00 GMT',
    confirmationResponseAt: 'Mon, 13 Jul 2026 15:00:01 GMT',
    referencePriceUsd: 1800
  });
  assert.equal(result.verification_status, 'REVIEW_REQUIRED');
  assert.equal(result.verification_checks.pair_address_match, false);
});
