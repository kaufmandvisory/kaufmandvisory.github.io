import { createHash } from 'node:crypto';
import { CONFIG } from './config.js';

export const REGULATORY_SOURCES = Object.freeze([
  {
    id: 'eu_mica_text',
    jurisdiction: 'union-europea',
    authority: 'EUR-Lex',
    title: 'Reglamento (UE) 2023/1114 sobre los mercados de criptoactivos (MiCA)',
    url: 'https://eur-lex.europa.eu/eli/reg/2023/1114/oj?locale=es',
    source_type: 'PRIMARY_LAW',
    binding_level: 'BINDING'
  },
  {
    id: 'eu_esma_mica',
    jurisdiction: 'union-europea',
    authority: 'ESMA',
    title: 'MiCA · artículo 59 sobre autorización de proveedores',
    url: 'https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-59-authorisation',
    source_type: 'INTERACTIVE_SINGLE_RULEBOOK',
    binding_level: 'OFFICIAL_RULEBOOK'
  },
  {
    id: 'es_cnmv_mica',
    jurisdiction: 'espana',
    authority: 'CNMV',
    title: 'MiCA: nueva regulación de criptoactivos',
    url: 'https://www.cnmv.es/Portal/mica/regulacion-criptoactivos?lang=es',
    source_type: 'REGULATORY_GUIDANCE',
    binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'mx_fintech_law',
    jurisdiction: 'mexico',
    authority: 'Cámara de Diputados',
    title: 'Ley para Regular las Instituciones de Tecnología Financiera · texto vigente',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LRITF.pdf',
    source_type: 'CONSOLIDATED_LAW',
    binding_level: 'PRIMARY_LAW'
  },
  {
    id: 'mx_banxico_circular',
    jurisdiction: 'mexico',
    authority: 'Banco de México',
    title: 'Circular 4/2019 · operaciones con activos virtuales',
    url: 'https://www.banxico.org.mx/marco-normativo/normativa-emitida-por-el-banco-de-mexico/circular-4-2019/circular-4-2019.html',
    source_type: 'CONSOLIDATED_REGULATION',
    binding_level: 'BINDING'
  },
  {
    id: 'ae_cbuae_payment_tokens',
    jurisdiction: 'emiratos-arabes-unidos',
    authority: 'Central Bank of the UAE',
    title: 'Payment Token Services Regulation',
    url: 'https://rulebook.centralbank.ae/en/rulebook/payment-token-services-regulation',
    source_type: 'REGULATORY_RULEBOOK',
    binding_level: 'BINDING'
  },
  {
    id: 'ae_vara_regulations',
    jurisdiction: 'dubai',
    authority: 'VARA',
    title: 'Virtual Assets and Related Activities Regulations',
    url: 'https://rulebooks.vara.ae/rulebook/virtual-assets-and-related-activities-regulations-2023',
    source_type: 'REGULATORY_RULEBOOK',
    binding_level: 'BINDING'
  }
]);

