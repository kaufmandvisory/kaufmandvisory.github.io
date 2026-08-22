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
const staticMarketApi = Object.fromEntries(await Promise.all(
  ['snapshot', 'context', 'gas', 'stream'].map(async (name) => [
    name,
    JSON.parse(await readFile(new URL(`../api/market/${name}`, import.meta.url), 'utf8'))
  ])
));

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

assert.equal(platform.onchain_pools?.length, 3, 'cobertura DEX incompleta');
for (const pool of platform.onchain_pools) {
  assert.equal(pool.verification_status, 'VERIFIED', `${pool.identity}: observación DEX no verificada`);
  assert.equal(pool.identity, `${pool.chain_id}:${pool.contract_address.toLowerCase()}`, `${pool.identity}: identidad onchain incorrecta`);
  assert.ok(Number.isFinite(Date.parse(pool.source_response_at)), `${pool.identity}: hora de respuesta ausente`);
  assert.ok(Number.isFinite(Date.parse(pool.provider_timestamp)), `${pool.identity}: hora onchain ausente`);
  assert.equal(pool.exact_trade_timestamp_available, true, `${pool.identity}: contrato temporal incorrecto`);
  assert.equal(pool.onchain_evidence?.verification_status, 'CHAIN_TRADE_VERIFIED', `${pool.identity}: evidencia onchain ausente`);
  assert.match(pool.onchain_evidence?.evidence_url || '', /^https:\/\//, `${pool.identity}: enlace de transacción ausente`);
  assert.ok(Object.entries(pool.verification_checks).filter(([key]) => key !== 'reference_price_match').every(([, value]) => value === true), `${pool.identity}: falló el doble contraste DEX`);
  assert.equal(pool.verification_checks.reference_price_match, true, `${pool.identity}: precio DEX divergente frente a Kaufman`);
}

assert.ok(platform.tokenization_markets?.products?.length > 0, 'universo de tokenización vacío');
assert.ok(platform.l2_intelligence?.projects?.length > 0, 'universo L2 vacío');
assert.ok(platform.l2_intelligence.projects.every((project) => /^https:\/\/l2beat\.com\/static\/icons\/[a-z0-9-]+\.[a-f0-9]+\.(?:png|svg|webp)$/i.test(project.logo_url || '')), 'logotipos L2 incompletos o no versionados');
assert.equal(platform.wallet_intelligence?.schema_version, 'kaufman-wallet-intelligence-v1', 'contrato de wallets ausente');
assert.equal(platform.wallet_intelligence?.products?.length, 3, 'releases oficiales de wallets incompletas');
for (const product of platform.wallet_intelligence.products) {
  assert.equal(product.verification_status, 'OFFICIAL_RELEASE_OBSERVED', `${product.id}: release no observada`);
  assert.ok(product.version && Number.isFinite(Date.parse(product.published_at)), `${product.id}: versión o fecha ausente`);
  assert.match(product.source_url || '', /^https:\/\/github\.com\//, `${product.id}: fuente de release no oficial`);
}
assert.equal(platform.fiscal_intelligence?.data_quality?.fact_count, 40, 'matriz fiscal incompleta');
assert.equal(Object.keys(platform.fiscal_intelligence?.calculation_models || {}).length, 8, 'cobertura de cálculo fiscal incompleta');
assert.equal(platform.fiscal_intelligence?.data_quality?.indicative_calculation_jurisdictions, 8, 'el motor fiscal no cubre las ocho jurisdicciones');
assert.equal(platform.regulation_intelligence?.data_quality?.demo_record_count, 0, 'regulación contiene demostraciones');
assert.equal(platform.regulation_intelligence?.source_contract_version, 'official-public-v2', 'contrato regulatorio público desactualizado');
assert.equal(
  platform.regulation_intelligence?.data_quality?.reachable_source_count,
  platform.regulation_intelligence?.data_quality?.source_count,
  'regulación contiene fuentes oficiales inaccesibles'
);
for (const source of platform.regulation_intelligence.sources) {
  assert.equal(source.connection_status, 'CONNECTED', `${source.id}: fuente regulatoria no conectada`);
  assert.equal(source.access_method, 'PUBLIC_OFFICIAL_SOURCE', `${source.id}: acceso oficial público no acreditado`);
  assert.match(source.content_fingerprint || '', /^[a-f0-9]{64}$/, `${source.id}: huella de contenido ausente`);
}
assert.ok(Number.isFinite(platform.auxiliary?.ethereum_fees?.base_fee_gwei), 'gas Ethereum ausente');
assert.ok(Number.isFinite(platform.auxiliary?.exchange_fees?.maker), 'comisión maker ausente');
assert.equal(platform.auxiliary?.exchange_fees?.entries?.length, 5, 'comparador de exchanges incompleto');
assert.equal(platform.auxiliary.exchange_fees.entries.filter((row) => row.availability === 'PUBLIC_EXACT').length, 2, 'tarifas públicas exactas no separadas');
assert.ok(platform.auxiliary.exchange_fees.entries.filter((row) => row.availability === 'ACCOUNT_REQUIRED').every((row) => row.maker_pct === null && row.taker_pct === null), 'tarifa de cuenta inventada');

assert.equal(daily.home_regulation?.length, 3, 'la portada necesita tres noticias regulatorias');
assert.equal(daily.mining_news?.length, 2, 'la portada necesita dos noticias mineras');
for (const item of [...daily.home_regulation, ...daily.mining_news]) {
  assert.equal(item.language, 'es-ES', `titular no publicado en castellano: ${item.title}`);
  assert.ok(item.title && item.original_title && item.url && item.publisher, 'noticia incompleta');
  assert.ok(['sourcechecked', 'verified'].includes(item.status), `señal sin contraste: ${item.title}`);
  assert.ok(
    ['SOURCE_METADATA_VERIFIED', 'OFFICIAL_SOURCE_MONITORED', 'CALCULATED_FROM_PUBLIC_SOURCES'].includes(item.verification_status),
    `contrato de verificación ausente: ${item.title}`
  );
  assert.ok(Number.isFinite(Date.parse(item.source_observed_at)), `observación de fuente ausente: ${item.title}`);
  assert.ok(Date.now() - Date.parse(item.source_observed_at) <= 26 * 60 * 60_000, `observación superior a 24 horas: ${item.title}`);
  if (item.verification_status === 'SOURCE_METADATA_VERIFIED') {
    assert.ok(Date.now() - Date.parse(item.published) <= 25 * 60 * 60_000, `titular periodístico antiguo: ${item.title}`);
  }
  assert.ok(item.verification_method, `metodología periodística ausente: ${item.title}`);
}

assert.doesNotMatch(JSON.stringify(platform), /"status":"demo"|DEMO · dato no conectado/i);
for (const name of ['snapshot', 'context', 'gas']) {
  assert.equal(staticMarketApi[name].delivery_mode, 'STATIC_DAILY_FALLBACK', `${name}: el respaldo estático se anuncia como tiempo real`);
  assert.equal(staticMarketApi[name].status, 'SNAPSHOT_ONLY', `${name}: estado estático ambiguo`);
  assert.match(staticMarketApi[name].live_endpoint || '', /^https:\/\//, `${name}: endpoint vivo ausente`);
}
assert.equal(staticMarketApi.stream.delivery_mode, 'STATIC_POLLING', 'stream: contrato de transporte inválido');
assert.ok(staticMarketApi.stream.same_origin_fallbacks?.length === 3, 'stream: respaldos same-origin incompletos');

console.log(JSON.stringify({
  status: 'PASS',
  platform_generated_at: platform.generated_at,
  prices: Object.keys(platform.reference_prices).length,
  tokenization_products: platform.tokenization_markets.products.length,
  l2_projects: platform.l2_intelligence.projects.length,
  wallet_releases: platform.wallet_intelligence.products.length,
  fiscal_facts: platform.fiscal_intelligence.data_quality.fact_count,
  regulation_news_es: daily.home_regulation.length,
  mining_news_es: daily.mining_news.length
}, null, 2));
