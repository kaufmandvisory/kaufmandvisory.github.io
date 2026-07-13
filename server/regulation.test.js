import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegulationSnapshot, validateRegulationSnapshot } from './regulation.js';

test('publishes complete regulation regimes without demo placeholders', () => {
  const snapshot = buildRegulationSnapshot({}, '2026-07-13T12:00:00.000Z');
  assert.equal(validateRegulationSnapshot(snapshot), true);
  assert.equal(snapshot.data_quality.demo_record_count, 0);
  assert.equal(snapshot.regimes.length, 5);
  assert.equal(snapshot.data_quality.sourced_regime_pct, 100);
  for (const regime of snapshot.regimes) {
    assert.ok(regime.source_ids.length > 0);
    assert.equal(regime.legal_status, 'VERIFIED');
    assert.doesNotMatch(JSON.stringify(regime), /DEMO/i);
  }
});

test('keeps source accessibility separate from legal review', () => {
  const snapshot = buildRegulationSnapshot({
    eu_mica_text: { checked_at: '2026-07-13T12:00:00.000Z', connection_status: 'DEGRADED', http_status: 503 }
  });
  const source = snapshot.sources.find((row) => row.id === 'eu_mica_text');
  const regime = snapshot.regimes.find((row) => row.id === 'mica-union-europea');
  assert.equal(source.connection_status, 'DEGRADED');
  assert.equal(regime.legal_status, 'VERIFIED');
  assert.match(snapshot.review_policy, /accesibilidad, no vigencia jurídica/i);
});

test('records detected source changes without asserting a legal conclusion', () => {
  const snapshot = buildRegulationSnapshot({
    es_cnmv_mica: {
      checked_at: '2026-07-13T12:00:00.000Z',
      connection_status: 'CONNECTED',
      http_status: 200,
      content_fingerprint: 'abc123'
    }
  }, '2026-07-13T12:00:00.000Z', ['es_cnmv_mica']);
  assert.equal(snapshot.data_quality.changes_detected_in_session, 1);
  assert.equal(snapshot.sources.find((row) => row.id === 'es_cnmv_mica').changed_in_session, true);
  assert.equal(snapshot.regimes.find((row) => row.id === 'mica-espana-2026').state, 'TRANSITION_ENDED');
});
