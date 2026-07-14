import test from 'node:test';
import assert from 'node:assert/strict';
import { providerState } from '../.netlify-functions/market-snapshot.mjs';

const timestamp = '2026-07-14T10:00:00.000Z';
const observation = { providerTimestamp: timestamp };

test('a provider with observations and partial errors is DEGRADED, never LIVE', () => {
  const health = providerState({
    status: 'fulfilled',
    value: { observations: [observation], errors: ['SOL-USD: HTTP 404'] }
  }, timestamp);
  assert.equal(health.connection_status, 'DEGRADED');
  assert.equal(health.last_error, 'SOL-USD: HTTP 404');
});

test('LIVE provider health cannot retain a last error', () => {
  const health = providerState({
    status: 'fulfilled',
    value: { observations: [observation], errors: [] }
  }, timestamp);
  assert.equal(health.connection_status, 'LIVE');
  assert.equal(health.last_error, null);
});