export const REGULATORY_REGIMES = Object.freeze([
  {
    id: 'mica-union-europea',
    code: 'EU',
    name: 'MiCA · Unión Europea',
    jurisdiction: 'Unión Europea',
    legal_status: 'VERIFIED',
    state: 'IN_FORCE',
    authority: 'Autoridades nacionales · ESMA · EBA',
    effective: 'ART y EMT desde 30 jun 2024; régimen general desde 30 dic 2024',
    scope: 'Emisión, oferta y admisión de criptoactivos; autorización y supervisión de CASP; integridad de mercado.',
    practical_effect: 'Un proveedor necesita autorización MiCA o habilitación del artículo 60 para prestar servicios en la UE, sin perjuicio del régimen transitorio nacional aplicable.',
    limitation: 'Los criptoactivos que sean instrumentos financieros y otros activos expresamente excluidos siguen su normativa sectorial, no MiCA.',
    source_ids: ['eu_mica_text', 'eu_esma_mica'],
    legal_reviewed_at: '2026-07-13'
  },
  {
    id: 'mica-espana-2026',
    code: 'ES',
    name: 'MiCA · España',
    jurisdiction: 'España',
    legal_status: 'VERIFIED',
    state: 'TRANSITION_ENDED',
    authority: 'CNMV · Banco de España',
    effective: 'Fin del periodo transitorio: 1 jul 2026',
    scope: 'CASP que prestan servicios en España; Banco de España conserva competencias específicas sobre emisores de ART y EMT.',
    practical_effect: 'Los operadores acogidos al régimen español anterior ya no pueden apoyarse en la transición: deben comprobarse autorización y alcance en el registro MiCA.',
    limitation: 'La autorización, servicios permitidos y pasaporte deben verificarse entidad por entidad en el registro oficial; un registro AML anterior no equivale a licencia MiCA.',
    source_ids: ['es_cnmv_mica', 'eu_esma_mica', 'eu_mica_text'],
    legal_reviewed_at: '2026-07-13'
  },
  {
    id: 'mexico-activos-virtuales',
    code: 'MX',
    name: 'Activos virtuales · México',
    jurisdiction: 'México',
    legal_status: 'VERIFIED',
    state: 'IN_FORCE',
    authority: 'CNBV · Banco de México',
    effective: 'Ley vigente; última reforma publicada 14 nov 2025 · Circular 4/2019 compilada',
    scope: 'Instituciones de tecnología financiera e instituciones de crédito dentro de las operaciones reguladas con activos virtuales.',
    practical_effect: 'La LRITF distribuye competencias entre CNBV y Banco de México; la Circular 4/2019 fija reglas para operaciones de instituciones reguladas con activos virtuales.',
    limitation: 'No debe presentarse como una licencia general para cualquier actividad cripto ni como una autorización automática para ofrecer un activo al público.',
    source_ids: ['mx_fintech_law', 'mx_banxico_circular'],
    legal_reviewed_at: '2026-07-13'
  },
  {
    id: 'emiratos-payment-tokens',
    code: 'AE',
    name: 'Payment tokens · EAU',
    jurisdiction: 'Emiratos Árabes Unidos · federal',
    legal_status: 'VERIFIED',
    state: 'IN_FORCE',
    authority: 'Central Bank of the UAE',
    effective: 'En vigor desde 31 ago 2024',
    scope: 'Emisión, conversión, custodia y transferencia de payment tokens dentro del ámbito territorial del reglamento.',
    practical_effect: 'La prestación de servicios de payment tokens requiere licencia o registro del CBUAE según la categoría y el supuesto aplicable.',
    limitation: 'El propio reglamento distingue las Financial Free Zones y no sustituye los marcos de SCA, VARA, ADGM o DIFC para actividades fuera de su perímetro.',
    source_ids: ['ae_cbuae_payment_tokens'],
    legal_reviewed_at: '2026-07-13'
  },
  {
    id: 'dubai-vara',
    code: 'DXB',
    name: 'Activos virtuales · Dubái',
    jurisdiction: 'Dubái · excepto DIFC',
    legal_status: 'VERIFIED',
    state: 'IN_FORCE',
    authority: 'Virtual Assets Regulatory Authority (VARA)',
    effective: 'Versión vigente efectiva desde 19 jun 2025',
    scope: 'Actividades reguladas con activos virtuales y emisión en mainland y free zones de Dubái, salvo DIFC.',
    practical_effect: 'Las actividades incluidas en el rulebook requieren autorización de VARA y cumplimiento de los rulebooks aplicables al servicio.',
    limitation: 'DIFC tiene un marco separado; tampoco debe extrapolarse esta ficha al resto de emiratos o a payment tokens bajo competencia del CBUAE.',
    source_ids: ['ae_vara_regulations'],
    legal_reviewed_at: '2026-07-13'
  }
]);

