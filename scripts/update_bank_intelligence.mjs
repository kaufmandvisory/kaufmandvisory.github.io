import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'assets', 'bank-intelligence.js');
const prefix = 'window.KAUFMAN_BANK_INTELLIGENCE = ';
const now = new Date();
const generatedAt = now.toISOString();
const refreshIntervalMs = 7 * 24 * 60 * 60_000;
const headers = {
  accept: 'text/html,application/json,application/pdf;q=0.9,*/*;q=0.8',
  'user-agent': 'Kaufman-Bank-Monitor/1.0 contact@kaufmanadvisory.io'
};

const RANKING_SOURCE = {
  name: 'S&P Global Market Intelligence',
  url: 'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',
  transport_name: 'MediaWiki API · tabla que reproduce el ranking S&P Global',
  transport_url: 'https://en.wikipedia.org/w/api.php?action=parse&page=List_of_largest_banks&prop=wikitext&format=json&origin=*'
};

const BANK_IDS = new Map([
  ['Industrial and Commercial Bank of China', 'icbc'],
  ['Agricultural Bank of China', 'agricultural-bank-china'],
  ['China Construction Bank', 'china-construction-bank'],
  ['Bank of China', 'bank-of-china'],
  ['JPMorgan Chase', 'jpmorgan-chase'],
  ['HSBC', 'hsbc'],
  ['HSBC Holdings', 'hsbc'],
  ['Bank of America', 'bank-of-america'],
  ['BNP Paribas', 'bnp-paribas'],
  ['Crédit Agricole', 'credit-agricole'],
  ['Crédit Agricole Group', 'credit-agricole'],
  ['Postal Savings Bank of China', 'postal-savings-bank-china'],
  ['Mitsubishi UFJ Financial Group', 'mufg'],
  ['Citigroup', 'citigroup'],
  ['Banco Santander', 'banco-santander'],
  ['Bank of Communications', 'bank-of-communications'],
  ['Wells Fargo', 'wells-fargo'],
  ['Barclays', 'barclays'],
  ['SMBC Group', 'smbc-group'],
  ['Société Générale', 'societe-generale'],
  ['Mizuho Financial Group', 'mizuho'],
  ['China Merchants Bank', 'china-merchants-bank'],
  ['BPCE Group', 'groupe-bpce'],
  ['Groupe BPCE', 'groupe-bpce'],
  ['Goldman Sachs', 'goldman-sachs'],
  ['Royal Bank of Canada', 'royal-bank-canada'],
  ['Deutsche Bank', 'deutsche-bank'],
  ['UBS', 'ubs'],
  ['UBS Group', 'ubs']
]);

const OFFICIAL_SOURCES = [
  { id: 'pboc-ecny', bank_id: null, name: 'People\'s Bank of China · e-CNY', url: 'https://www.pbc.gov.cn/en/3688110/3688172/4157443/4293696/2021072014364791207.pdf' },
  { id: 'jpmorgan-kinexys', bank_id: 'jpmorgan-chase', name: 'J.P. Morgan · Kinexys', url: 'https://www.jpmorgan.com/onyx' },
  { id: 'hsbc-digital-assets', bank_id: 'hsbc', name: 'HSBC · Digital Assets and Currencies', url: 'https://www.hsbc.com/who-we-are/hsbc-and-digital/hsbc-and-digital-assets-and-currencies' },
  { id: 'caceis-mica', bank_id: 'credit-agricole', name: 'CACEIS · autorización MiCA', url: 'https://www.caceis.com/press-releases/caceis-bank-obtains-mica-authorisation' },
  { id: 'mufg-digital-assets', bank_id: 'mufg', name: 'MUFG · Digital Assets', url: 'https://www.mufg.jp/dam/ir/presentation/2023/pdf/slides2309_en.pdf' },
  { id: 'citi-digital-assets', bank_id: 'citigroup', name: 'Citi · Digital Assets', url: 'https://www.citigroup.com/global/businesses/digital-assets' },
  { id: 'santander-blockchain-bond', bank_id: 'banco-santander', name: 'Santander · bono blockchain', url: 'https://www.santander.com/en/press-room/press-releases/santander-launches-the-first-end-to-end-blockchain-bond' },
  { id: 'sg-forge', bank_id: 'societe-generale', name: 'SG-FORGE', url: 'https://www.sgforge.com/' },
  { id: 'goldman-digital-assets', bank_id: 'goldman-sachs', name: 'Goldman Sachs · Digital Assets', url: 'https://www.goldmansachs.com/pressroom/press-releases/2024/announcement-18-nov-2024' },
  { id: 'deutsche-dama', bank_id: 'deutsche-bank', name: 'Deutsche Bank · Project DAMA 2', url: 'https://corporates.db.com/more/latest-news/next-phase-of-project-dama-unveils-institutional-blueprint-for-digital-asset-servicing' },
  { id: 'ubs-tokenize', bank_id: 'ubs', name: 'UBS Tokenize', url: 'https://www.ubs.com/global/en/investment-bank/tokenize.html' }
];

