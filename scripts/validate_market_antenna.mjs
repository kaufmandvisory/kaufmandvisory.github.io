import assert from 'node:assert/strict';

const baseUrl = process.env.ANTENNA_URL || 'http://127.0.0.1:4173';
const response = await fetch(`${baseUrl}/api/market/snapshot`, { signal: AbortSignal.timeout(10_000) });
assert.equal(response.status, 200, `snapshot HTTP ${response.status}`);
const snapshot = await response.json();
assert.equal(snapshot.schema_version, 'kaufman-market-antenna-v1');

const requiredPriceFields = [
  'price', 'currency', 'provider_timestamp', 'received_at', 'age_ms',
  'venues', 'methodology', 'confidence', 'verification_status'
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

let published = 0;
for (const [assetId, reference] of Object.entries(snapshot.reference_prices)) {
  for (const field of requiredPriceFields) assert.ok(field in reference, `${assetId}: missing ${field}`);
  assert.equal(reference.currency, 'USD', `${assetId}: reference currency`);
  assert.ok(Array.isArray(reference.venues), `${assetId}: venues must be an array`);
  assert.equal(reference.methodology.aggregation, 'median', `${assetId}: aggregation`);

  for (const source of reference.sources) {
    for (const field of ['price', 'currency', 'provider_timestamp', 'received_at', 'age_ms', 'venue']) {
      assert.ok(field in source, `${assetId}/${source.provider}: missing ${field}`);
    }
    if (!source.included) continue;
    assert.equal(source.freshness, 'FRESH', `${assetId}/${source.provider}: included source is not fresh`);
    assert.ok(source.age_ms < snapshot.thresholds.fresh_ms, `${assetId}/${source.provider}: included source is stale`);
    assert.ok(source.volume_usd_24h >= snapshot.thresholds.minimum_volume_usd_24h, `${assetId}/${source.provider}: low volume`);
    assert.equal(source.exclusion_reasons.length, 0, `${assetId}/${source.provider}: included with exclusion`);
    assert.equal(snapshot.providers[source.provider]?.connection_status, 'CONNECTED', `${assetId}/${source.provider}: degraded provider included`);
    assert.ok(source.divergence_pct <= snapshot.thresholds.divergence_pct, `${assetId}/${source.provider}: divergence breach`);
  }

  if (reference.price === null) {
    assert.equal(reference.freshness, 'UNAVAILABLE', `${assetId}: null price must be unavailable`);
    continue;
  }
  published += 1;
  assert.equal(reference.freshness, 'FRESH', `${assetId}: published reference must be fresh`);
  assert.ok(reference.age_ms < snapshot.thresholds.fresh_ms, `${assetId}: published reference age`);
  const included = reference.sources.filter((source) => source.included).map((source) => source.normalized_price_usd);
  assert.ok(included.length > 0, `${assetId}: price without included venue`);
  const recomputed = median(included);
  assert.ok(Math.abs(recomputed - reference.price) < 1e-9, `${assetId}: median mismatch`);
  assert.deepEqual(reference.venues, reference.sources.filter((source) => source.included).map((source) => source.venue), `${assetId}: venue mismatch`);
}
assert.ok(published >= 1, 'no fresh reference price available during validation');

for (const [currency, reference] of Object.entries(snapshot.stablecoin_fx)) {
  for (const source of reference.sources.filter((item) => item.included)) {
    assert.equal(source.currency, 'USD', `${currency}: FX must originate in a direct USD market`);
  }
}

for (const pool of snapshot.onchain_pools) {
  assert.equal(pool.identity, `${pool.chain_id}:${pool.contract_address.toLowerCase()}`, 'onchain identity mismatch');
  assert.equal(pool.provider_timestamp, null, `${pool.identity}: DEX timestamp must not be invented`);
  assert.equal(pool.verification_status, 'TIMESTAMP_UNVERIFIED', `${pool.identity}: DEX verification status`);
}

for (const metadata of Object.values(snapshot.metadata)) {
  assert.equal(metadata.usage, 'METADATA_ONLY', `${metadata.id}: CoinGecko usage`);
  assert.ok(!('current_price' in metadata), `${metadata.id}: CoinGecko price leaked into metadata`);
  assert.ok(Number.isFinite(Date.parse(metadata.last_updated_at)), `${metadata.id}: invalid last_updated_at`);
  if (metadata.verification_status === 'VERIFIED') {
    assert.ok(Date.now() - Date.parse(metadata.last_updated_at) <= 15 * 60_000, `${metadata.id}: stale CoinGecko metadata verified`);
  }
}

const tokenization = snapshot.tokenization_markets;
assert.ok(tokenization, 'tokenization market snapshot missing');
assert.equal(tokenization.schema_version, 'kaufman-tokenization-markets-v2');
assert.equal(tokenization.verification_status, 'SOURCE_OBSERVED');
assert.ok(Date.now() - Date.parse(tokenization.received_at) <= snapshot.thresholds.tokenization_max_age_ms, 'tokenization snapshot is stale');
for (const [name, value] of Object.entries(tokenization.kpis)) {
  assert.ok(Number.isFinite(value) && value > 0, `tokenization KPI ${name} is invalid`);
}
assert.ok(tokenization.coverage.rwa_protocols > 0, 'RWA universe is empty');
assert.ok(tokenization.coverage.networks > 0, 'RWA network coverage is empty');
assert.ok(tokenization.segments.every((segment) => segment.methodology.includes('solaparse')), 'segment overlap is not disclosed');
assert.match(tokenization.methodology.segment_warning, /no deben sumarse/i);
assert.ok(tokenization.sources.every((source) => !/coingecko/i.test(source.name)), 'CoinGecko leaked into tokenization source connector');
const topFive = tokenization.leaders.slice(0, 5).reduce((sum, row) => sum + row.value_usd, 0);
const concentration = topFive / tokenization.kpis.tracked_rwa_tvl_usd * 100;
assert.ok(Math.abs(concentration - tokenization.ratios.top_5_concentration_pct) < 0.02, 'top-5 concentration mismatch');
assert.ok(tokenization.networks.every((row) => Number.isFinite(row.value_usd) && row.value_usd > 0), 'invalid RWA network row');
assert.equal(tokenization.products.length, tokenization.coverage.rwa_protocols, 'tokenization product coverage mismatch');
assert.equal(new Set(tokenization.products.map((product) => product.id)).size, tokenization.products.length, 'tokenization product IDs are not unique');
assert.ok(tokenization.products.every((product) => product.verification_status === 'AGGREGATOR_OBSERVED'), 'invalid product verification status');
assert.ok(tokenization.products.every((product) => Number.isFinite(product.value_usd) && product.value_usd > 0), 'invalid tokenization product value');
assert.equal(tokenization.analysis_engine.uses_external_llm, false, 'unexpected external LLM dependency');
assert.equal(tokenization.analysis_engine.mode, 'DETERMINISTIC_SOURCE_GROUNDED');
assert.ok(tokenization.analysis_engine.insights.length >= 4, 'grounded insights missing');
assert.ok(tokenization.analysis_engine.insights.every((insight) => insight.statement && insight.methodology && insight.evidence), 'ungrounded insight');
const allocatedNetworkValue = tokenization.networks.reduce((sum, row) => sum + row.value_usd, 0);
const expectedAllocatedValue = tokenization.kpis.tracked_rwa_tvl_usd * tokenization.ratios.network_allocation_coverage_pct / 100;
assert.ok(Math.abs(allocatedNetworkValue - expectedAllocatedValue) < Math.max(1, expectedAllocatedValue * 1e-9), 'network allocation does not reconcile');
assert.ok(tokenization.data_quality.project_link_coverage_pct >= 0 && tokenization.data_quality.project_link_coverage_pct <= 100, 'invalid project-link coverage');
assert.equal(tokenization.data_quality.provider_timestamp_available, false, 'provider timestamp must not be invented');

const l2 = snapshot.l2_intelligence;
assert.ok(l2, 'L2 intelligence snapshot missing');
assert.equal(l2.schema_version, 'kaufman-l2-intelligence-v1');
assert.equal(l2.verification_status, 'SOURCE_OBSERVED');
assert.ok(Date.now() - Date.parse(l2.received_at) <= snapshot.thresholds.l2beat_max_age_ms, 'L2BEAT snapshot is stale');
assert.ok(l2.coverage.projects > 0, 'L2BEAT universe is empty');
assert.ok(l2.projects.length > 0, 'curated L2 project set is empty');
assert.match(l2.methodology.stage_caveat, /no equivalen|no equivale/i, 'L2 stage caveat missing');
for (const project of l2.projects) {
  assert.ok(project.slug && project.name && Number.isFinite(project.tvs_usd), `${project.slug || 'L2'}: incomplete project`);
  assert.match(project.source_url, /^https:\/\/l2beat\.com\/scaling\/projects\//, `${project.slug}: invalid source URL`);
  assert.ok(project.risks.length > 0, `${project.slug}: risk matrix missing`);
  for (const risk of project.risks) {
    for (const field of ['name', 'value', 'original_name', 'original_value', 'explanation']) {
      assert.ok(risk[field], `${project.slug}: risk ${field} missing`);
    }
  }
}

const fiscal = snapshot.fiscal_intelligence;
assert.ok(fiscal, 'fiscal intelligence snapshot missing');
assert.equal(fiscal.schema_version, 'kaufman-fiscal-intelligence-v1');
assert.ok(Date.now() - Date.parse(fiscal.generated_at) <= snapshot.thresholds.fiscal_max_age_ms, 'fiscal snapshot is stale');
assert.equal(fiscal.jurisdictions.length, 8, 'unexpected fiscal jurisdiction coverage');
assert.equal(fiscal.events.length, 5, 'unexpected fiscal event coverage');
assert.equal(fiscal.data_quality.fact_count, 40, 'fiscal matrix is incomplete');
assert.equal(fiscal.data_quality.facts_with_source_pct, 100, 'unsourced fiscal facts');
assert.equal(fiscal.data_quality.final_tax_liability_calculated, false, 'fiscal layer must not calculate final liability');
assert.equal(new Set(fiscal.jurisdictions.map((row) => row.id)).size, fiscal.jurisdictions.length, 'duplicate fiscal jurisdiction IDs');
const fiscalSourceIds = new Set(fiscal.sources.map((source) => source.id));
for (const jurisdiction of fiscal.jurisdictions) {
  assert.ok(Number.isFinite(jurisdiction.coordinates.lat) && Number.isFinite(jurisdiction.coordinates.lon), `${jurisdiction.id}: invalid coordinates`);
  for (const event of fiscal.events) {
    const fact = jurisdiction.facts[event.id];
    assert.ok(fact?.trigger && fact?.category && fact?.rate && fact?.limitation, `${jurisdiction.id}/${event.id}: incomplete fiscal fact`);
    assert.ok(fact.source_ids.every((id) => fiscalSourceIds.has(id)), `${jurisdiction.id}/${event.id}: broken source reference`);
  }
}
assert.notEqual(
  fiscal.jurisdictions.find((row) => row.id === 'espana').facts.crypto_swap.trigger,
  fiscal.jurisdictions.find((row) => row.id === 'portugal').facts.crypto_swap.trigger,
  'material Spain/Portugal swap difference was flattened'
);

const regulation = snapshot.regulation_intelligence;
assert.ok(regulation, 'regulation intelligence snapshot missing');
assert.equal(regulation.schema_version, 'kaufman-regulation-intelligence-v1');
assert.ok(Date.now() - Date.parse(regulation.generated_at) <= snapshot.thresholds.regulation_max_age_ms, 'regulation snapshot is stale');
assert.equal(regulation.regimes.length, 5, 'unexpected regulation regime coverage');
assert.equal(regulation.data_quality.demo_record_count, 0, 'regulation layer contains demo records');
assert.equal(regulation.data_quality.sourced_regime_pct, 100, 'unsourced regulation regimes');
const regulationSourceIds = new Set(regulation.sources.map((source) => source.id));
for (const regime of regulation.regimes) {
  assert.equal(regime.legal_status, 'VERIFIED', `${regime.id}: legal review status`);
  assert.ok(regime.authority && regime.effective && regime.scope && regime.practical_effect && regime.limitation, `${regime.id}: incomplete regulation regime`);
  assert.ok(regime.source_ids.length > 0 && regime.source_ids.every((id) => regulationSourceIds.has(id)), `${regime.id}: broken source reference`);
  assert.doesNotMatch(JSON.stringify(regime), /DEMO/i, `${regime.id}: demo value leaked into regulation`);
}

const fees = snapshot.auxiliary?.ethereum_fees;
assert.ok(fees, 'Ethereum fee snapshot missing');
assert.equal(fees.verification_status, 'CHAIN_OBSERVED');
assert.ok(Date.now() - Date.parse(fees.received_at) <= 16 * 60_000, 'Ethereum fee snapshot is stale');
assert.ok(Number.isFinite(fees.base_fee_gwei) && fees.base_fee_gwei >= 0, 'invalid Ethereum base fee');
assert.ok(Number.isFinite(fees.block_number) && Number.isFinite(Date.parse(fees.provider_timestamp)), 'Ethereum block evidence missing');
for (const [tierName, tier] of Object.entries(fees.tiers)) {
  assert.ok(['safe', 'standard', 'fast'].includes(tierName), `unexpected gas tier ${tierName}`);
  assert.ok(Number.isFinite(tier.priority_fee_gwei) && tier.priority_fee_gwei >= 0, `${tierName}: invalid priority fee`);
  assert.ok(Math.abs(tier.max_fee_gwei - fees.base_fee_gwei - tier.priority_fee_gwei) < 1e-9, `${tierName}: max fee mismatch`);
}
if (snapshot.auxiliary.etherscan_gas_oracle) {
  assert.equal(snapshot.auxiliary.etherscan_gas_oracle.verification_status, 'SOURCE_OBSERVED');
}

console.log(JSON.stringify({
  status: 'PASS',
  generated_at: snapshot.generated_at,
  published_references: published,
  pools_checked: snapshot.onchain_pools.length,
  metadata_checked: Object.keys(snapshot.metadata).length,
  tokenization_protocols_checked: tokenization.coverage.rwa_protocols,
  l2_projects_checked: l2.coverage.projects,
  fiscal_facts_checked: fiscal.data_quality.fact_count,
  fiscal_sources_checked: fiscal.data_quality.source_count,
  regulation_regimes_checked: regulation.data_quality.regime_count,
  regulation_sources_checked: regulation.data_quality.source_count,
  regulation_sources_reachable: regulation.data_quality.reachable_source_count,
  gas_block_checked: fees.block_number,
  providers: Object.fromEntries(Object.entries(snapshot.providers).map(([name, value]) => [name, value.connection_status]))
}, null, 2));