export const REGULATORY_EVENTS = Object.freeze([
  {
    id: 'es-mica-transition-end',
    effective_date: '2026-07-01',
    jurisdiction: 'España',
    category: 'LICENCIAS',
    importance: 'HIGH',
    title: 'Finaliza el periodo transitorio MiCA en España',
    impact: 'El registro AML anterior deja de sostener por sí solo la prestación transitoria; debe verificarse autorización MiCA y alcance de servicios.',
    source_ids: ['es_cnmv_mica', 'eu_esma_mica']
  },
  {
    id: 'mx-fintech-reform-2025',
    effective_date: '2025-11-14',
    jurisdiction: 'México',
    category: 'LEY',
    importance: 'MEDIUM',
    title: 'Texto vigente de la Ley Fintech incorpora la reforma de noviembre de 2025',
    impact: 'La lectura operativa debe hacerse sobre el texto consolidado y no únicamente sobre la ley publicada en 2018.',
    source_ids: ['mx_fintech_law']
  },
  {
    id: 'ae-vara-current-version',
    effective_date: '2025-06-19',
    jurisdiction: 'Dubái',
    category: 'RULEBOOK',
    importance: 'HIGH',
    title: 'Entra en vigor la versión actual del marco VARA',
    impact: 'Las licencias y obligaciones deben contrastarse con la versión vigente del rulebook y con el libro específico de cada actividad.',
    source_ids: ['ae_vara_regulations']
  }
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export function buildRegulationSnapshot(sourceHealth = {}, receivedAt = new Date().toISOString(), detectedChanges = []) {
  const sources = REGULATORY_SOURCES.map((source) => ({
    ...source,
    checked_at: sourceHealth[source.id]?.checked_at || null,
    connection_status: sourceHealth[source.id]?.connection_status || 'NOT_CHECKED',
    http_status: sourceHealth[source.id]?.http_status || null,
    provider_timestamp: sourceHealth[source.id]?.provider_timestamp || null,
    content_fingerprint: sourceHealth[source.id]?.content_fingerprint || null,
    changed_in_session: detectedChanges.includes(source.id)
  }));
  const regimes = clone(REGULATORY_REGIMES);
  const checked = sources.filter((source) => source.connection_status !== 'NOT_CHECKED');
  const reachable = sources.filter((source) => source.connection_status === 'CONNECTED');
  const jurisdictionCount = new Set(regimes.map((regime) => regime.jurisdiction)).size;
  return {
    schema_version: 'kaufman-regulation-intelligence-v1',
    generated_at: receivedAt,
    legal_reviewed_at: '2026-07-13',
    review_policy: 'La fuente se monitoriza automáticamente cada 24 horas. Un HTTP correcto prueba accesibilidad, no vigencia jurídica; los cambios de contenido activan revisión editorial.',
    scope: 'Mapa informativo de perímetros regulatorios. No determina si una actividad o entidad concreta necesita licencia.',
    regimes,
    events: clone(REGULATORY_EVENTS),
    sources,
    data_quality: {
      regime_count: regimes.length,
      jurisdiction_count: jurisdictionCount,
      source_count: sources.length,
      checked_source_count: checked.length,
      reachable_source_count: reachable.length,
      reachable_source_pct: checked.length ? Math.round(reachable.length / checked.length * 10_000) / 100 : null,
      sourced_regime_pct: Math.round(regimes.filter((regime) => regime.source_ids.length).length / regimes.length * 10_000) / 100,
      demo_record_count: 0,
      changes_detected_in_session: detectedChanges.length
    },
    methodology: 'Cada ficha conserva jurisdicción, autoridad, fecha efectiva, perímetro, efecto práctico, límite y enlaces primarios. Kaufman no infiere equivalencia entre registros, licencias o territorios.'
  };
}

export function validateRegulationSnapshot(snapshot) {
  if (snapshot?.schema_version !== 'kaufman-regulation-intelligence-v1') throw new Error('Invalid regulation schema');
  const sourceIds = new Set(snapshot.sources.map((source) => source.id));
  if (sourceIds.size !== snapshot.sources.length) throw new Error('Duplicate regulation source IDs');
  const regimeIds = new Set(snapshot.regimes.map((regime) => regime.id));
  if (regimeIds.size !== snapshot.regimes.length) throw new Error('Duplicate regulation regime IDs');
  for (const regime of snapshot.regimes) {
    const required = ['name', 'jurisdiction', 'legal_status', 'state', 'authority', 'effective', 'scope', 'practical_effect', 'limitation', 'legal_reviewed_at'];
    if (required.some((key) => !regime[key])) throw new Error(`Incomplete regulation regime: ${regime.id}`);
    if (!regime.source_ids?.length || regime.source_ids.some((id) => !sourceIds.has(id))) throw new Error(`Invalid regulation sources: ${regime.id}`);
    if (JSON.stringify(regime).toUpperCase().includes('DEMO')) throw new Error(`Demo value in regulation regime: ${regime.id}`);
  }
  if (snapshot.data_quality.demo_record_count !== 0) throw new Error('Regulation snapshot cannot publish demo records');
  return true;
}

export async function checkRegulatorySource(source, fetchImpl = fetch) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetchImpl(source.url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        accept: 'text/html,application/xhtml+xml,application/pdf,application/json;q=0.9,*/*;q=0.8',
        range: 'bytes=0-65535',
        'user-agent': 'Kaufman-Regulation-Intelligence/1.0 contact@kaufmanadvisory.io'
      },
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) return { checked_at: checkedAt, connection_status: 'DEGRADED', http_status: response.status };
    const bytes = new Uint8Array(await response.arrayBuffer());
    const fingerprint = createHash('sha256').update(bytes.subarray(0, 65_536)).digest('hex');
    return {
      checked_at: checkedAt,
      connection_status: 'CONNECTED',
      http_status: response.status,
      provider_timestamp: response.headers.get('last-modified'),
      etag: response.headers.get('etag'),
      content_fingerprint: fingerprint
    };
  } catch (error) {
    return { checked_at: checkedAt, connection_status: 'DEGRADED', http_status: null, error: error.message };
  }
}

