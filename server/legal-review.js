import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function payloadFor(record) {
  const { record_hash, signature, ...payload } = record;
  return payload;
}

export function hashLegalReview(record) {
  return createHash('sha256').update(canonical(payloadFor(record))).digest('hex');
}

export function createLegalReviewRecord(input, privateKeyPem) {
  const record = {
    schema_version: 'kaufman-legal-review-v1',
    review_id: input.review_id,
    regime_ids: [...new Set(input.regime_ids || [])].sort(),
    source_fingerprints: Object.fromEntries(Object.entries(input.source_fingerprints || {}).sort(([a], [b]) => a.localeCompare(b))),
    reviewer_id: input.reviewer_id,
    reviewer_role: input.reviewer_role,
    reviewer_organisation: input.reviewer_organisation || null,
    decision: input.decision,
    reviewed_at: new Date(input.reviewed_at || Date.now()).toISOString(),
    valid_until: input.valid_until ? new Date(input.valid_until).toISOString() : null,
    notes: input.notes || null,
    previous_hash: input.previous_hash || null,
    key_id: input.key_id
  };
  if (!record.review_id || !record.regime_ids.length || !record.reviewer_id || !record.reviewer_role || !['APPROVED', 'CHANGES_REQUIRED'].includes(record.decision) || !record.key_id) throw new Error('Incomplete legal review record');
  record.record_hash = hashLegalReview(record);
  record.signature = sign(null, Buffer.from(record.record_hash, 'hex'), createPrivateKey(privateKeyPem)).toString('base64');
  return record;
}

export function verifyLegalReviewRecord(record, trustedKeys = {}) {
  const hashMatches = hashLegalReview(record) === record.record_hash;
  const key = trustedKeys[record.key_id];
  const signatureValid = Boolean(hashMatches && key && record.signature && verify(null, Buffer.from(record.record_hash, 'hex'), createPublicKey(key), Buffer.from(record.signature, 'base64')));
  return { hash_matches: hashMatches, trusted_key: Boolean(key), signature_valid: signatureValid };
}

export function buildLegalReviewSummary(records = [], regimeIds = [], trustedKeys = {}) {
  let previousHash = null;
  const evaluated = records.map((record) => {
    const verification = verifyLegalReviewRecord(record, trustedKeys);
    const chainValid = record.previous_hash === previousHash;
    previousHash = record.record_hash;
    return { ...record, verification: { ...verification, chain_valid: chainValid } };
  });
  const approved = new Set(evaluated.filter((row) => row.decision === 'APPROVED' && row.verification.signature_valid && row.verification.chain_valid).flatMap((row) => row.regime_ids));
  return {
    schema_version: 'kaufman-legal-review-ledger-v1',
    status: evaluated.length && evaluated.every((row) => row.verification.signature_valid && row.verification.chain_valid) ? 'VALID' : evaluated.length ? 'INVALID' : 'EMPTY',
    records: evaluated,
    signed_regime_ids: [...approved],
    pending_regime_ids: regimeIds.filter((id) => !approved.has(id)),
    controls: 'Ed25519 · clave pública de revisor autorizada · huellas de fuentes · cadena SHA-256 append-only'
  };
}

export function legalReviewConfigFromEnvironment() {
  try {
    return {
      records: JSON.parse(process.env.KAUFMAN_LEGAL_REVIEW_LEDGER_JSON || '[]'),
      trustedKeys: JSON.parse(process.env.KAUFMAN_LEGAL_REVIEW_PUBLIC_KEYS_JSON || '{}')
    };
  } catch { return { records: [], trustedKeys: {} }; }
}
