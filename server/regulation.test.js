import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REGULATORY_SOURCES,
  buildRegulationSnapshot,
  checkRegulatorySource,
  validateRegulationSnapshot
} from './regulation.js';

test('publishes complete regulation regimes without demo placeholders', () => {
  const snapshot = buildRegulationSnapshot({}, '2026-07-13T12:00:00.000Z');
  assert.equal(validateRegulationSnapshot(snapshot), true);
  assert.equal(snapshot.source_contract_version, 'official-public-v2');
  assert.equal(snapshot.data_quality.demo_record_count, 0);
  assert.equal(snapshot.regimes.length, 10);
  assert.equal(snapshot.data_quality.sourced_regime_pct, 100);
  for (const regime of snapshot.regimes) {
    assert.ok(regime.source_ids.length > 0);
    assert.ok(['VERIFIED', 'SOURCE_GROUNDED'].includes(regime.legal_status));
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
  assert.equal(snapshot.legal_review_ledger.status, 'EMPTY');
  assert.equal(snapshot.data_quality.signed_regime_count, 0);
  assert.equal(snapshot.data_quality.pending_signoff_count, 10);
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

test('uses public official documents for sources that reject automated landing-page access', () => {
  const byId = new Map(REGULATORY_SOURCES.map((source) => [source.id, source]));
  assert.match(byId.get('es_cnmv_mica').url, /cnmv\.es\/webservices\/verdocumento/i);
  assert.match(byId.get('mx_fintech_law').url, /sidof\.segob\.gob\.mx\/notas\/5515623/i);
  assert.match(byId.get('mx_fintech_2025_reform').url, /sidof\.segob\.gob\.mx\/notas\/5773097/i);
  assert.match(byId.get('ae_cbuae_payment_tokens').url, /rulebook\.centralbank\.ae\/.+\.pdf$/i);
  for (const source of REGULATORY_SOURCES) assert.match(source.url, /^https:\/\//);
});

test('records the observed public document and its media type', async () => {
  const fetchImpl = async (url) => new Response('official public document', {
    status: 200,
    headers: { 'content-type': 'application/pdf', 'last-modified': 'Mon, 13 Jul 2026 12:00:00 GMT' }
  });
  const health = await checkRegulatorySource(REGULATORY_SOURCES[0], fetchImpl);
  assert.equal(health.connection_status, 'CONNECTED');
  assert.equal(health.content_type, 'application/pdf');
  assert.equal(health.observed_url, REGULATORY_SOURCES[0].url);
  assert.match(health.content_fingerprint, /^[a-f0-9]{64}$/);
});
