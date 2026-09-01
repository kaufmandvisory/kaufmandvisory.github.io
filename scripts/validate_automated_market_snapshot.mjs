import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const snapshot = JSON.parse(await readFile(new URL('../api/market/snapshot', import.meta.url), 'utf8'));
const age = Date.now() - Date.parse(snapshot.generated_at);

assert.equal(snapshot.delivery_mode, 'AUTOMATED_5_MINUTE_SNAPSHOT');
assert.equal(snapshot.refresh_interval_ms, 5 * 60_000);
assert.equal(snapshot.max_age_ms, 15 * 60_000);
assert.ok(Number.isFinite(age) && age >= 0 && age <= 15 * 60_000, `snapshot automático obsoleto: ${age} ms`);

for (const asset of ['bitcoin', 'ethereum', 'solana']) {
  const row = snapshot.reference_prices?.[asset];
  assert.ok(Number.isFinite(row?.price) && row.price > 0, `${asset}: precio ausente`);
  assert.equal(row.currency, 'USD', `${asset}: divisa incorrecta`);
  assert.ok(Number.isFinite(Date.parse(row.provider_timestamp)), `${asset}: timestamp de proveedor ausente`);
  assert.ok(Number.isFinite(Date.parse(row.received_at)), `${asset}: hora de recepción ausente`);
  assert.ok(Array.isArray(row.venues) && row.venues.length > 0, `${asset}: mercados ausentes`);
  assert.ok(row.methodology, `${asset}: metodología ausente`);
  assert.ok(row.confidence, `${asset}: confianza ausente`);
  assert.ok(row.verification_status, `${asset}: verificación ausente`);
}

console.log(JSON.stringify({ status: 'PASS', generated_at: snapshot.generated_at, age_ms: age }, null, 2));
