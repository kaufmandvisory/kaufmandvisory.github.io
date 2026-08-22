import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIsharesIssuerObservation, reconcileEtfFlows } from './etf-flows.js';

test('extracts issuer shares and only computes a delta across different dates', () => {
  const html = `${'x'.repeat(100_000)}&quot;sharesOutstanding&quot;:{&quot;formattedValue&quot;:&quot;1,250,000&quot;,&quot;formattedAsOfDate&quot;:&quot;Aug 21, 2026&quot;}`;
  const row = buildIsharesIssuerObservation({ html, asset: 'bitcoin', ticker: 'IBIT', url: 'https://example.com', previous: { shares_outstanding: 1_000_000, as_of_date: '2026-08-20' } });
  assert.equal(row.shares_change, 250_000);
  assert.equal(row.creation_redemption_direction, 'CREATION');
});

test('does not claim reconciliation when only an issuer baseline exists', () => {
  const aggregate = { source: 'CoinFlows', assets: { bitcoin: { latest_net_flow_usd: 10, latest_date: '2026-08-21' } } };
  const result = reconcileEtfFlows(aggregate, [{ asset: 'bitcoin', creation_redemption_direction: 'BASELINE' }]);
  assert.equal(result.assets.bitcoin.publishable_as_reconciled, false);
  assert.equal(result.reconciliation.status, 'BASELINE_ESTABLISHED');
});
