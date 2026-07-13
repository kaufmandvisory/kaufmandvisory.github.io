import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFiscalSnapshot, validateFiscalSnapshot } from './fiscal.js';

test('builds a complete fiscal matrix at jurisdiction by event grain', () => {
  const snapshot = buildFiscalSnapshot({}, '2026-07-13T12:00:00.000Z');
  assert.equal(snapshot.schema_version, 'kaufman-fiscal-intelligence-v1');
  assert.equal(snapshot.jurisdictions.length, 8);
  assert.equal(snapshot.events.length, 5);
  assert.equal(snapshot.data_quality.fact_count, 40);
  assert.equal(snapshot.data_quality.facts_with_source_pct, 100);
  assert.equal(snapshot.data_quality.final_tax_liability_calculated, false);
  assert.equal(snapshot.data_quality.indicative_calculation_jurisdictions, 8);
  assert.equal(Object.keys(snapshot.calculation_models).length, 8);
  assert.equal(validateFiscalSnapshot(snapshot), true);
});

test('preserves high-value legal differences instead of flattening rates', () => {
  const snapshot = buildFiscalSnapshot();
  const byId = Object.fromEntries(snapshot.jurisdictions.map((row) => [row.id, row]));
  assert.equal(byId.espana.facts.crypto_swap.trigger, 'Sí');
  assert.equal(byId.portugal.facts.crypto_swap.trigger, 'Diferido bajo condiciones');
  assert.equal(byId['estados-unidos'].facts.crypto_swap.trigger, 'Sí');
  assert.equal(byId['emiratos-arabes-unidos'].facts.sell_fiat.trigger, 'Condicional');
  assert.equal(byId.mexico.facts.sell_fiat.status, 'INTERPRETIVE');
});

test('every fiscal conclusion carries source IDs and a limitation', () => {
  const snapshot = buildFiscalSnapshot();
  const sourceIds = new Set(snapshot.sources.map((source) => source.id));
  for (const jurisdiction of snapshot.jurisdictions) {
    for (const fact of Object.values(jurisdiction.facts)) {
      assert.ok(fact.source_ids.length > 0);
      assert.ok(fact.source_ids.every((id) => sourceIds.has(id)));
      assert.ok(fact.limitation.length > 20);
    }
  }
});

test('source monitoring stays separate from legal review freshness', () => {
  const snapshot = buildFiscalSnapshot({
    es_irpf_crypto: { checked_at: '2026-07-13T10:00:00.000Z', connection_status: 'CONNECTED', http_status: 200 },
    pt_cirs_10: { checked_at: '2026-07-13T10:00:00.000Z', connection_status: 'DEGRADED', http_status: 503 }
  });
  assert.equal(snapshot.data_quality.checked_source_count, 2);
  assert.equal(snapshot.data_quality.reachable_source_pct, 50);
  assert.equal(snapshot.legal_reviewed_at, '2026-07-13');
  assert.match(snapshot.review_policy, /accesibilidad no certifica vigencia/i);
});
