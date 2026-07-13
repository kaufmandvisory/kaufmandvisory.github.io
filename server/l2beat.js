import { CONFIG } from './config.js';

const SUMMARY_URL = 'https://l2beat.com/api/scaling/summary';
const SUMMARY_PAGE_URL = 'https://l2beat.com/scaling/summary';
const REPOSITORY_URL = 'https://github.com/l2beat/l2beat';
const CURATED_SLUGS = Object.freeze([
  'arbitrum', 'base', 'op-mainnet', 'starknet', 'linea', 'scroll',
  'zksync-era', 'taiko', 'mantle', 'lighter', 'unichain', 'ink'
]);

const CATEGORY_ES = Object.freeze({
  'Optimistic Rollup': 'Rollup optimista',
  'ZK Rollup': 'Rollup de validez (ZK)',
  Validium: 'Validium',
  Optimium: 'Optimium',
  Other: 'Otro diseño'
});

const PURPOSE_ES = Object.freeze({
  Universal: 'Uso general', Exchange: 'Exchange', Payments: 'Pagos',
  Gaming: 'Videojuegos', AI: 'Inteligencia artificial', 'Social': 'Social',
  'NFT': 'NFT', 'Privacy': 'Privacidad', 'RWA': 'Activos reales'
});

const RISK_NAMES_ES = Object.freeze({
  'Sequencer Failure': 'Caída del secuenciador',
  'State Validation': 'Validación del estado',
  'Data Availability': 'Disponibilidad de datos',
  'Exit Window': 'Ventana de salida',
  'Proposer Failure': 'Caída del proponente'
});

const VALUE_ES = Object.freeze({
  'Self sequence': 'El usuario puede secuenciar',
  'Force via L1': 'Inclusión forzada vía Ethereum',
  'Log via L1': 'Registro en L1, sin inclusión forzada',
  'Enqueue via L1': 'Cola de transacciones vía L1',
  'No mechanism': 'Sin mecanismo alternativo',
  'Fraud proofs (INT)': 'Pruebas de fraude interactivas',
  'Fraud proofs (1R, ZK)': 'Pruebas de fraude de una ronda con ZK',
  'Validity proofs (SN)': 'Pruebas de validez SNARK',
  'Validity proofs (ST)': 'Pruebas de validez STARK',
  'Validity proofs': 'Pruebas de validez',
  None: 'Ninguna',
  Onchain: 'Datos publicados en Ethereum',
  'Onchain (SD)': 'Diferencias de estado publicadas onchain',
  External: 'Datos fuera de Ethereum',
  'Self propose': 'Cualquiera puede proponer',
  'Use escape hatch': 'Salida mediante mecanismo de emergencia',
  'Security Council minority': 'Depende de una minoría del consejo',
  'Whitelisted proposers': 'Proponentes autorizados',
  'Cannot withdraw': 'No se puede retirar'
});

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function stageExplanation(stage) {
  if (stage === 'Stage 2') return 'Madurez máxima del marco L2BEAT: pruebas y salidas con fuertes garantías de descentralización.';
  if (stage === 'Stage 1') return 'Madurez intermedia: el sistema ofrece vías de salida o participación sin depender por completo del operador.';
  if (stage === 'Stage 0') return 'El sistema funciona como rollup, pero todavía mantiene controles o dependencias centralizadas relevantes.';
  return 'L2BEAT no asigna una etapa publicable a este proyecto.';
}

function stageLabelEs(stage) {
  if (stage === 'Stage 2') return 'Nivel 2 de madurez';
  if (stage === 'Stage 1') return 'Nivel 1 de madurez';
  if (stage === 'Stage 0') return 'Nivel 0 de madurez';
  return 'Madurez no asignada';
}

export function extractL2BeatProjectIcons(html) {
  const icons = {};
  const pattern = /\/static\/icons\/([a-z0-9-]+)\.[a-f0-9]+\.(?:png|svg|webp)/gi;
  for (const match of String(html || '').matchAll(pattern)) {
    icons[match[1]] = new URL(match[0], SUMMARY_PAGE_URL).href;
  }
  return icons;
}

