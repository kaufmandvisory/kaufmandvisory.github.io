import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  REGULATORY_SOURCES,
  buildRegulationSnapshot,
  checkRegulatorySource,
  validateRegulationSnapshot
} from '../server/regulation.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = await Promise.all(
  REGULATORY_SOURCES.map(async (source) => [source.id, await checkRegulatorySource(source)])
);
const snapshot = buildRegulationSnapshot(Object.fromEntries(results));
validateRegulationSnapshot(snapshot);
await fs.writeFile(
  path.join(root, 'assets', 'regulation-data.js'),
  `window.KAUFMAN_REGULATION_DATA = ${JSON.stringify(snapshot)};\n`,
  'utf8'
);
console.log(`Regulation snapshot: ${snapshot.data_quality.reachable_source_count}/${snapshot.data_quality.source_count} sources reachable`);
