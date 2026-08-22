import { createLegalReviewRecord } from '../server/legal-review.js';

const input = process.env.KAUFMAN_LEGAL_REVIEW_INPUT_JSON;
const privateKey = process.env.KAUFMAN_LEGAL_REVIEW_PRIVATE_KEY;
if (!input || !privateKey) throw new Error('Se requieren KAUFMAN_LEGAL_REVIEW_INPUT_JSON y KAUFMAN_LEGAL_REVIEW_PRIVATE_KEY; la clave nunca se escribe en el repositorio.');
const record = createLegalReviewRecord(JSON.parse(input), privateKey.replace(/\\n/g, '\n'));
process.stdout.write(`${JSON.stringify(record)}\n`);