function riskExplanation(name, value, sentiment) {
  if (name === 'Sequencer Failure') {
    if (/Self sequence|Force via L1|Enqueue via L1/i.test(value)) return 'Existe una ruta en Ethereum para que el usuario no dependa totalmente del secuenciador.';
    if (/Log via L1/i.test(value)) return 'El usuario puede dejar constancia en Ethereum, pero la inclusión todavía depende de actores autorizados.';
    return 'L2BEAT no identifica una alternativa plenamente abierta ante la caída o censura del secuenciador.';
  }
  if (name === 'State Validation') {
    if (/Validity proofs/i.test(value)) return 'Pruebas criptográficas verifican que el nuevo estado sea correcto.';
    if (/Fraud proofs/i.test(value)) return 'Un observador puede impugnar en Ethereum una transición de estado incorrecta.';
    return 'La validación del estado conserva una dependencia de confianza señalada por L2BEAT.';
  }
  if (name === 'Data Availability') {
    if (/Onchain/i.test(value)) return 'Los datos necesarios para reconstruir o verificar el estado se publican en Ethereum.';
    return 'La reconstrucción del estado depende de una capa o comité externo a Ethereum.';
  }
  if (name === 'Exit Window') {
    if (/None/i.test(value)) return 'Una actualización de emergencia puede aplicarse sin dar tiempo al usuario para salir.';
    return 'Existe un periodo antes de ciertas actualizaciones para que el usuario pueda reaccionar o salir.';
  }
  if (name === 'Proposer Failure') {
    if (/Self propose/i.test(value)) return 'Un tercero puede proponer nuevas raíces si el proponente habitual deja de funcionar.';
    if (/escape hatch/i.test(value)) return 'El usuario conserva una vía criptográfica de salida si falla el proponente.';
    return 'La continuidad de retiradas depende de actores autorizados o de gobernanza.';
  }
  return sentiment === 'good' ? 'L2BEAT identifica una vía de mitigación.' : 'L2BEAT señala una dependencia de confianza.';
}

function normalizeRisk(risk) {
  const originalName = String(risk?.name || 'Unknown');
  const originalValue = String(risk?.value || 'Unknown');
  return {
    key: originalName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: RISK_NAMES_ES[originalName] || originalName,
    value: VALUE_ES[originalValue] || originalValue,
    original_name: originalName,
    original_value: originalValue,
    sentiment: ['good', 'warning', 'bad', 'neutral', 'UnderReview'].includes(risk?.sentiment) ? risk.sentiment : 'neutral',
    explanation: riskExplanation(originalName, originalValue, risk?.sentiment),
    regular_path: risk?.regular ? {
      value: VALUE_ES[String(risk.regular.value)] || String(risk.regular.value),
      original_value: String(risk.regular.value),
      sentiment: risk.regular.sentiment || 'neutral'
    } : null
  };
}

