import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTokenizationSnapshot } from './tokenization.js';

const protocols = [
  {
    name: 'Treasury A', slug: 'treasury-a', category: 'RWA', tvl: 100,
    tags: ['Treasury Bills'], chains: ['Ethereum', 'Solana'],
    chainTvls: { Ethereum: 60, Solana: 40 }, change_7d: 2,
    url: 'https://issuer.example/a', tvlCodePath: 'https://github.com/example/a'
  },
  {
    name: 'Credit B', slug: 'credit-b', category: 'RWA', tvl: 50,
    tags: ['Private Credit', 'Other Fixed Income'], chains: ['Ethereum'],
    chainTvls: { Ethereum: 50 }, change_7d: -1
  },
  { name: 'Bad zero', category: 'RWA', tvl: 0, chainTvls: {} },
  { name: 'Bad representation', category: 'RWA', tvl: 999, misrepresentedTokens: true },
  { name: 'RWA loan', category: 'RWA Lending', tvl: 25 }
];

const stablecoins = {
  peggedAssets: [
    {
      name: 'USD One', pegType: 'peggedUSD', price: 0.99,
      circulating: { peggedUSD: 1000 }, circulatingPrevDay: { peggedUSD: 900 },
      chainCirculating: { Ethereum: { current: { peggedUSD: 700 } }, Solana: { current: { peggedUSD: 300 } } }
    },
    { name: 'No price', pegType: 'peggedUSD', price: null, circulating: { peggedUSD: 200 } },
    { name: 'EUR', pegType: 'peggedEUR', price: 1.1, circulating: { peggedEUR: 500 } }
  ]
};

test('builds a deduplicated global RWA universe and excludes unsafe rows', () => {
  const result = buildTokenizationSnapshot(protocols, stablecoins, '2026-07-13T10:00:00.000Z');
  assert.equal(result.schema_version, 'kaufman-tokenization-markets-v2');
  assert.equal(result.kpis.tracked_rwa_tvl_usd, 150);
  assert.equal(result.coverage.rwa_protocols, 2);
  assert.equal(result.coverage.excluded_rwa_records, 2);
  assert.equal(result.kpis.rwa_lending_tvl_usd, 25);
  assert.equal(result.verification_status, 'SOURCE_OBSERVED');
  assert.equal(result.products.length, 2);
  assert.equal(result.products[0].verification_status, 'AGGREGATOR_OBSERVED');
});

test('does not assume stablecoin parity and excludes missing prices', () => {
  const result = buildTokenizationSnapshot(protocols, stablecoins);
  assert.equal(result.kpis.usd_stablecoin_value_usd, 990);
  assert.equal(result.coverage.excluded_stablecoin_records, 1);
  assert.equal(result.stablecoin_networks[0].name, 'Ethereum');
  assert.equal(result.stablecoin_networks[0].value_usd, 693);
});

test('keeps segment overlaps explicit and computes network distribution', () => {
  const result = buildTokenizationSnapshot(protocols, stablecoins);
  assert.equal(result.segments.find((row) => row.tag === 'Treasury Bills').value_usd, 100);
  assert.match(result.methodology.segment_warning, /no deben sumarse/i);
  assert.equal(result.networks.find((row) => row.name === 'Ethereum').value_usd, 110);
  assert.equal(result.networks.find((row) => row.name === 'Solana').value_usd, 40);
  assert.equal(result.ratios.top_5_concentration_pct, 100);
  assert.equal(result.ratios.network_allocation_coverage_pct, 100);
});

test('normalizes raw chain breakdowns so network totals reconcile to product TVL', () => {
  const inconsistent = protocols.map((protocol) => protocol.slug === 'treasury-a'
    ? { ...protocol, chainTvls: { Ethereum: 120, Solana: 80, 'Ethereum-staking': 999, borrowed: 999, pool2: 999 } }
    : protocol);
  const result = buildTokenizationSnapshot(inconsistent, stablecoins);
  assert.equal(result.networks.find((row) => row.name === 'Ethereum').value_usd, 110);
  assert.equal(result.networks.find((row) => row.name === 'Solana').value_usd, 40);
  assert.equal(result.data_quality.raw_chain_breakdown_mismatch_records, 1);
  assert.ok(!result.networks.some((row) => /staking|borrowed|pool2/i.test(row.name)));
  assert.match(result.methodology.network_method, /normalizan/i);
});

test('publishes grounded automated analysis without an external language model', () => {
  const result = buildTokenizationSnapshot(protocols, stablecoins);
  assert.equal(result.analysis_engine.uses_external_llm, false);
  assert.equal(result.analysis_engine.mode, 'DETERMINISTIC_SOURCE_GROUNDED');
  assert.ok(result.analysis_engine.insights.length >= 3);
  assert.ok(result.analysis_engine.insights.every((insight) => insight.statement && insight.methodology && insight.evidence));
  assert.equal(result.data_quality.adapter_link_coverage_pct, 50);
});

test('rejects incomplete provider responses instead of inventing output', () => {
  assert.throws(() => buildTokenizationSnapshot({}, stablecoins), /not an array/);
  assert.throws(() => buildTokenizationSnapshot(protocols, {}), /incomplete/);
});
