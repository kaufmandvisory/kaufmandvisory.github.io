import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeL2BeatSummary } from './l2beat.js';

const fixture = {
  chart: { syncedUntil: 1783900800 },
  projects: {
    arbitrum: {
      id: 'arbitrum', slug: 'arbitrum', name: 'Arbitrum One', type: 'layer2', hostChain: 'Ethereum',
      category: 'Optimistic Rollup', providers: ['Arbitrum'], purposes: ['Universal'], isArchived: false,
      isUnderReview: false, stage: 'Stage 1', badges: [{ type: 'DA', name: 'Ethereum with blobs' }],
      tvs: { breakdown: { total: 1000, external: 250, stablecoin: 400, rwaPublic: 50 }, change7d: 0.025 },
      risks: [
        { name: 'Sequencer Failure', value: 'Self sequence', sentiment: 'good' },
        { name: 'State Validation', value: 'Fraud proofs (INT)', sentiment: 'good' },
        { name: 'Data Availability', value: 'Onchain', sentiment: 'good' },
        { name: 'Exit Window', value: 'None', sentiment: 'bad', regular: { value: '10d', sentiment: 'warning' } },
        { name: 'Proposer Failure', value: 'Self propose', sentiment: 'good' }
      ]
    },
    ignoredL3: { id: 'l3', slug: 'l3', name: 'L3', type: 'layer3', isArchived: false, tvs: { breakdown: { total: 999 } } },
    zero: { id: 'zero', slug: 'zero', name: 'Zero', type: 'layer2', isArchived: false, tvs: { breakdown: { total: 0 } } }
  }
};

test('normalizes L2BEAT facts while preserving original terms', () => {
  const result = normalizeL2BeatSummary(fixture, '2026-07-13T10:00:00.000Z');
  assert.equal(result.coverage.projects, 1);
  assert.equal(result.projects[0].category_es, 'Rollup optimista');
  assert.equal(result.projects[0].stage, 'Stage 1');
  assert.match(result.projects[0].stage_explanation, /Madurez intermedia/);
  assert.equal(result.projects[0].tvs_change_7d_pct, 2.5);
  assert.equal(result.projects[0].risks[0].original_value, 'Self sequence');
  assert.equal(result.projects[0].risks[0].value, 'El usuario puede secuenciar');
});

test('derives trust, stablecoin and public RWA shares without inventing values', () => {
  const result = normalizeL2BeatSummary(fixture);
  const project = result.projects[0];
  assert.equal(project.additional_trust_share_pct, 25);
  assert.equal(project.stablecoin_share_pct, 40);
  assert.equal(project.rwa_public_usd, 50);
  assert.equal(result.kpis.curated_public_rwa_usd, 50);
  assert.ok(project.signals.includes('SIN_VENTANA_SALIDA_EMERGENCIA'));
});

test('states that stage is maturity rather than a security score', () => {
  const result = normalizeL2BeatSummary(fixture);
  assert.match(result.methodology.stage_caveat, /no equivalen.*seguridad/i);
  assert.equal(result.verification_status, 'SOURCE_OBSERVED');
  assert.equal(result.provider_timestamp, '2026-07-13T00:00:00.000Z');
});

test('rejects incomplete source payloads', () => {
  assert.throws(() => normalizeL2BeatSummary({}), /incomplete/);
});
