import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { buildLegalReviewSummary, createLegalReviewRecord } from './legal-review.js';

test('legal review record is signed, chained and rejects tampering', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const keys = { counsel_1: publicKey.export({ type: 'spki', format: 'pem' }) };
  const record = createLegalReviewRecord({
    review_id: 'review-1', regime_ids: ['uk-cryptoassets'], source_fingerprints: { uk_fca_cryptoassets: 'a'.repeat(64) },
    reviewer_id: 'reviewer-1', reviewer_role: 'LEGAL_COUNSEL', reviewer_organisation: 'Independent', decision: 'APPROVED',
    reviewed_at: '2026-08-22T10:00:00Z', key_id: 'counsel_1'
  }, privateKey.export({ type: 'pkcs8', format: 'pem' }));
  const valid = buildLegalReviewSummary([record], ['uk-cryptoassets'], keys);
  assert.equal(valid.status, 'VALID');
  assert.deepEqual(valid.signed_regime_ids, ['uk-cryptoassets']);
  const tampered = buildLegalReviewSummary([{ ...record, decision: 'CHANGES_REQUIRED' }], ['uk-cryptoassets'], keys);
  assert.equal(tampered.status, 'INVALID');
  assert.deepEqual(tampered.signed_regime_ids, []);
});