export function normalizeL2BeatSummary(payload, observedAt = new Date().toISOString(), projectIcons = {}) {
  if (!payload?.projects || typeof payload.projects !== 'object') throw new Error('L2BEAT summary response is incomplete');
  const allProjects = Object.values(payload.projects).filter((project) => project?.type === 'layer2' && project.isArchived !== true);
  const eligible = allProjects.filter((project) => numberOrNull(project?.tvs?.breakdown?.total) !== null && Number(project.tvs.breakdown.total) > 0);
  const syncedUntil = numberOrNull(payload?.chart?.syncedUntil);
  const providerTimestamp = syncedUntil ? new Date(syncedUntil * 1000).toISOString() : null;

  const normalized = eligible.map((project) => {
    const total = Number(project.tvs.breakdown.total);
    const external = numberOrNull(project.tvs.breakdown.external);
    const stablecoin = numberOrNull(project.tvs.breakdown.stablecoin);
    const rwaPublic = numberOrNull(project.tvs.breakdown.rwaPublic);
    const risks = Array.isArray(project.risks) ? project.risks.map(normalizeRisk) : [];
    const daBadge = (project.badges || []).find((badge) => badge.type === 'DA');
    return {
      id: String(project.id || project.slug),
      slug: String(project.slug),
      name: String(project.name),
      host_chain: project.hostChain || null,
      category: project.category || null,
      category_es: CATEGORY_ES[project.category] || project.category || 'Sin clasificar',
      stacks: Array.isArray(project.providers) ? project.providers : [],
      purposes: Array.isArray(project.purposes) ? project.purposes : [],
      purposes_es: (project.purposes || []).map((purpose) => PURPOSE_ES[purpose] || purpose),
      stage: project.stage || 'Not applicable',
      stage_label_es: stageLabelEs(project.stage),
      stage_explanation: stageExplanation(project.stage),
      logo_url: projectIcons[project.slug] || null,
      logo_source: projectIcons[project.slug] ? 'L2BEAT summary page' : null,
      is_under_review: project.isUnderReview === true,
      tvs_usd: total,
      tvs_change_7d_pct: numberOrNull(project.tvs.change7d) === null ? null : round(Number(project.tvs.change7d) * 100),
      stablecoin_value_usd: stablecoin,
      stablecoin_share_pct: stablecoin !== null && total ? round(stablecoin / total * 100) : null,
      rwa_public_usd: rwaPublic,
      additional_trust_value_usd: external,
      additional_trust_share_pct: external !== null && total ? round(external / total * 100) : null,
      data_availability: daBadge?.name || risks.find((risk) => risk.original_name === 'Data Availability')?.original_value || null,
      risks,
      signals: [
        project.isUnderReview === true ? 'CAMBIOS_EN_REVISION' : null,
        risks.find((risk) => risk.original_name === 'Exit Window')?.sentiment === 'bad' ? 'SIN_VENTANA_SALIDA_EMERGENCIA' : null,
        risks.find((risk) => risk.original_name === 'Data Availability')?.sentiment !== 'good' ? 'DA_CONFIANZA_ADICIONAL' : null
      ].filter(Boolean),
      source_url: `https://l2beat.com/scaling/projects/${encodeURIComponent(project.slug)}`
    };
  });

  const bySlug = new Map(normalized.map((project) => [project.slug, project]));
  const curated = CURATED_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean);
  const stages = { stage_0: 0, stage_1: 0, stage_2: 0, other: 0 };
  for (const project of normalized) {
    if (project.stage === 'Stage 0') stages.stage_0 += 1;
    else if (project.stage === 'Stage 1') stages.stage_1 += 1;
    else if (project.stage === 'Stage 2') stages.stage_2 += 1;
    else stages.other += 1;
  }

  return {
    schema_version: 'kaufman-l2-intelligence-v1',
    received_at: observedAt,
    provider_timestamp: providerTimestamp,
    verification_status: 'SOURCE_OBSERVED',
    confidence: providerTimestamp ? 'HIGH' : 'MEDIUM',
    coverage: {
      projects: normalized.length,
      curated_projects: curated.length,
      under_review: normalized.filter((project) => project.is_under_review).length,
      stages
    },
    kpis: {
      total_l2_tvs_usd: normalized.reduce((sum, project) => sum + project.tvs_usd, 0),
      stage_1_or_2_projects: stages.stage_1 + stages.stage_2,
      projects_without_emergency_exit_window: normalized.filter((project) => project.signals.includes('SIN_VENTANA_SALIDA_EMERGENCIA')).length,
      curated_public_rwa_usd: curated.reduce((sum, project) => sum + (project.rwa_public_usd || 0), 0)
    },
    projects: curated,
    methodology: {
      title: 'L2 explicadas, no promocionadas',
      summary: 'Kaufman conserva los campos originales de L2BEAT y añade una explicación española propia. TVS significa valor asegurado, no capitalización ni volumen.',
      selection: 'Muestra editorial fija de doce L2 de uso general: redes consolidadas y emergentes de distintos stacks. Solo se publican si L2BEAT las mantiene activas y con TVS superior a cero; no es un ranking ni una recomendación.',
      selection_type: 'EDITORIAL_CURATED_SET',
      selection_slugs: CURATED_SLUGS,
      stage_caveat: 'Las etapas de L2BEAT son una evaluación opinada de madurez y descentralización; no equivalen a una calificación integral de seguridad.',
      translation_caveat: 'La traducción resume el significado técnico. Ante cualquier discrepancia prevalece el campo original y la ficha enlazada de L2BEAT.'
    },
    sources: [
      { name: 'L2BEAT Public API', url: SUMMARY_URL, role: 'TVS, etapa, stack, propósito y matriz de riesgos' },
      { name: 'L2BEAT summary page', url: SUMMARY_PAGE_URL, role: 'Logotipos oficiales versionados por proyecto' },
      { name: 'L2BEAT repository', url: REPOSITORY_URL, role: 'Metodología y configuración abierta · licencia MIT' }
    ]
  };
}

export class L2BeatConnector {
  constructor({ onData, onHealth, config = CONFIG }) {
    this.onData = onData;
    this.onHealth = onHealth;
    this.config = config;
    this.timer = null;
    this.stopped = false;
  }

  start() {
    this.stopped = false;
    this.refresh();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.timer);
  }

  async refresh() {
    try {
      const [response, summaryPage] = await Promise.all([
        fetch(SUMMARY_URL, {
          headers: { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' },
          signal: AbortSignal.timeout(30_000)
        }),
        fetch(SUMMARY_PAGE_URL, {
          headers: { accept: 'text/html', 'user-agent': 'Kaufman-Market-Antenna/1.0' },
          signal: AbortSignal.timeout(30_000)
        })
      ]);
      if (!response.ok) throw new Error(`L2BEAT summary HTTP ${response.status}`);
      if (!summaryPage.ok) throw new Error(`L2BEAT summary page HTTP ${summaryPage.status}`);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error('L2BEAT returned a non-JSON response');
      const icons = extractL2BeatProjectIcons(await summaryPage.text());
      const snapshot = normalizeL2BeatSummary(await response.json(), new Date().toISOString(), icons);
      if (snapshot.projects.some((project) => !project.logo_url)) throw new Error('L2BEAT project logos are incomplete');
      this.onData(snapshot);
      this.onHealth('l2beat_projects', {
        connection_status: 'CONNECTED',
        last_message_at: snapshot.received_at,
        records: snapshot.coverage.projects,
        curated_records: snapshot.coverage.curated_projects
      });
    } catch (error) {
      this.onHealth('l2beat_projects', { connection_status: 'DEGRADED', last_error: error.message });
    } finally {
      if (!this.stopped) this.timer = setTimeout(() => this.refresh(), this.config.l2beatIntervalMs);
    }
  }
}
