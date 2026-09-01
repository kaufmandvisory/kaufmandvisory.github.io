import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const prefix = 'window.KAUFMAN_BANK_INTELLIGENCE = ';
const raw = await readFile(new URL('../assets/bank-intelligence.js', import.meta.url), 'utf8');
assert.ok(raw.startsWith(prefix), 'asignación global del snapshot bancario inválida');
const snapshot = JSON.parse(raw.slice(prefix.length).replace(/;\s*$/, ''));

assert.equal(snapshot.schema_version, 'kaufman-bank-intelligence-v1');
assert.equal(snapshot.delivery_mode, 'AUTOMATED_WEEKLY_SNAPSHOT');
assert.equal(snapshot.refresh_interval_ms, 7 * 24 * 60 * 60_000);
assert.ok(Number.isFinite(Date.parse(snapshot.generated_at)), 'fecha de generación ausente');
assert.ok(Number.isFinite(Date.parse(snapshot.next_expected_update_at)), 'próxima revisión ausente');
assert.equal(snapshot.banks?.length, 25, 'el ranking debe contener exactamente 25 bancos');
assert.deepEqual(snapshot.banks.map((bank) => bank.rank), Array.from({ length: 25 }, (_, index) => index + 1), 'puestos no contiguos');
assert.equal(new Set(snapshot.banks.map((bank) => bank.id)).size, 25, 'IDs bancarios duplicados');
assert.ok(snapshot.banks.every((bank) => bank.name && Number.isFinite(bank.assets_usd_billions) && bank.assets_usd_billions > 0), 'fila bancaria incompleta');
assert.ok(snapshot.banks.reduce((sum, bank) => sum + bank.assets_usd_billions, 0) > 50_000, 'activos agregados inverosímiles');
assert.match(snapshot.ranking?.url || '', /^https:\/\/www\.spglobal\.com\//, 'fuente primaria del ranking ausente');
assert.match(snapshot.ranking?.transport_url || '', /^https:\/\/en\.wikipedia\.org\/w\/api\.php/, 'transporte reproducible ausente');
assert.ok(['CONNECTED', 'DEGRADED'].includes(snapshot.ranking?.connection_status), 'estado del ranking inválido');
if (snapshot.ranking.connection_status === 'CONNECTED') {
  assert.match(snapshot.ranking.content_fingerprint || '', /^[a-f0-9]{64}$/, 'huella del ranking ausente');
  assert.equal(snapshot.ranking.last_error, null, 'ranking conectado con error simultáneo');
}
assert.equal(snapshot.official_sources?.length, 11, 'registro de fuentes corporativas incompleto');
for (const source of snapshot.official_sources) {
  assert.ok(source.id && source.name && source.url, 'fuente corporativa incompleta');
  assert.ok(['CONNECTED', 'DEGRADED', 'UNAVAILABLE'].includes(source.connection_status), `${source.id}: estado inválido`);
  assert.ok(Number.isFinite(Date.parse(source.checked_at)), `${source.id}: fecha de comprobación ausente`);
  if (source.connection_status === 'CONNECTED') {
    assert.match(source.content_fingerprint || '', /^[a-f0-9]{64}$/, `${source.id}: huella ausente`);
    assert.equal(source.last_error, null, `${source.id}: conectado y con error simultáneo`);
  } else {
    assert.ok(source.last_error, `${source.id}: degradación sin error`);
  }
}
assert.equal(snapshot.data_quality.bank_count, 25, 'métrica de cobertura bancaria incorrecta');
assert.equal(snapshot.data_quality.official_source_count, snapshot.official_sources.length, 'métrica de fuentes incorrecta');

console.log(JSON.stringify({
  status: 'PASS',
  generated_at: snapshot.generated_at,
  edition: snapshot.ranking.edition,
  banks: snapshot.banks.length,
  connected_official_sources: snapshot.data_quality.connected_official_sources
}, null, 2));