export class RegulationConnector {
  constructor({ onData, onHealth, config = CONFIG, fetchImpl = fetch }) {
    this.onData = onData;
    this.onHealth = onHealth;
    this.config = config;
    this.fetchImpl = fetchImpl;
    this.sourceHealth = {};
    this.stopped = false;
    this.timer = null;
  }

  start() {
    this.stopped = false;
    const initial = buildRegulationSnapshot(this.sourceHealth);
    validateRegulationSnapshot(initial);
    this.onData(initial);
    this.onHealth('regulation_registry', { connection_status: 'CONNECTED', last_message_at: initial.generated_at, monitoring_status: 'STARTING' });
    this.refresh();
  }

  stop() { this.stopped = true; clearTimeout(this.timer); }

  async refresh() {
    const previous = this.sourceHealth;
    const results = await Promise.all(REGULATORY_SOURCES.map(async (source) => [source.id, await checkRegulatorySource(source, this.fetchImpl)]));
    this.sourceHealth = Object.fromEntries(results);
    const detectedChanges = results
      .filter(([id, status]) => previous[id]?.content_fingerprint && status.content_fingerprint && previous[id].content_fingerprint !== status.content_fingerprint)
      .map(([id]) => id);
    const snapshot = buildRegulationSnapshot(this.sourceHealth, new Date().toISOString(), detectedChanges);
    validateRegulationSnapshot(snapshot);
    this.onData(snapshot);
    const connected = results.filter(([, status]) => status.connection_status === 'CONNECTED').length;
    this.onHealth('regulation_registry', {
      connection_status: connected ? 'CONNECTED' : 'DEGRADED',
      last_message_at: snapshot.generated_at,
      monitored_sources: results.length,
      reachable_sources: connected,
      changes_detected: detectedChanges.length
    });
    if (!this.stopped) this.timer = setTimeout(() => this.refresh(), this.config.regulationIntervalMs);
  }
}
