import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateFiscalScenario, progressiveTax } from './fiscal-calculator.js';

const estimate = (jurisdiction, overrides = {}) => estimateFiscalScenario({
  jurisdiction, event: 'sell_fiat', profile: 'individual-investor', proceeds: 20_000,
  cost: 10_000, prior_base: 0, holding_days: 400, filing_status: 'single',
  tax_context: 'foreign_or_adjusted', turnover: 0, ...overrides
});

test('progressive tax applies each bracket only to its slice', () => {
  assert.equal(progressiveTax(10_000, [{ up_to: 6_000, rate: .19 }, { up_to: null, rate: .21 }]), 1_980);
});

test('Spain calculates incremental savings-base tax', () => {
  const row = estimate('espana');
  assert.equal(row.status, 'CALCULATED');
  assert.equal(row.tax_estimate, 1_980);
});

test('Portugal distinguishes deferred swaps and the 365-day conditional exclusion', () => {
  assert.equal(estimate('portugal', { event: 'crypto_swap' }).status, 'DEFERRED');
  assert.equal(estimate('portugal').status, 'CONDITIONAL_EXCLUSION');
  assert.equal(estimate('portugal', { holding_days: 100 }).tax_estimate, 2_800);
});

test('United States uses the 2026 long-term capital-gain band and filing status', () => {
  const row = estimate('estados-unidos', { proceeds: 60_000, cost: 40_000, prior_base: 40_000, holding_days: 500 });
  assert.equal(row.tax_estimate, 1_582.5);
  assert.match(row.method, /largo plazo/i);
});

test('UAE separates personal investment from business turnover', () => {
  assert.equal(estimate('emiratos-arabes-unidos').status, 'PERSONAL_INVESTMENT_EXCLUDED');
  const business = estimate('emiratos-arabes-unidos', { profile: 'individual-business', turnover: 1_200_000, proceeds: 500_000, cost: 300_000, prior_base: 300_000 });
  assert.equal(business.tax_estimate, 11_250);
});

test('Argentina, Colombia, Chile and Mexico expose distinct official mechanisms', () => {
  assert.equal(estimate('argentina').tax_estimate, 1_500);
  assert.equal(estimate('colombia', { holding_days: 800, tax_context: 'capital_asset' }).tax_estimate, 1_500);
  assert.equal(estimate('chile', { proceeds: 30_000_000, cost: 20_000_000, prior_base: 10_000_000 }).tax_estimate, 349_367.84);
  const mexico = estimate('mexico', { proceeds: 100_000, cost: 60_000 });
  assert.equal(mexico.status, 'CONDITIONAL_PROVISIONAL');
  assert.equal(mexico.tax_estimate, 20_000);
});

test('losses never silently become a tax benefit', () => {
  const row = estimate('espana', { proceeds: 5_000, cost: 8_000 });
  assert.equal(row.status, 'NO_POSITIVE_GAIN');
  assert.equal(row.tax_estimate, 0);
  assert.match(row.method, /pérdidas/i);
});
