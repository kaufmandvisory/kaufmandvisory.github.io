import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readAssignedJson(path, prefix) {
  const raw = await readFile(path, 'utf8');
  assert.ok(raw.startsWith(prefix), `${path}: asignación global no válida`);
  return JSON.parse(raw.slice(prefix.length).replace(/;\s*$/, ''));
}

const platform = await readAssignedJson(
  new URL('../assets/platform-data.js', import.meta.url),
  'window.KAUFMAN_PLATFORM_DATA = '
);
const daily = await readAssignedJson(
  new URL('../assets/daily-data.js', import.meta.url),
  'window.KAUFMAN_DAILY_DATA = '
);

assert.equal(platform.schema_version, 'kaufman-public-platform-v1');
assert.equal(platform.delivery_mode, 'STATIC_SNAPSHOT');
assert.ok(Date.now() - Date.parse(platform.generated_at) <= 26 * 60 * 60_000, 'snapshot público caducado');

for (const asset of ['bitcoin', 'ethereum', 'solana']) {
  const row = platform.reference_prices?.[asset];
  assert.ok(Number.isFinite(row?.price) && row.price > 0, `${asset}: precio público ausente`);
  assert.equal(row.currency, 'USD', `${asset}: divisa de referencia incorrecta`);
  assert.ok(Number.isFinite(Date.parse(row.provider_timestamp)), `${asset}: timestamp ausente`);
  assert.ok(Array.isArray(row.venues) && row.venues.length > 0, `${asset}: mercados ausentes`);
}

assert.ok(platform.tokenization_markets?.products?.length > 0, 'universo de tokenización vacío');
assert.ok(platform.l2_intelligence?.projects?.length > 0, 'universo L2 vacío');
assert.equal(platform.fiscal_intelligence?.data_quality?.fact_count, 40, 'matriz fiscal incompleta');
assert.equal(platform.regulation_intelligence?.data_quality?.demo_record_count, 0, 'regulación contiene demostraciones');
assert.ok(Number.isFinite(platform.auxiliary?.ethereum_fees?.base_fee_gwei), 'gas Ethereum ausente');
assert.ok(Number.isFinite(platform.auxiliary?.exchange_fees?.maker), 'comisión maker ausente');

assert.equal(daily.home_regulation?.length, 3, 'la portada necesita tres noticias regulatorias');
assert.equal(daily.mining_news?.length, 2, 'la portada necesita dos noticias mineras');
for (const item of [...daily.home_regulation, ...daily.mining_news]) {
  assert.equal(item.language, 'es-ES', `titular no publicado en castellano: ${item.title}`);
  assert.ok(item.title && item.original_title && item.url && item.publisher, 'noticia incompleta');
}

assert.doesNotMatch(JSON.stringify(platform), /"status":"demo"|DEMO · dato no conectado/i);

console.log(JSON.stringify({
  status: 'PASS',
  platform_generated_at: platform.generated_at,
  prices: Object.keys(platform.reference_prices).length,
  tokenization_products: platform.tokenization_markets.products.length,
  l2_projects: platform.l2_intelligence.projects.length,
  fiscal_facts: platform.fiscal_intelligence.data_quality.fact_count,
  regulation_news_es: daily.home_regulation.length,
  mining_news_es: daily.mining_news.length
}, null, 2));
