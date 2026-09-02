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
  assert.equal(snapshot.regimes.length, 29);
  assert.equal(snapshot.data_quality.sourced_regime_pct, 100);
  for (const regime of snapshot.regimes) {
    assert.ok(regime.source_ids.length > 0);
    assert.ok(['VERIFIED', 'SOURCE_GROUNDED'].includes(regime.legal_status));
    assert.ok(regime.framework_type && regime.market_access);
    for (const key of ['applies_to', 'does_not_apply_to', 'regulated_activities', 'core_obligations', 'verification_steps', 'activity_tags']) {
      assert.ok(Array.isArray(regime[key]) && regime[key].length > 0, `${regime.id}: missing ${key}`);
    }
    assert.doesNotMatch(JSON.stringify(regime), /DEMO/i);
  }
});

test('keeps material differences between comparable jurisdictions', () => {
  const snapshot = buildRegulationSnapshot({}, '2026-09-02T12:00:00.000Z');
  const spain = snapshot.regimes.find((row) => row.id === 'mica-espana-2026');
  const uk = snapshot.regimes.find((row) => row.id === 'uk-cryptoassets');
  assert.match(spain.market_access, /autorización MiCA/i);
  assert.match(uk.market_access, /registro MLR/i);
  assert.notDeepEqual(spain.does_not_apply_to, uk.does_not_apply_to);
  assert.ok(uk.activity_tags.includes('marketing'));
  assert.ok(spain.activity_tags.includes('issuer'));
});

test('covers material Latin American, Asian, African, Israeli and Russian crypto jurisdictions', () => {
  const snapshot = buildRegulationSnapshot({}, '2026-09-02T12:00:00.000Z');
  const ids = new Set(snapshot.regimes.map((row) => row.id));
  for (const id of [
    'brazil-vasp', 'argentina-psav', 'el-salvador-psad', 'chile-fintech-tokenized',
    'colombia-no-general-license', 'uruguay-psav', 'peru-psav-aml', 'singapore-dpt',
    'south-korea-vasp', 'thailand-digital-assets', 'indonesia-ojk-crypto',
    'malaysia-digital-assets', 'philippines-vasp', 'kazakhstan-aifc-datf',
    'panama-no-general-vasp', 'costa-rica-no-general-vasp',
    'israel-financial-asset-services', 'russia-crypto-market-2026', 'nigeria-sec-digital-assets'
  ]) assert.ok(ids.has(id), `missing ${id}`);
});

test('publishes the regulatory matrix in Spanish alphabetical order', () => {
  const snapshot = buildRegulationSnapshot({}, '2026-09-02T12:00:00.000Z');
  const jurisdictions = snapshot.regimes.map((row) => row.jurisdiction);
  const ordered = [...jurisdictions].sort((left, right) => left.localeCompare(right, 'es', { sensitivity: 'base' }));
  assert.deepEqual(jurisdictions, ordered);
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
  assert.equal(snapshot.data_quality.pending_signoff_count, 29);
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

test('retries an official source with a browser user agent when the monitor identity is rejected', async () => {
  let calls = 0;
  const fetchImpl = async (_url, options) => {
    calls += 1;
    const userAgent = options.headers['user-agent'];
    return userAgent.includes('KaufmanRegulationMonitor')
      ? new Response('blocked', { status: 403 })
      : new Response('official public document', { status: 200, headers: { 'content-type': 'text/html' } });
  };
  const health = await checkRegulatorySource(REGULATORY_SOURCES[0], fetchImpl);
  assert.equal(health.connection_status, 'CONNECTED');
  assert.equal(calls, 2);
});
