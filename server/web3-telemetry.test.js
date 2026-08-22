import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeb3Telemetry, validateWeb3Telemetry } from './web3-telemetry.js';

test('web3 telemetry exposes observed dependencies without declaring safety', async () => {
  const fetchJson = async (url, options = {}) => {
    if (url.includes('publicnode')) {
      const calls = JSON.parse(options.body);
      return calls.map((call) => call.method === 'eth_getBlockByNumber'
        ? { id: call.id, result: { number: '0x10', timestamp: '0x65000000' } }
        : call.method === 'eth_syncing' ? { id: call.id, result: false }
        : call.method === 'eth_getCode' ? { id: call.id, result: '0x60016001' }
        : { id: call.id, result: `0x${'0'.repeat(64)}${(100000n * 100000000n).toString(16).padStart(64, '0')}${'0'.repeat(64)}${BigInt(1700000000).toString(16).padStart(64, '0')}${'0'.repeat(64)}` });
    }
    return { tag_name: 'v1.0.0', published_at: '2026-08-20T00:00:00Z', html_url: url };
  };
  const snapshot = await buildWeb3Telemetry({ fetchJson, fetchText: async () => '<html>available</html>'.repeat(10), receivedAt: '2026-08-22T12:00:00Z', l2Intelligence: { generated_at: '2026-08-22T11:00:00Z', projects: [{ name: 'Arbitrum One', stage_label_es: 'Madurez 1', tvs_usd: 1, source_url: 'https://l2beat.com' }] } });
  assert.equal(snapshot.coverage.observed, 7);
  assert.equal(validateWeb3Telemetry(snapshot), true);
});
