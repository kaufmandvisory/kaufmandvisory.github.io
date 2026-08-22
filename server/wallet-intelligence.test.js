import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWalletIntelligence, validateWalletIntelligence } from './wallet-intelligence.js';

test('wallet intelligence separates application, firmware, advisories and service', async () => {
  const fetchJson = async (url) => {
    if (url.includes('releases/latest')) return { tag_name: 'v1.2.3', published_at: '2026-08-21T00:00:00Z', html_url: 'https://example.com/release', draft: false };
    if (url.includes('security-advisories')) return [];
    if (url.includes('releases.json')) return [{ version: [2, 9, 1], release: '2026-08-01' }];
    if (url.includes('status.json')) return { status: { indicator: 'none', description: 'All Systems Operational' } };
    throw new Error('unexpected URL');
  };
  const snapshot = await buildWalletIntelligence({ fetchJson, receivedAt: '2026-08-22T12:00:00Z' });
  assert.equal(snapshot.products.length, 3);
  assert.equal(snapshot.products.find((row) => row.id === 'trezor').firmware[0].status, 'SIGNED_METADATA_OBSERVED');
  assert.equal(snapshot.products.find((row) => row.id === 'ledger').service.indicator, 'NONE');
  assert.equal(validateWalletIntelligence(snapshot), true);
});
