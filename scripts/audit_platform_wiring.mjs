import { readFile } from 'node:fs/promises';

async function assignedJson(file, prefix) {
  const raw = await readFile(new URL(file, import.meta.url), 'utf8');
  return JSON.parse(raw.slice(prefix.length).replace(/;\s*$/, ''));
}

const [platform, daily, edge, gasEdge, contextEdge, app, newsBuilder] = await Promise.all([
  assignedJson('../assets/platform-data.js', 'window.KAUFMAN_PLATFORM_DATA = '),
  assignedJson('../assets/daily-data.js', 'window.KAUFMAN_DAILY_DATA = '),
  readFile(new URL('../.netlify-functions/market-snapshot.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../.netlify-functions/ethereum-gas.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../.netlify-functions/market-context.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../assets/kaufman-app.js', import.meta.url), 'utf8'),
  readFile(new URL('./update_daily_data.py', import.meta.url), 'utf8')
]);

const fiscalFacts = platform.fiscal_intelligence.jurisdictions.flatMap((jurisdiction) =>
  Object.values(jurisdiction.facts).map((fact) => ({ jurisdiction: jurisdiction.id, ...fact }))
);
const unresolvedFiscal = fiscalFacts.filter((fact) => fact.status === 'NOT_DETERMINED');
const web3Catalog = app.slice(app.indexOf("proyectos:{label:'Proyectos'"), app.indexOf("mineria:{label:'Minería'"));
const web3Profiles = (web3Catalog.match(/\{id:'/g) || []).length;
const web3AutomaticProfiles = (web3Catalog.match(/status:'auto'/g) || []).length;
const edgeUsesPersistentWebSocket = /new\s+WebSocket\s*\(/.test(edge);
const edgeFetchCalls = (edge.match(/fetch\(/g) || []).length;
const newsRows = [...(daily.home_regulation || []), ...(daily.mining_news || [])];
const journalisticRows = newsRows.filter((row) => row.verification_status === 'SOURCE_METADATA_VERIFIED');
const primaryMonitorRows = newsRows.filter((row) => row.verification_status === 'OFFICIAL_SOURCE_MONITORED');
const calculatedRows = newsRows.filter((row) => row.verification_status === 'CALCULATED_FROM_PUBLIC_SOURCES');

const findings = [
  {
    id: 'A01', severity: 'HIGH', area: 'Mercados',
    finding: 'Producción consulta REST cada 3 segundos; no mantiene conectores WebSocket persistentes.',
    evidence: `${edgeFetchCalls} llamadas fetch en la función edge; WebSocket persistente=${edgeUsesPersistentWebSocket}.`,
    remediation: 'Desplegar un proceso server-side persistente con heartbeat, huecos y reconexión, y publicar internamente por SSE/WebSocket.'
  },
  {
    id: 'A02', severity: 'MEDIUM', area: 'ETF',
    finding: 'Los flujos ETF automáticos dependen de un único agregador público y todavía no se reconcilian contra cada emisor.',
    evidence: `Contexto automático=${/s-maxage=300/.test(contextEdge)}; gas independiente a un minuto=${/s-maxage=60/.test(gasEdge)}; fuente ETF=${platform.market_context.etf_flows?.source || 'no disponible'}.`,
    remediation: 'Añadir una segunda fuente y reconciliar por ticker con los datos publicados por cada emisor antes de elevar la confianza.'
  },
  {
    id: 'A03', severity: 'HIGH', area: 'DEX',
    finding: 'Los pools descentralizados son un snapshot diario y no tienen timestamp de la última operación.',
    evidence: `${platform.onchain_pools.length} pools; ${platform.onchain_pools.filter((pool) => pool.exact_trade_timestamp_available === false).length} sin timestamp de trade verificable.`,
    remediation: 'Añadir una fuente onchain o de eventos con bloque y timestamp verificables antes de tratarlos como tiempo real.'
  },
  {
    id: 'A04', severity: 'HIGH', area: 'Exchanges',
    finding: 'La comparación de comisiones de intercambio no está cubierta de forma plural.',
    evidence: `Solo ${platform.auxiliary.exchange_fees.exchange} · ${platform.auxiliary.exchange_fees.pair} · primer tramo maker/taker.`,
    remediation: 'Normalizar tarifas por exchange, jurisdicción, nivel de volumen, par, depósito y retirada.'
  },
  {
    id: 'A05', severity: 'MEDIUM', area: 'Wallets',
    finding: 'El monitor de wallets observa releases de aplicaciones, no firmware, advisories, compatibilidad ni estado del dispositivo.',
    evidence: `${platform.wallet_intelligence.coverage.observed}/${platform.wallet_intelligence.coverage.expected} releases de aplicación observadas.`,
    remediation: 'Conectar feeds oficiales de firmware y seguridad por modelo, conservando versión afectada y fecha de publicación.'
  },
  {
    id: 'A06', severity: 'MEDIUM', area: 'Web3',
    finding: 'La arquitectura Web3 está explicada, pero casi toda su telemetría sigue siendo documental.',
    evidence: `${web3Profiles} perfiles Web3; ${web3AutomaticProfiles} con datos automáticos de proyecto (L2BEAT).`,
    remediation: 'Añadir salud, upgrades, gobernanza y uso con fuentes primarias por protocolo sin convertir actividad en una puntuación opaca.'
  },
  {
    id: 'A07', severity: 'HIGH', area: 'Regulación',
    finding: 'La cobertura regulatoria no es todavía mundial.',
    evidence: `${platform.regulation_intelligence.data_quality.regime_count} regímenes y ${platform.regulation_intelligence.data_quality.jurisdiction_count} jurisdicciones.`,
    remediation: 'Priorizar G20 y hubs de activos digitales con texto primario, fecha efectiva, transición y registro de proveedores.'
  },
  {
    id: 'A08', severity: 'HIGH', area: 'Regulación',
    finding: 'El robot comprueba accesibilidad y cambios de fuente, pero no revalida por sí solo el efecto jurídico.',
    evidence: `Revisión jurídica declarada ${platform.regulation_intelligence.legal_reviewed_at}; cambios detectados en build=${platform.regulation_intelligence.data_quality.changes_detected_in_session}.`,
    remediation: 'Crear una cola de revisión jurídica con diff, responsable, decisión, vigencia y firma de aprobación.'
  },
  {
    id: 'A09', severity: 'HIGH', area: 'Fiscal',
    finding: 'El motor fiscal tiene cobertura limitada y parte de sus fuentes no se monitoriza automáticamente.',
    evidence: `${platform.fiscal_intelligence.data_quality.jurisdiction_count} jurisdicciones; ${unresolvedFiscal.length}/${fiscalFacts.length} hechos no determinados; ${platform.fiscal_intelligence.data_quality.checked_source_count}/${platform.fiscal_intelligence.data_quality.source_count} fuentes comprobadas en el build.`,
    remediation: 'Ampliar residencia, regiones, convenios y perfiles, y monitorizar todas las fuentes que alimentan cálculo.'
  },
  {
    id: 'A10', severity: 'MEDIUM', area: 'Noticias',
    finding: 'La verificación de noticias valida metadatos y medio, no el hecho contra una fuente primaria.',
    evidence: `${journalisticRows.length} titular periodístico; ${primaryMonitorRows.length} señales de fuente oficial; ${calculatedRows.length} señal calculada; Google News=${/google_news_items/.test(newsBuilder)}.`,
    remediation: 'Resolver cada noticia a comunicado, filing, bloque, registro o documento oficial y separar hecho confirmado de cobertura periodística.'
  }
];

if (findings.length !== 10) throw new Error(`La auditoría debe contener exactamente 10 hallazgos; contiene ${findings.length}`);

console.log(JSON.stringify({
  status: 'AUDITED_WITH_GAPS',
  generated_at: new Date().toISOString(),
  evidence_snapshot_at: platform.generated_at,
  findings
}, null, 2));