function fingerprint(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeHtml(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/\b(?:nonce|integrity|data-[\w-]+)=(['"])[\s\S]*?\1/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function previousSnapshot() {
  try {
    const raw = await fs.readFile(outputPath, 'utf8');
    return JSON.parse(raw.slice(prefix.length).replace(/;\s*$/, ''));
  } catch {
    return null;
  }
}

async function fetchResponse(url, timeout = 30_000) {
  const response = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

function wikiName(value) {
  return value
    .replace(/\{\{(?:flagicon|Flagicon)\|[^}]+\}\}/g, '')
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function localizeEdition(value) {
  const months = {
    January: 'enero', February: 'febrero', March: 'marzo', April: 'abril', May: 'mayo', June: 'junio',
    July: 'julio', August: 'agosto', September: 'septiembre', October: 'octubre', November: 'noviembre', December: 'diciembre'
  };
  return String(value).replace(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/, (_, month, year) => `${months[month]} ${year}`);
}

function parseRanking(wikitext) {
  const heading = wikitext.indexOf('== By total assets ==');
  const tableStart = wikitext.indexOf('{| class="wikitable sortable mw-collapsible"', heading);
  const tableEnd = wikitext.indexOf('|}', tableStart);
  if (heading < 0 || tableStart < 0 || tableEnd < 0) throw new Error('No se encontró la tabla de activos totales');
  const table = wikitext.slice(tableStart, tableEnd);
  const edition = localizeEdition(table.match(/Total assets<br>\(([^<]+)\)/i)?.[1]?.trim() || 'Edición no identificada');
  const rows = [];
  const rowPattern = /\|-\s*\n\|\s*(\d+)\s*\n\|\s*([\s\S]*?)\s*\n\|\s*([\d,.]+)\s*(?=\n\|-|$)/g;
  for (const match of table.matchAll(rowPattern)) {
    const rank = Number(match[1]);
    if (rank > 25) break;
    const name = wikiName(match[2]);
    const assets = Number(match[3].replaceAll(',', ''));
    const id = BANK_IDS.get(name);
    if (!id) throw new Error(`Banco sin correspondencia: ${name}`);
    rows.push({ id, rank, name, assets_usd_billions: assets });
  }
  if (rows.length !== 25) throw new Error(`Ranking incompleto: ${rows.length}/25`);
  if (new Set(rows.map((row) => row.id)).size !== 25) throw new Error('Ranking con bancos duplicados');
  return { edition, rows };
}

async function updateRanking(previous) {
  try {
    const response = await fetchResponse(RANKING_SOURCE.transport_url);
    const payload = await response.json();
    const wikitext = payload?.parse?.wikitext?.['*'];
    if (!wikitext) throw new Error('MediaWiki no devolvió wikitexto');
    const parsed = parseRanking(wikitext);
    const contentFingerprint = fingerprint(JSON.stringify(parsed.rows));
    return {
      ...RANKING_SOURCE,
      edition: parsed.edition,
      checked_at: generatedAt,
      last_success_at: generatedAt,
      connection_status: 'CONNECTED',
      content_fingerprint: contentFingerprint,
      changed_since_previous: Boolean(previous?.content_fingerprint && previous.content_fingerprint !== contentFingerprint),
      revision_id: payload.parse.revid || null,
      page_id: payload.parse.pageid || null,
      banks: parsed.rows,
      last_error: null
    };
  } catch (error) {
    if (!previous?.banks?.length) throw error;
    return {
      ...previous,
      ...RANKING_SOURCE,
      checked_at: generatedAt,
      connection_status: 'DEGRADED',
      changed_since_previous: false,
      last_error: error.message
    };
  }
}

async function checkOfficialSource(source, previous) {
  try {
    const response = await fetchResponse(source.url, 35_000);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 200) throw new Error('Respuesta demasiado corta');
    const contentType = response.headers.get('content-type') || '';
    const material = /pdf/i.test(contentType) ? buffer : Buffer.from(normalizeHtml(buffer.toString('utf8')));
    const contentFingerprint = fingerprint(material);
    return {
      ...source,
      checked_at: generatedAt,
      last_success_at: generatedAt,
      connection_status: 'CONNECTED',
      http_status: response.status,
      content_type: contentType || null,
      content_fingerprint: contentFingerprint,
      changed_since_previous: Boolean(previous?.content_fingerprint && previous.content_fingerprint !== contentFingerprint),
      last_error: null
    };
  } catch (error) {
    return {
      ...source,
      checked_at: generatedAt,
      last_success_at: previous?.last_success_at || null,
      connection_status: previous?.content_fingerprint ? 'DEGRADED' : 'UNAVAILABLE',
      http_status: null,
      content_type: previous?.content_type || null,
      content_fingerprint: previous?.content_fingerprint || null,
      changed_since_previous: false,
      last_error: error.message
    };
  }
}

const previous = await previousSnapshot();
const ranking = await updateRanking(previous ? { ...previous.ranking, banks: previous.banks } : null);
const previousSources = Object.fromEntries((previous?.official_sources || []).map((source) => [source.id, source]));
const officialSources = await Promise.all(OFFICIAL_SOURCES.map((source) => checkOfficialSource(source, previousSources[source.id])));
const connectedSources = officialSources.filter((source) => source.connection_status === 'CONNECTED').length;
const changedSources = officialSources.filter((source) => source.changed_since_previous).length;

const snapshot = {
  schema_version: 'kaufman-bank-intelligence-v1',
  delivery_mode: 'AUTOMATED_WEEKLY_SNAPSHOT',
  generated_at: generatedAt,
  refresh_interval_ms: refreshIntervalMs,
  next_expected_update_at: new Date(now.getTime() + refreshIntervalMs).toISOString(),
  publication_policy: 'Validar 25 filas; publicar solo una tabla completa; conservar el último ranking correcto si la fuente falla.',
  ranking: { ...ranking, banks: undefined },
  banks: ranking.banks,
  official_sources: officialSources,
  data_quality: {
    bank_count: ranking.banks.length,
    ranking_status: ranking.connection_status,
    official_source_count: officialSources.length,
    connected_official_sources: connectedSources,
    degraded_official_sources: officialSources.length - connectedSources,
    changed_official_sources: changedSources,
    ranking_changed: ranking.changed_since_previous,
    last_known_good_preserved: ranking.connection_status !== 'CONNECTED'
  }
};

await fs.writeFile(outputPath, `${prefix}${JSON.stringify(snapshot)};\n`, 'utf8');
console.log(`Bank snapshot: ${snapshot.data_quality.bank_count} banks · ${connectedSources}/${officialSources.length} official sources · ranking ${ranking.connection_status}`);
