import { createHash } from 'node:crypto';
import { CONFIG } from './config.js';
import { buildLegalReviewSummary, legalReviewConfigFromEnvironment } from './legal-review.js';

export const REGULATORY_SOURCES = Object.freeze([
  {
    id: 'eu_mica_text',
    jurisdiction: 'union-europea',
    authority: 'EUR-Lex',
    title: 'Marco MiCA y enlace al Reglamento (UE) 2023/1114',
    url: 'https://finance.ec.europa.eu/digital-finance/crypto-assets_en',
    source_type: 'OFFICIAL_LEGISLATION_PORTAL',
    binding_level: 'OFFICIAL_GUIDANCE'
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
    title: 'Comunicado sobre el fin del periodo transitorio de MiCA · 15 jun 2026',
    url: 'https://www.cnmv.es/webservices/verdocumento/ver?e=Du5bkrJCdss1jpXrE00MMK5dehIxSu4zahhfYaOkxqlixji9EyeRa4lQi1By2gy3',
    source_type: 'OFFICIAL_COMMUNICATION',
    binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'mx_fintech_law',
    jurisdiction: 'mexico',
    authority: 'Cámara de Diputados',
    title: 'Ley para Regular las Instituciones de Tecnología Financiera · publicación oficial',
    url: 'https://sidof.segob.gob.mx/notas/5515623',
    source_type: 'PRIMARY_LAW',
    binding_level: 'PRIMARY_LAW'
  },
  {
    id: 'mx_fintech_2025_reform',
    jurisdiction: 'mexico',
    authority: 'Diario Oficial de la Federación',
    title: 'Última reforma de la Ley Fintech · 14 nov 2025',
    url: 'https://sidof.segob.gob.mx/notas/5773097',
    source_type: 'PRIMARY_LAW_AMENDMENT',
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
    url: 'https://rulebook.centralbank.ae/sites/default/files/en_net_file_store/CBUAE_EN_5731_VER1.pdf',
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
  },
  {
    id: 'uk_fca_cryptoassets', jurisdiction: 'reino-unido', authority: 'Financial Conduct Authority',
    title: 'Cryptoassets · quién debe registrarse bajo las MLR', url: 'https://www.fca.org.uk/firms/cryptoassets/who-needs-register',
    source_type: 'OFFICIAL_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'hk_sfc_vatp', jurisdiction: 'hong-kong', authority: 'Securities and Futures Commission',
    title: 'Operadores de plataformas de negociación de activos virtuales', url: 'https://www.sfc.hk/en/Welcome-to-the-Fintech-Contact-Point/Virtual-assets/Virtual-asset-trading-platforms-operators',
    source_type: 'OFFICIAL_LICENSING_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'jp_fsa_crypto_register', jurisdiction: 'japon', authority: 'Financial Services Agency',
    title: 'Lista de proveedores registrados de intercambio de criptoactivos', url: 'https://www.fsa.go.jp/en/regulated/licensed/en_kasoutuka.pdf',
    source_type: 'OFFICIAL_REGISTER', binding_level: 'OFFICIAL_REGISTER'
  },
  {
    id: 'jp_fsa_intermediary', jurisdiction: 'japon', authority: 'Financial Services Agency',
    title: 'Registro de intermediarios de servicios de criptoactivos y medios de pago electrónicos', url: 'https://www.fsa.go.jp/common/shinsei/denanchuukai/index.html',
    source_type: 'OFFICIAL_REGISTRATION_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'au_austrac_vasp', jurisdiction: 'australia', authority: 'Federal Register of Legislation',
    title: 'AML/CTF Act 2006 · texto vigente y registro VASP', url: 'https://www.legislation.gov.au/C2006A00169/latest/text',
    source_type: 'PRIMARY_LAW', binding_level: 'PRIMARY_LAW'
  },
  {
    id: 'us_genius_act', jurisdiction: 'estados-unidos', authority: 'U.S. Government Publishing Office',
    title: 'GENIUS Act · Public Law 119-27', url: 'https://www.govinfo.gov/content/pkg/PLAW-119publ27/pdf/PLAW-119publ27.pdf',
    source_type: 'PRIMARY_LAW', binding_level: 'PRIMARY_LAW'
  },
  {
    id: 'br_bcb_res_520', jurisdiction: 'brasil', authority: 'Banco Central do Brasil',
    title: 'Resolução BCB 520/2025 · sociedades prestadoras de serviços de ativos virtuais', url: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=Resolu%C3%A7%C3%A3o+BCB',
    source_type: 'CONSOLIDATED_REGULATION', binding_level: 'BINDING'
  },
  {
    id: 'ar_cnv_psav', jurisdiction: 'argentina', authority: 'Comisión Nacional de Valores',
    title: 'Registro de Proveedores de Servicios de Activos Virtuales', url: 'https://www.argentina.gob.ar/cnv/registro-de-proveedores-de-servicios-de-activos-virtuales',
    source_type: 'OFFICIAL_REGISTER', binding_level: 'OFFICIAL_REGISTER'
  },
  {
    id: 'sv_cnad_register', jurisdiction: 'el-salvador', authority: 'Comisión Nacional de Activos Digitales',
    title: 'Reglamento de Proveedores de Servicios de Activos Digitales', url: 'https://cnad.gob.sv/wp-content/uploads/2024/04/Reglamento-de-Proveedores-de-Servicios-de-Activos-Digitales-2023.08.11-ESP.pdf',
    source_type: 'CONSOLIDATED_REGULATION', binding_level: 'BINDING'
  },
  {
    id: 'cl_cmf_fintech', jurisdiction: 'chile', authority: 'Comisión para el Mercado Financiero',
    title: 'Registro de Prestadores de Servicios Financieros · Ley Fintec', url: 'https://www.cmfchile.cl/portal/principal/623/w4-article-82800.html',
    source_type: 'OFFICIAL_REGISTRATION_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'co_sfc_virtual_assets', jurisdiction: 'colombia', authority: 'Superintendencia Financiera de Colombia',
    title: 'Hub de activos virtuales · perímetro regulatorio vigente', url: 'https://www.superfinanciera.gov.co/publicaciones/10103299/innovasfcelhub-10103299/',
    source_type: 'OFFICIAL_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'uy_bcu_psav', jurisdiction: 'uruguay', authority: 'Banco Central del Uruguay',
    title: 'Solicitud de autorización y registro de proveedores de servicios de activos virtuales', url: 'https://www.gub.uy/tramites/solicitud-autorizacion-registro-proveedores-servicios-activos-virtuales',
    source_type: 'OFFICIAL_REGISTRATION_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'pe_sbs_psav_aml', jurisdiction: 'peru', authority: 'Superintendencia de Banca, Seguros y AFP',
    title: 'Resolución SBS 02648-2024 · prevención LA/FT para PSAV', url: 'https://www.sbs.gob.pe/noticia/detallenoticia/idnoticia/3754',
    source_type: 'OFFICIAL_REGULATION_NOTICE', binding_level: 'BINDING'
  },
  {
    id: 'sg_mas_dpt_directory', jurisdiction: 'singapur', authority: 'Monetary Authority of Singapore',
    title: 'Directorio de instituciones con servicio Digital Payment Token', url: 'https://eservices.mas.gov.sg/fid/institution?activity=Digital+Payment+Token+Service',
    source_type: 'OFFICIAL_REGISTER', binding_level: 'OFFICIAL_REGISTER'
  },
  {
    id: 'kr_fsc_virtual_asset_act', jurisdiction: 'corea-del-sur', authority: 'Financial Services Commission',
    title: 'Virtual Asset User Protection Act · entrada en vigor y obligaciones', url: 'https://www.fsc.go.kr/eng/pr010101/82683',
    source_type: 'OFFICIAL_REGULATION_NOTICE', binding_level: 'BINDING'
  },
  {
    id: 'th_sec_digital_assets', jurisdiction: 'tailandia', authority: 'Securities and Exchange Commission Thailand',
    title: 'Resumen del Royal Decree on Digital Asset Businesses', url: 'https://www.sec.or.th/EN/Documents/ActandRoyalEnactment/LawReform/summary-decree-digitalasset2561.pdf',
    source_type: 'OFFICIAL_LEGISLATION_SUMMARY', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'th_sec_digital_assets_2025', jurisdiction: 'tailandia', authority: 'Securities and Exchange Commission Thailand',
    title: 'Emergency Decree on Digital Asset Businesses · modificación 2025', url: 'https://sec.or.th/EN/Documents/ActandRoyalEnactment/RoyalEnactment/enactment-digitalasset2025.pdf',
    source_type: 'PRIMARY_LAW_AMENDMENT', binding_level: 'PRIMARY_LAW'
  },
  {
    id: 'id_ojk_digital_assets', jurisdiction: 'indonesia', authority: 'Otoritas Jasa Keuangan',
    title: 'OJK Regulation 27/2024 · digital financial asset and crypto asset trading', url: 'https://iru.ojk.go.id/iru/BE/uploads/regulation/files/file_444fdb9e-8b49-4e13-80e7-47c0330160f3-17042025155234.pdf',
    source_type: 'OFFICIAL_REGULATION', binding_level: 'BINDING'
  },
  {
    id: 'my_sc_digital_assets', jurisdiction: 'malasia', authority: 'Securities Commission Malaysia',
    title: 'Digital Assets · emisión, negociación y custodia', url: 'https://www.sc.com.my/digital-assets',
    source_type: 'OFFICIAL_REGULATORY_PORTAL', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'ph_bsp_circular_1108', jurisdiction: 'filipinas', authority: 'Bangko Sentral ng Pilipinas',
    title: 'Circular 1108 · Guidelines for Virtual Asset Service Providers', url: 'https://www.bsp.gov.ph/Regulations/Issuances/2021/1108.pdf',
    source_type: 'CONSOLIDATED_REGULATION', binding_level: 'BINDING'
  },
  {
    id: 'kz_afsa_datf', jurisdiction: 'kazajistan-aifc', authority: 'Astana Financial Services Authority',
    title: 'Operating a Digital Asset Trading Facility', url: 'https://afsa.aifc.kz/regulated-activities/operating-a-digital-asset-trading-facility/',
    source_type: 'OFFICIAL_LICENSING_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE'
  },
  {
    id: 'pa_sbp_imf_vasp', jurisdiction: 'panama', authority: 'Superintendencia de Bancos de Panamá · FMI',
    title: 'Evaluación técnica del marco AV/PSAV de Panamá', url: 'https://www.superbancos.gob.pa/documentos/evaluaciones_fmi/TN-AML-FT-SPN-Panama-FSAP.pdf',
    source_type: 'OFFICIAL_HOSTED_TECHNICAL_ASSESSMENT', binding_level: 'OFFICIAL_ASSESSMENT'
  },
  {
    id: 'cr_sugef_risk_2025', jurisdiction: 'costa-rica', authority: 'SUGEF',
    title: 'Evaluación sectorial de riesgos 2025 · ausencia de regulación PSAV', url: 'https://www.sugef.fi.cr/informacion_relevante/presentaciones%20sbr/Informe%20Final%20ESR-SF%20version%20publica-2025.pdf',
    source_type: 'OFFICIAL_RISK_ASSESSMENT', binding_level: 'OFFICIAL_ASSESSMENT'
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
    source_ids: ['mx_fintech_law', 'mx_fintech_2025_reform', 'mx_banxico_circular'],
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
  },
  {
    id: 'uk-cryptoassets', code: 'GB', name: 'Criptoactivos · Reino Unido', jurisdiction: 'Reino Unido',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE_AND_TRANSITION', authority: 'Financial Conduct Authority',
    effective: 'MLR vigente; nuevo régimen regulatorio anunciado para 25 oct 2027',
    scope: 'Determinadas actividades de criptoactivos realizadas por negocio en Reino Unido y promoción financiera dirigida a clientes británicos.',
    practical_effect: 'La FCA exige registro MLR antes de iniciar actividades comprendidas; la promoción financiera tiene un perímetro adicional.',
    limitation: 'El registro MLR no equivale a autorización general de servicios financieros y la futura entrada en vigor requiere seguimiento separado.',
    source_ids: ['uk_fca_cryptoassets'], source_verified_at: '2026-08-22', legal_reviewed_at: null
  },
  {
    id: 'hong-kong-vatp', code: 'HK', name: 'VATP · Hong Kong', jurisdiction: 'Hong Kong',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Securities and Futures Commission',
    effective: 'Régimen de licencias AMLO en vigor desde 1 jun 2023',
    scope: 'Plataformas centralizadas que operen en Hong Kong o comercialicen activamente servicios a inversores de Hong Kong.',
    practical_effect: 'Los operadores dentro del perímetro deben estar licenciados; la SFC recomienda considerar ambos regímenes cuando pueda haber security y non-security tokens.',
    limitation: 'La clasificación de cada token y la actividad concreta determinan el régimen SFO, AMLO o ambos.',
    source_ids: ['hk_sfc_vatp'], source_verified_at: '2026-08-22', legal_reviewed_at: null
  },
  {
    id: 'japan-crypto-exchange', code: 'JP', name: 'Crypto-asset exchange · Japón', jurisdiction: 'Japón',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Financial Services Agency · Local Finance Bureaus',
    effective: 'Sistema de registro bajo Payment Services Act; lista oficial observada 1 abr 2026',
    scope: 'Compra, venta, intercambio, intermediación y determinadas formas de custodia o gestión de criptoactivos.',
    practical_effect: 'Debe comprobarse el proveedor en el registro FSA y el conjunto de activos que figura en su ficha.',
    limitation: 'La inclusión de un activo en la lista no garantiza ni respalda su valor; otros productos tokenizados pueden quedar bajo Financial Instruments and Exchange Act.',
    source_ids: ['jp_fsa_crypto_register', 'jp_fsa_intermediary'], source_verified_at: '2026-09-02', legal_reviewed_at: null
  },
  {
    id: 'australia-vasp', code: 'AU', name: 'VASP · Australia', jurisdiction: 'Australia',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'AUSTRAC',
    effective: 'Servicios VASP cubiertos desde 31 mar 2026 según la ficha oficial de implementación',
    scope: 'Intercambio fiat/virtual, cripto/cripto, custodia y determinadas transferencias u ofertas dentro de los servicios designados.',
    practical_effect: 'Un VASP debe registrarse antes de prestar servicios virtuales en Australia y renovar el registro cada tres años.',
    limitation: 'Es un perímetro AML/CTF; no resuelve por sí solo licencias de servicios financieros, valores, fiscalidad o protección al consumidor.',
    source_ids: ['au_austrac_vasp'], source_verified_at: '2026-08-22', legal_reviewed_at: null
  },
  {
    id: 'us-payment-stablecoins', code: 'US', name: 'Payment stablecoins · Estados Unidos', jurisdiction: 'Estados Unidos · federal',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'ENACTED', authority: 'Federal y estatales según emisor',
    effective: 'Public Law 119-27 promulgada 18 jul 2025; calendario operativo sujeto al propio texto y reglas de aplicación',
    scope: 'Emisión de payment stablecoins para personas de Estados Unidos, reservas, redención, divulgación y supervisión de emisores permitidos.',
    practical_effect: 'La emisión queda reservada a categorías de emisor permitidas y sujeta a respaldo y divulgación; el régimen federal y estatal se distribuye según el caso.',
    limitation: 'No es una licencia federal general para exchanges, tokens de inversión, DeFi ni cualquier criptoactivo; debe verificarse la actividad y normativa sectorial concurrente.',
    source_ids: ['us_genius_act'], source_verified_at: '2026-08-22', legal_reviewed_at: null
  },
  {
    id: 'brazil-vasp', code: 'BR', name: 'Sociedades VASP · Brasil', jurisdiction: 'Brasil',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Banco Central do Brasil',
    effective: 'Resolução BCB 520 publicada 10 nov 2025; calendario y transición según la norma',
    scope: 'Constitución, autorización y funcionamiento de sociedades que prestan servicios de activos virtuales bajo competencia del BCB.',
    practical_effect: 'La entidad y cada modalidad de servicio deben encajar en la autorización del BCB; no basta con afirmar que se opera como empresa tecnológica.',
    limitation: 'Valores mobiliarios y actividades de inversión pueden quedar bajo la CVM; la norma no convierte cualquier token en activo autorizado.',
    source_ids: ['br_bcb_res_520'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Autorización prudencial de proveedores de activos virtuales',
    market_access: 'Autorización del BCB y estructura societaria admitida para la actividad declarada.',
    applies_to: ['Empresas que intermedian, custodian o transfieren activos virtuales en el perímetro del BCB', 'Entidades financieras que incorporan servicios de activos virtuales'],
    does_not_apply_to: ['Activos calificados como valores mobiliarios bajo competencia de la CVM', 'Software sin control ni intermediación sobre activos del cliente'],
    regulated_activities: ['Intermediación', 'Custodia', 'Transferencias', 'Servicios vinculados'],
    core_obligations: ['Autorización y gobierno societario', 'Gestión de riesgos, controles internos y segregación', 'Prevención de blanqueo y trazabilidad operativa'],
    verification_steps: ['Buscar la razón social en los registros del BCB', 'Comprobar servicios autorizados y fecha efectiva', 'Verificar si el activo o producto activa también competencia de la CVM'],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer', 'payments']
  },
  {
    id: 'argentina-psav', code: 'AR', name: 'PSAV · Argentina', jurisdiction: 'Argentina',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Comisión Nacional de Valores',
    effective: 'Registro operativo; altas por TAD desde 26 may 2025 y normativa consolidada vigente',
    scope: 'Personas humanas y jurídicas alcanzadas por las categorías de proveedor de servicios de activos virtuales previstas por la CNV.',
    practical_effect: 'El proveedor alcanzado debe inscribirse antes de operar y cumplir las condiciones de su categoría; la ficha del registro permite verificar identidad y estado.',
    limitation: 'La inscripción PSAV no equivale a aprobación de los activos ofrecidos ni sustituye autorizaciones de mercado de capitales u otras normas aplicables.',
    source_ids: ['ar_cnv_psav'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Registro y supervisión de proveedores de activos virtuales',
    market_access: 'Inscripción previa en el registro PSAV de la CNV según actividad y umbrales aplicables.',
    applies_to: ['Proveedores residentes o constituidos en Argentina alcanzados por las actividades PSAV', 'Operadores que custodian, intercambian o transfieren activos virtuales por cuenta de terceros'],
    does_not_apply_to: ['Autocustodia y operaciones estrictamente por cuenta propia sin servicio a terceros', 'Una autorización automática para emitir valores negociables tokenizados'],
    regulated_activities: ['Exchange', 'Transferencias', 'Custodia', 'Servicios financieros vinculados'],
    core_obligations: ['Registro y actualización de datos', 'Controles AML/CFT y conocimiento del cliente', 'Seguridad de la información, auditoría y evidencia de reservas cuando corresponda'],
    verification_steps: ['Consultar proveedor y categoría en el registro CNV', 'Comprobar estado, denominación legal y alcance operativo', 'Separar la actividad PSAV de una oferta pública o valor negociable'],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer']
  },
  {
    id: 'el-salvador-psad', code: 'SV', name: 'PSAD · El Salvador', jurisdiction: 'El Salvador',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Comisión Nacional de Activos Digitales',
    effective: 'Ley de Emisión de Activos Digitales y registro CNAD en vigor',
    scope: 'Emisores, ofertas públicas y proveedores de servicios de activos digitales incluidos en la ley y normativa CNAD.',
    practical_effect: 'El operador o emisor debe identificarse en el registro público correspondiente y acreditar autorización para la actividad concreta.',
    limitation: 'El tratamiento de Bitcoin como moneda de curso legal y los servicios bajo competencia del BCR tienen reglas distintas; no deben mezclarse ambos registros.',
    source_ids: ['sv_cnad_register'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Registro de servicios y emisión de activos digitales',
    market_access: 'Registro o autorización CNAD según se preste un servicio o se estructure una emisión pública.',
    applies_to: ['Proveedores de servicios de activos digitales', 'Emisores y certificadores de ofertas públicas de activos digitales'],
    does_not_apply_to: ['Toda actividad con Bitcoin por el mero uso del activo', 'Productos financieros que permanezcan bajo otra autoridad sectorial'],
    regulated_activities: ['Emisión', 'Exchange', 'Custodia', 'Transferencias', 'Estructuración de ofertas'],
    core_obligations: ['Registro e identificación del responsable', 'Documentación de oferta y divulgaciones cuando corresponda', 'Controles AML/CFT y custodia conforme al servicio'],
    verification_steps: ['Consultar el registro público CNAD', 'Distinguir PSAD, emisor y certificador', 'Abrir la resolución o licencia y confirmar el servicio autorizado'],
    activity_tags: ['issuer', 'custody', 'exchange', 'transfer']
  },
  {
    id: 'chile-fintech-tokenized', code: 'CL', name: 'Ley Fintec · Chile', jurisdiction: 'Chile',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Comisión para el Mercado Financiero',
    effective: 'Ley 21.521 y normativa CMF de registro y autorización en vigor',
    scope: 'Servicios regulados por la Ley Fintec, incluidos los relativos a instrumentos financieros tokenizados cuando entren en sus categorías.',
    practical_effect: 'Figurar en el Registro de Prestadores de Servicios Financieros no basta: debe comprobarse además la autorización del servicio regulado.',
    limitation: 'No existe por esta vía una licencia general para cualquier criptoactivo; primero debe confirmarse que el activo o servicio entra en el perímetro financiero.',
    source_ids: ['cl_cmf_fintech'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Registro y autorización de servicios financieros tecnológicos',
    market_access: 'Inscripción RPSF y autorización específica CMF para cada servicio alcanzado.',
    applies_to: ['Plataformas de financiación colectiva y sistemas alternativos de transacción', 'Intermediación, custodia o asesoría de instrumentos financieros cubiertos'],
    does_not_apply_to: ['Cualquier token por el solo hecho de usar blockchain', 'Registro sin autorización posterior para iniciar el servicio'],
    regulated_activities: ['Intermediación', 'Custodia de instrumentos', 'Asesoría', 'Sistemas de transacción'],
    core_obligations: ['Registro, autorización y capacidad operacional', 'Gobierno, información y gestión de riesgos', 'Segregación y custodia según el servicio'],
    verification_steps: ['Clasificar el token como instrumento financiero o no', 'Consultar registro y autorización CMF por separado', 'Comprobar la actividad exacta y eventuales condiciones'],
    activity_tags: ['issuer', 'custody', 'exchange', 'brokerage', 'advice']
  },
  {
    id: 'colombia-no-general-license', code: 'CO', name: 'Perímetro de activos virtuales · Colombia', jurisdiction: 'Colombia',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'NO_GENERAL_REGIME', authority: 'Superintendencia Financiera de Colombia',
    effective: 'Posición pública vigente de la SFC; sin licencia general de activos virtuales emitida por la SFC',
    scope: 'Delimita qué puede y qué no puede concluirse de la supervisión financiera colombiana sobre negocios con activos virtuales.',
    practical_effect: 'Un proveedor no puede presentarse como autorizado por la SFC para activos virtuales si no existe una autorización sectorial concreta que lo sustente.',
    limitation: 'La ausencia de licencia general no elimina obligaciones societarias, tributarias, de consumo, AML/CFT o de captación y valores.',
    source_ids: ['co_sfc_virtual_assets'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Perímetro sin autorización general VASP de la SFC',
    market_access: 'No hay una licencia VASP general de la SFC; cada actividad debe contrastarse con normas financieras y comerciales existentes.',
    applies_to: ['Empresas que comercializan servicios con activos virtuales en Colombia', 'Entidades vigiladas que evalúan exposición o alianzas con proveedores'],
    does_not_apply_to: ['Una autorización implícita por estar constituido como sociedad', 'Captación, valores o servicios financieros reservados sin licencia sectorial'],
    regulated_activities: ['Promoción', 'Pagos', 'Captación o valores cuando concurran sus elementos'],
    core_obligations: ['No inducir a error sobre supervisión o respaldo estatal', 'Analizar normas AML/CFT, consumidor y tributación', 'Separar fondos del público de una actividad no autorizada'],
    verification_steps: ['Comprobar cualquier afirmación de licencia en el registro de la autoridad citada', 'Clasificar si existe captación, valor o servicio financiero reservado', 'Identificar la entidad legal y la jurisdicción contractual real'],
    activity_tags: ['marketing', 'payments', 'banking']
  },
  {
    id: 'uruguay-psav', code: 'UY', name: 'PSAV · Uruguay', jurisdiction: 'Uruguay',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Banco Central del Uruguay',
    effective: 'Circular 2507 publicada en julio de 2026',
    scope: 'Intercambio, transferencia, custodia y determinados servicios financieros relacionados con activos virtuales.',
    practical_effect: 'La actividad PSAV alcanzada requiere autorización previa del BCU y cumplimiento de las reglas aplicables a su categoría.',
    limitation: 'El software o la infraestructura sin control ni intermediación pueden quedar fuera; cada modelo debe revisarse por funciones reales.',
    source_ids: ['uy_bcu_psav'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Autorización previa de proveedores de activos virtuales',
    market_access: 'Autorización del BCU antes de prestar las actividades PSAV incluidas.',
    applies_to: ['Intercambio fiat/activo virtual y activo virtual/activo virtual', 'Transferencia, custodia, administración y servicios financieros de emisores'],
    does_not_apply_to: ['Proveedor puramente tecnológico sin control sobre activos ni ejecución', 'Una aprobación general de los activos listados por el proveedor'],
    regulated_activities: ['Exchange', 'Custodia', 'Transferencias', 'Servicios financieros vinculados'],
    core_obligations: ['Autorización y gobierno', 'Controles AML/CFT y trazabilidad', 'Custodia y gestión de riesgos operacionales'],
    verification_steps: ['Buscar entidad y categoría en el BCU', 'Comprobar fecha de autorización y actividades', 'Revisar si el servicio controla claves, fondos u órdenes'],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer']
  },
  {
    id: 'peru-psav-aml', code: 'PE', name: 'PSAV · Perú', jurisdiction: 'Perú',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'SBS · Unidad de Inteligencia Financiera',
    effective: 'Resolución SBS 02648-2024 en vigor',
    scope: 'Prevención del lavado de activos y financiación del terrorismo para proveedores de servicios de activos virtuales sujetos a la UIF.',
    practical_effect: 'El PSAV alcanzado debe implantar un sistema AML/CFT, conservar operaciones y reportar; esto no equivale a una licencia integral de mercado.',
    limitation: 'La supervisión AML/CFT no valida solvencia, reservas, custodia, activo ofrecido ni protección del cliente.',
    source_ids: ['pe_sbs_psav_aml'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Supervisión AML/CFT de proveedores de activos virtuales',
    market_access: 'Sujeción y registro conforme al régimen UIF/SBS; no constituye autorización prudencial general.',
    applies_to: ['Proveedores que intercambian, transfieren o custodian activos virtuales', 'Servicios financieros vinculados con oferta o venta de activos virtuales'],
    does_not_apply_to: ['Una licencia de solvencia o conducta de mercado', 'Autocustodia sin prestación de servicio a terceros'],
    regulated_activities: ['Exchange', 'Transferencias', 'Custodia', 'Servicios financieros vinculados'],
    core_obligations: ['KYC y debida diligencia', 'Oficial de cumplimiento y evaluación de riesgos', 'Registro de operaciones y reportes de operaciones sospechosas'],
    verification_steps: ['Comprobar identificación y condición del proveedor', 'Solicitar política AML/CFT y responsable', 'No presentar la supervisión UIF como aprobación comercial'],
    activity_tags: ['custody', 'exchange', 'transfer']
  },
  {
    id: 'singapore-dpt', code: 'SG', name: 'Digital Payment Tokens · Singapur', jurisdiction: 'Singapur',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Monetary Authority of Singapore',
    effective: 'Payment Services Act vigente; directorio oficial consultable por actividad DPT',
    scope: 'Prestación profesional de servicios con digital payment tokens dentro del perímetro territorial y funcional de la PSA.',
    practical_effect: 'Debe comprobarse una licencia Standard o Major Payment Institution y que incluya expresamente Digital Payment Token Service.',
    limitation: 'La licencia de pagos no autoriza por sí sola valores tokenizados, gestión de inversiones ni cualquier servicio desde el extranjero.',
    source_ids: ['sg_mas_dpt_directory'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Licencia de servicios de pago para digital payment tokens',
    market_access: 'Licencia MAS con la actividad DPT incluida en el alcance público.',
    applies_to: ['Exchanges y brokers de DPT', 'Custodios y facilitadores de transferencia cuando entren en la definición legal'],
    does_not_apply_to: ['Una autorización de mercados de capitales', 'Una entidad cuyo registro no incluya Digital Payment Token Service'],
    regulated_activities: ['Exchange', 'Custodia', 'Transferencias', 'Pagos'],
    core_obligations: ['AML/CFT y travel rule aplicable', 'Salvaguarda y conducta según licencia', 'Riesgo tecnológico y continuidad operativa'],
    verification_steps: ['Buscar la entidad en el Financial Institutions Directory', 'Abrir la ficha y confirmar DPT Service', 'Comprobar licencia, estado y demás actividades autorizadas'],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer', 'payments']
  },
  {
    id: 'south-korea-vasp', code: 'KR', name: 'VASP y protección del usuario · Corea del Sur', jurisdiction: 'Corea del Sur',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'KoFIU · Financial Services Commission',
    effective: 'Virtual Asset User Protection Act en vigor desde 19 jul 2024',
    scope: 'VASP registrados y protección de depósitos y activos virtuales de usuarios, vigilancia de operaciones y supervisión.',
    practical_effect: 'El proveedor debe superar el registro KoFIU y cumplir separación de depósitos, custodia y controles de mercado; una app accesible no prueba registro.',
    limitation: 'La ley de protección del usuario no clasifica todos los tokens como productos financieros ni sustituye la normativa de valores.',
    source_ids: ['kr_fsc_virtual_asset_act'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Registro VASP y protección patrimonial del usuario',
    market_access: 'Registro ante KoFIU, con requisitos adicionales para servicios vinculados a cuentas bancarias reales.',
    applies_to: ['Exchanges, brokers, custodios y otros VASP definidos', 'Operadores que mantienen depósitos o activos virtuales de usuarios'],
    does_not_apply_to: ['Una aprobación de cada token negociado', 'Servicios que sean valores sin revisar la legislación financiera'],
    regulated_activities: ['Exchange', 'Custodia', 'Transferencias'],
    core_obligations: ['Separación de depósitos bancarios', 'Custodia mayoritaria fuera de línea y cobertura frente a incidentes', 'Vigilancia de operaciones anómalas y conservación de registros'],
    verification_steps: ['Comprobar registro KoFIU y denominación legal', 'Verificar banco asociado cuando el servicio lo requiera', 'Revisar custodia, seguro o reservas y política de listado'],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer']
  },
  {
    id: 'thailand-digital-assets', code: 'TH', name: 'Digital Asset Business · Tailandia', jurisdiction: 'Tailandia',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'SEC Thailand · Ministry of Finance',
    effective: 'Emergency Decree de 2018 y modificaciones vigentes',
    scope: 'Exchanges, brokers, dealers, gestores de fondos y otros negocios de activos digitales definidos por la normativa.',
    practical_effect: 'La actividad alcanzada necesita licencia; también debe revisarse si un operador extranjero dirige activamente servicios al mercado tailandés.',
    limitation: 'La licencia de una categoría no habilita las demás y no elimina restricciones específicas de tokens, pagos o publicidad.',
    source_ids: ['th_sec_digital_assets', 'th_sec_digital_assets_2025'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Licencias por categoría de negocio de activos digitales',
    market_access: 'Licencia por actividad bajo supervisión SEC y decisión ministerial conforme al régimen.',
    applies_to: ['Exchanges, brokers y dealers de activos digitales', 'Gestores o asesores cuando su actividad esté incluida', 'Operadores extranjeros que dirigen servicios al país en los supuestos legales'],
    does_not_apply_to: ['Una licencia única para todas las categorías', 'Venta o promoción de cualquier token sin revisar su aprobación'],
    regulated_activities: ['Exchange', 'Brokerage', 'Dealer', 'Gestión', 'Asesoramiento'],
    core_obligations: ['Capital y gobierno según categoría', 'Custodia, ciberseguridad y continuidad', 'AML/CFT, conducta y reglas de listado'],
    verification_steps: ['Consultar lista SEC por categoría', 'Comprobar razón social y servicios exactos', 'Revisar admisibilidad del token y reglas de publicidad'],
    activity_tags: ['issuer', 'custody', 'exchange', 'brokerage', 'marketing', 'advice']
  },
  {
    id: 'indonesia-ojk-crypto', code: 'ID', name: 'Activos financieros digitales · Indonesia', jurisdiction: 'Indonesia',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Otoritas Jasa Keuangan',
    effective: 'Supervisión transferida a OJK el 10 ene 2025; POJK 27/2024 y su modificación vigentes',
    scope: 'Negociación y organización del mercado de activos financieros digitales, incluidos criptoactivos, bajo el perímetro OJK.',
    practical_effect: 'La entidad debe figurar en la estructura autorizada por OJK para su función; exchange, broker y custodia no son categorías intercambiables.',
    limitation: 'La autorización de infraestructura o intermediario no garantiza el activo ni cubre actividades bancarias o de pagos separadas.',
    source_ids: ['id_ojk_digital_assets'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Licencias de mercado para activos financieros digitales',
    market_access: 'Licencia OJK específica para la función desempeñada dentro del ecosistema regulado.',
    applies_to: ['Bolsas e infraestructura de mercado', 'Traders/intermediarios y custodios de criptoactivos', 'Operadores de servicios incluidos por OJK'],
    does_not_apply_to: ['Una licencia transversal de banca o pagos', 'Un respaldo público a los activos admitidos'],
    regulated_activities: ['Mercado', 'Brokerage', 'Custodia', 'Compensación y liquidación'],
    core_obligations: ['Licencia, capital y gobierno', 'Protección de activos y seguridad tecnológica', 'Integridad de mercado, AML/CFT y reporte'],
    verification_steps: ['Consultar licencia OJK y función exacta', 'Verificar entidad legal y dominio oficial', 'Comprobar el activo y canal admitidos por el operador'],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer']
  },
  {
    id: 'malaysia-digital-assets', code: 'MY', name: 'Digital Assets · Malasia', jurisdiction: 'Malasia',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Securities Commission Malaysia',
    effective: 'Guidelines on Recognized Markets y marcos de digital assets vigentes',
    scope: 'Operadores de exchanges de activos digitales, custodios, IEO y actividades de mercado de capitales relacionadas.',
    practical_effect: 'Debe verificarse la categoría pública: RMO-DAX para exchange, DAC para custodia e IEO operator para emisión; una no sustituye a otra.',
    limitation: 'La regulación SC no implica que todo token sea aprobado ni resuelve usos de pago bajo otras autoridades.',
    source_ids: ['my_sc_digital_assets'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Reconocimiento y registro por función de mercado digital',
    market_access: 'Registro o reconocimiento SC en la categoría que corresponda al servicio.',
    applies_to: ['Digital asset exchanges', 'Digital asset custodians', 'Operadores IEO y emisores en el perímetro regulado'],
    does_not_apply_to: ['Una autorización general para todos los servicios', 'Un respaldo económico del token listado o emitido'],
    regulated_activities: ['Exchange', 'Custodia', 'Emisión y captación'],
    core_obligations: ['Gobierno, capital y gestión de riesgos', 'Custodia y seguridad tecnológica', 'Admisión de activos, conducta y AML/CFT'],
    verification_steps: ['Consultar el listado oficial de la categoría', 'Comprobar entidad, dominio y fecha de registro', 'Separar exchange, custodio y operador de emisión'],
    activity_tags: ['issuer', 'custody', 'exchange', 'brokerage']
  },
  {
    id: 'philippines-vasp', code: 'PH', name: 'VASP · Filipinas', jurisdiction: 'Filipinas',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Bangko Sentral ng Pilipinas',
    effective: 'Circular 1108 vigente para VASP bajo supervisión BSP',
    scope: 'Proveedores que facilitan intercambio o transferencia de activos virtuales como servicio financiero dentro del perímetro BSP.',
    practical_effect: 'El operador alcanzado debe contar con la autorización o registro BSP aplicable y cumplir controles equivalentes a servicios monetarios.',
    limitation: 'No toda aplicación, autocustodia o emisión de token es un VASP BSP; valores y ofertas pueden activar competencia de la SEC.',
    source_ids: ['ph_bsp_circular_1108'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Licencia y supervisión de servicios monetarios con activos virtuales',
    market_access: 'Autorización BSP para la actividad VASP cubierta, con alcance verificable.',
    applies_to: ['Intercambio entre activo virtual y fiat', 'Transferencia y facilitación de activos virtuales en los supuestos de la circular'],
    does_not_apply_to: ['Software de autocustodia sin intermediación', 'Valores digitales y ofertas públicas bajo otro perímetro'],
    regulated_activities: ['Exchange', 'Transferencias', 'Custodia asociada al servicio'],
    core_obligations: ['Gobierno y controles de riesgo', 'AML/CFT, KYC y travel rule', 'Ciberseguridad, protección al consumidor y reporte'],
    verification_steps: ['Consultar la lista BSP de entidades supervisadas', 'Comprobar la autorización de VASP y nombre comercial', 'Revisar si interviene además la SEC'],
    activity_tags: ['custody', 'exchange', 'transfer', 'payments']
  },
  {
    id: 'kazakhstan-aifc-datf', code: 'KZ', name: 'Digital Asset Trading Facility · AIFC', jurisdiction: 'Kazajistán · AIFC',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'IN_FORCE', authority: 'Astana Financial Services Authority',
    effective: 'Marco AIFC de Digital Asset Service Providers vigente',
    scope: 'Operación de centros de negociación y servicios regulados de activos digitales dentro o desde el AIFC.',
    practical_effect: 'Una plataforma que opera desde el AIFC necesita licencia AFSA para la actividad exacta y debe aparecer en su registro público.',
    limitation: 'El régimen AIFC no debe extrapolarse automáticamente al resto de Kazajistán ni a minería, pagos o banca fuera de su perímetro.',
    source_ids: ['kz_afsa_datf'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Licencia DASP en centro financiero internacional',
    market_access: 'Autorización AFSA para operar un Digital Asset Trading Facility u otro servicio DASP.',
    applies_to: ['Operadores de instalaciones de negociación de activos digitales', 'Intermediarios y custodios cuando solicitan su permiso correspondiente'],
    does_not_apply_to: ['Actividad fuera del AIFC por el solo hecho de tener licencia dentro', 'Minería de Bitcoin o consumo eléctrico'],
    regulated_activities: ['Exchange', 'Brokerage', 'Custodia', 'Trading facility'],
    core_obligations: ['Autorización, capital y gobierno', 'Reglas de mercado, admisión y vigilancia', 'Custodia, ciberseguridad y AML/CFT'],
    verification_steps: ['Buscar la entidad en el registro AFSA', 'Comprobar permisos y restricciones de la licencia', 'Confirmar que la contratación y prestación se realizan dentro del perímetro permitido'],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer']
  },
  {
    id: 'panama-no-general-vasp', code: 'PA', name: 'Perímetro AV/PSAV · Panamá', jurisdiction: 'Panamá',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'NO_GENERAL_REGIME', authority: 'Superintendencia de Bancos de Panamá · autoridades sectoriales',
    effective: 'Evaluación oficial alojada por la SBP: sin marco AV/PSAV integral vigente en el corte publicado',
    scope: 'Delimita la ausencia de autorización uniforme para actividades de activos virtuales y los controles sectoriales que sí pueden concurrir.',
    practical_effect: 'Una sociedad, banco corresponsal o proveedor extranjero no debe presentarse como VASP autorizado en Panamá sin una licencia sectorial concreta y verificable.',
    limitation: 'La ausencia de régimen integral no exime de AML/CFT, banca, valores, pagos, consumo, fiscalidad ni diligencia reforzada del banco receptor.',
    source_ids: ['pa_sbp_imf_vasp'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Perímetro sin licencia VASP general',
    market_access: 'No existe una autorización VASP uniforme; la actividad debe contrastarse con banca, valores, pagos y AML/CFT.',
    applies_to: ['Proveedores que ofrecen exchange, transferencia o custodia a clientes vinculados con Panamá', 'Bancos y sujetos obligados que reciben fondos procedentes de activos virtuales'],
    does_not_apply_to: ['Una aprobación implícita por constituir una sociedad panameña', 'Una exención de debida diligencia bancaria o de normativa de valores'],
    regulated_activities: ['Banca o pagos si concurren sus elementos', 'Valores u oferta pública cuando corresponda', 'Controles AML/CFT'],
    core_obligations: ['Identificación del cliente y origen de fondos', 'No inducir a error sobre licencia o supervisión', 'Análisis sectorial de la actividad y contraparte extranjera'],
    verification_steps: ['Pedir la licencia exacta y autoridad que supuestamente la emitió', 'Comprobar si existe captación, custodia, pago o valor', 'Validar proveedor extranjero y trazabilidad bancaria'],
    activity_tags: ['custody', 'exchange', 'transfer', 'marketing', 'payments', 'banking']
  },
  {
    id: 'costa-rica-no-general-vasp', code: 'CR', name: 'Perímetro cripto · Costa Rica', jurisdiction: 'Costa Rica',
    legal_status: 'SOURCE_GROUNDED', review_status: 'PENDING_LEGAL_SIGNOFF', state: 'NO_GENERAL_REGIME', authority: 'Banco Central de Costa Rica · SUGEF',
    effective: 'Evaluación sectorial SUGEF 2025 identifica ausencia de regulación sobre proveedores de servicios y activos virtuales',
    scope: 'Límites de la supervisión financiera y riesgos operativos en ausencia de una licencia PSAV integral.',
    practical_effect: 'La disponibilidad de un servicio no significa que el proveedor esté supervisado, que el activo sea dinero de curso legal ni que exista protección frente a pérdidas.',
    limitation: 'Deben revisarse por separado pagos, intermediación financiera, captación, AML/CFT, consumo, fiscalidad y cualquier instrumento financiero.',
    source_ids: ['cr_sugef_risk_2025'], source_verified_at: '2026-09-02', legal_reviewed_at: null,
    framework_type: 'Ausencia de licencia VASP general',
    market_access: 'No hay licencia PSAV integral; la legalidad depende de la actividad y de normas sectoriales concurrentes.',
    applies_to: ['Proveedores que ofrecen servicios cripto desde o hacia Costa Rica', 'Usuarios y entidades financieras que asumen exposición o reciben fondos relacionados'],
    does_not_apply_to: ['Reconocimiento como moneda de curso legal', 'Supervisión prudencial automática del exchange o custodio', 'Garantía de recuperación frente a pérdidas'],
    regulated_activities: ['Pagos o remesas cuando entren en su normativa', 'Captación e intermediación financiera', 'Controles AML/CFT'],
    core_obligations: ['No afirmar supervisión inexistente', 'Debida diligencia y origen de fondos según contraparte', 'Cumplir normas sectoriales activadas por la operación'],
    verification_steps: ['Comprobar entidad legal, domicilio y regulador real', 'Separar uso del activo de prestación de un servicio financiero', 'Verificar custodia, contrato y vías de reclamación'],
    activity_tags: ['custody', 'exchange', 'transfer', 'marketing', 'payments', 'banking']
  }
]);

const REGULATORY_DETAILS = Object.freeze({
  'mica-union-europea': {
    framework_type: 'Marco integral de criptoactivos',
    market_access: 'Autorización CASP o habilitación del artículo 60, con alcance de servicios verificable.',
    applies_to: [
      'Emisores y oferentes de criptoactivos cubiertos por MiCA',
      'CASP que presten custodia, negociación, intercambio, ejecución, colocación, transferencia o asesoramiento en la UE',
      'Emisores de tokens referenciados a activos (ART) y tokens de dinero electrónico (EMT)'
    ],
    does_not_apply_to: [
      'Criptoactivos que sean instrumentos financieros u otros productos ya regulados por normativa sectorial',
      'NFT realmente únicos; una serie o colección puede volver a entrar en el perímetro',
      'Una autorización CASP no aprueba ni garantiza los criptoactivos ofrecidos'
    ],
    regulated_activities: ['Emisión y oferta', 'Custodia', 'Exchange', 'Ejecución y órdenes', 'Transferencias', 'Asesoramiento'],
    core_obligations: [
      'Gobierno, capital y salvaguarda según el servicio autorizado',
      'Información al cliente, gestión de conflictos y reclamaciones',
      'White paper y reglas específicas cuando corresponda a emisión',
      'Controles de abuso de mercado para criptoactivos admitidos a negociación'
    ],
    verification_steps: [
      'Comprobar entidad jurídica y autoridad nacional de origen',
      'Leer en el registro los servicios exactos autorizados y el pasaporte',
      'Clasificar el activo antes de asumir que MiCA es la norma aplicable'
    ],
    activity_tags: ['issuer', 'stablecoin', 'custody', 'exchange', 'brokerage', 'transfer', 'advice']
  },
  'mica-espana-2026': {
    framework_type: 'Aplicación nacional de MiCA',
    market_access: 'Desde el 1 de julio de 2026, autorización MiCA válida; el antiguo registro AML no basta.',
    applies_to: [
      'CASP establecidos en España',
      'CASP de otro Estado miembro que hayan notificado el pasaporte para España',
      'Antiguos proveedores españoles que operaban durante la transición'
    ],
    does_not_apply_to: [
      'El registro previo del Banco de España no equivale a autorización MiCA',
      'La ficha española no sustituye la clasificación del producto ni las reglas de valores',
      'Un proveedor autorizado para un servicio no queda habilitado para todos los demás'
    ],
    regulated_activities: ['Custodia', 'Exchange', 'Órdenes', 'Transferencias', 'Asesoramiento', 'Emisión ART/EMT'],
    core_obligations: [
      'Autorización y alcance publicados en registro oficial',
      'Segregación y salvaguarda de activos y fondos cuando proceda',
      'Procedimientos de reclamación, conflictos y continuidad',
      'Supervisión CNMV; competencias específicas del Banco de España para ART y EMT'
    ],
    verification_steps: [
      'Buscar la razón social, no solo la marca comercial',
      'Confirmar servicios autorizados y país de origen en el registro MiCA',
      'Verificar que el dominio y la entidad del contrato coinciden con el registro'
    ],
    activity_tags: ['issuer', 'stablecoin', 'custody', 'exchange', 'brokerage', 'transfer', 'advice']
  },
  'mexico-activos-virtuales': {
    framework_type: 'Ley Fintech y circular bancaria',
    market_access: 'El perímetro depende de la entidad y la operación; no existe una licencia cripto general equivalente a MiCA.',
    applies_to: [
      'Instituciones de tecnología financiera sujetas a la LRITF',
      'Instituciones de crédito que realicen operaciones internas con activos virtuales',
      'Operaciones expresamente comprendidas por la autorización y reglas de Banco de México'
    ],
    does_not_apply_to: [
      'La Circular 4/2019 no autoriza por sí sola una oferta general de criptoactivos al público',
      'Una empresa tecnológica no se convierte en institución regulada solo por usar blockchain',
      'No crea un pasaporte internacional ni una equivalencia con una licencia de exchange extranjera'
    ],
    regulated_activities: ['Operaciones de ITF', 'Operaciones internas bancarias', 'Transmisión de fondos', 'Uso de activos autorizados'],
    core_obligations: [
      'Autorización institucional y cumplimiento del perímetro asignado',
      'Separación de riesgos de las operaciones con activos virtuales',
      'Controles AML y de identificación aplicables a la entidad',
      'Información de riesgos y prohibiciones de representación engañosa'
    ],
    verification_steps: [
      'Identificar si la contraparte es ITF, banco u otra entidad',
      'Comprobar la autorización concreta en CNBV y las reglas de Banco de México',
      'Separar servicio de pago, custodia, intercambio y oferta al público'
    ],
    activity_tags: ['exchange', 'transfer', 'payments', 'banking']
  },
  'emiratos-payment-tokens': {
    framework_type: 'Reglamento federal de payment tokens',
    market_access: 'Licencia o registro CBUAE según emisión, custodia, transferencia o conversión.',
    applies_to: [
      'Emisores de payment tokens denominados en dírhams',
      'Custodios y transferidores de payment tokens',
      'Proveedores de conversión y emisores extranjeros dirigidos al mercado de EAU'
    ],
    does_not_apply_to: [
      'Financial Free Zones, sujetas a sus propios reguladores',
      'Tokens que no cumplen la definición de payment token',
      'Programas de recompensa limitados y otros supuestos expresamente exentos'
    ],
    regulated_activities: ['Emisión', 'Custodia', 'Transferencia', 'Conversión', 'Payment tokens'],
    core_obligations: [
      'Licencia o registro por categoría de servicio',
      'Reservas, redención y salvaguarda cuando corresponda al emisor',
      'Gobierno, gestión de riesgos y controles tecnológicos',
      'AML, protección del cliente e información sobre condiciones del token'
    ],
    verification_steps: [
      'Confirmar si el token es un payment token y en qué moneda está denominado',
      'Determinar si el servicio se presta en EAU o se dirige a personas de EAU',
      'Separar CBUAE de VARA, ADGM y DIFC antes de buscar la licencia'
    ],
    activity_tags: ['issuer', 'stablecoin', 'custody', 'exchange', 'transfer', 'payments']
  },
  'dubai-vara': {
    framework_type: 'Licencia por actividad de activos virtuales',
    market_access: 'Licencia VARA para cada actividad regulada en Dubái, excepto DIFC.',
    applies_to: [
      'VASP en mainland Dubái y sus free zones, salvo DIFC',
      'Emisores de activos virtuales dentro del perímetro VARA',
      'Servicios de asesoramiento, broker-dealer, custodia, exchange, lending, gestión y transferencia'
    ],
    does_not_apply_to: [
      'DIFC, que mantiene un marco separado bajo DFSA',
      'El marco no debe extrapolarse automáticamente a Abu Dabi u otros emiratos',
      'Payment tokens que entren en la competencia federal del CBUAE requieren análisis separado'
    ],
    regulated_activities: ['Advisory', 'Broker-dealer', 'Custodia', 'Exchange', 'Lending', 'Gestión', 'Transferencia', 'Emisión'],
    core_obligations: [
      'Licencia de la actividad y rulebook específico del servicio',
      'Gobierno, capital, tecnología y gestión de riesgos',
      'Segregación, custodia y reglas de mercado según actividad',
      'Aprobación y condiciones particulares para emisión'
    ],
    verification_steps: [
      'Confirmar que la ubicación contractual no es DIFC',
      'Comprobar la actividad exacta en el registro público VARA',
      'Revisar el rulebook de actividad además del reglamento general'
    ],
    activity_tags: ['issuer', 'custody', 'exchange', 'brokerage', 'transfer', 'advice', 'lending']
  },
  'uk-cryptoassets': {
    framework_type: 'Registro AML actual y autorización FSMA futura',
    market_access: 'Registro MLR para actividad en Reino Unido; régimen FSMA previsto desde el 25 de octubre de 2027.',
    applies_to: [
      'Cryptoasset exchange providers que desarrollen negocio en Reino Unido',
      'Custodian wallet providers dentro del perímetro MLR',
      'Cualquier firma, también extranjera, que comunique promociones a consumidores británicos'
    ],
    does_not_apply_to: [
      'El registro MLR no es una autorización general de servicios financieros',
      'El registro no aprueba los tokens ofrecidos ni elimina el riesgo de inversión',
      'El futuro régimen FSMA no debe mostrarse como vigente antes de su fecha operativa'
    ],
    regulated_activities: ['Exchange', 'Custodia', 'Promoción financiera', 'Transferencias', 'Stablecoins desde 2027'],
    core_obligations: [
      'Registro MLR antes de iniciar la actividad comprendida',
      'Controles AML, titularidad efectiva y evaluación de responsables',
      'Promociones claras, equilibradas y comunicadas o aprobadas por vía válida',
      'Preparación de autorización FSMA sin confundirla con el registro actual'
    ],
    verification_steps: [
      'Buscar la entidad en el registro FCA y leer su estatus',
      'Comprobar la vía legal usada para promociones dirigidas a Reino Unido',
      'Distinguir permiso financiero, registro MLR y futura autorización cripto'
    ],
    activity_tags: ['custody', 'exchange', 'transfer', 'marketing', 'stablecoin']
  },
  'hong-kong-vatp': {
    framework_type: 'Licencia dual de plataforma',
    market_access: 'Licencia SFC para VATP centralizada que opere en Hong Kong o comercialice activamente allí.',
    applies_to: [
      'Plataformas centralizadas de negociación de activos virtuales en Hong Kong',
      'Plataformas extranjeras que comercialicen activamente servicios a inversores de Hong Kong',
      'Operadores con security tokens, non-security tokens o ambos'
    ],
    does_not_apply_to: [
      'La inclusión de un token en una plataforma no supone aprobación de la SFC',
      'Un emisor o proveedor de software no es VATP solo por publicar un token o una wallet',
      'La licencia de plataforma no sustituye permisos para otras actividades financieras'
    ],
    regulated_activities: ['Plataforma de negociación', 'Custodia de plataforma', 'Security tokens', 'Non-security tokens', 'Marketing activo'],
    core_obligations: [
      'Licencia AMLO y, cuando corresponda, licencias SFO tipos 1 y 7',
      'Custodia, segregación, admisión de tokens y controles de mercado',
      'Protección del cliente y evaluación de idoneidad según el servicio',
      'Controles tecnológicos, continuidad y prevención de abuso'
    ],
    verification_steps: [
      'Comprobar el nombre legal en la lista pública de VATP',
      'Determinar si la plataforma negocia security tokens, non-security tokens o ambos',
      'Verificar dominios, condiciones territoriales y restricciones del servicio'
    ],
    activity_tags: ['custody', 'exchange', 'brokerage', 'marketing']
  },
  'japan-crypto-exchange': {
    framework_type: 'Registro de exchange e intermediación',
    market_access: 'Registro FSA o Local Finance Bureau; intermediarios sujetos a un régimen específico desde junio de 2026.',
    applies_to: [
      'Proveedores de compra, venta e intercambio de criptoactivos',
      'Intermediarios que conectan usuarios con proveedores registrados',
      'Custodia o gestión de criptoactivos cuando forma parte del servicio regulado'
    ],
    does_not_apply_to: [
      'La lista FSA no respalda el valor ni la seguridad de un criptoactivo',
      'Un activo listado por un proveedor no queda aprobado como inversión',
      'Security tokens y otros productos pueden quedar bajo Financial Instruments and Exchange Act'
    ],
    regulated_activities: ['Compra y venta', 'Intercambio', 'Intermediación', 'Custodia', 'Transferencia'],
    core_obligations: [
      'Registro y publicación de la entidad y los activos gestionados',
      'Segregación de activos de clientes y controles de custodia',
      'Información de riesgos, publicidad y protección del usuario',
      'Controles AML, ciberseguridad y continuidad'
    ],
    verification_steps: [
      'Buscar la entidad en la lista FSA y confirmar su Local Finance Bureau',
      'Comprobar que el activo figura en la ficha del proveedor',
      'Distinguir proveedor de exchange, intermediario y producto financiero tokenizado'
    ],
    activity_tags: ['custody', 'exchange', 'brokerage', 'transfer']
  },
  'australia-vasp': {
    framework_type: 'Registro AML/CTF de VASP',
    market_access: 'Registro AUSTRAC antes de prestar servicios VASP designados; renovación cada tres años.',
    applies_to: [
      'Intercambio entre moneda fiat y activos virtuales',
      'Intercambio cripto a cripto y determinadas transferencias',
      'Custodia y otros servicios VASP designados prestados en Australia'
    ],
    does_not_apply_to: [
      'El registro AUSTRAC no equivale a licencia de servicios financieros',
      'No resuelve clasificación como valor, fiscalidad ni protección del consumidor',
      'Servicios técnicos fuera de las actividades designadas requieren análisis propio'
    ],
    regulated_activities: ['Fiat-cripto', 'Cripto-cripto', 'Custodia', 'Transferencias', 'Oferta de determinados servicios'],
    core_obligations: [
      'Registro AUSTRAC y renovación trienal',
      'Programa AML/CTF basado en riesgo',
      'KYC, monitorización y reportes de operaciones',
      'Conservación de registros y evaluación de riesgos del servicio'
    ],
    verification_steps: [
      'Comprobar la entidad en el registro público VASP',
      'Separar registro AUSTRAC de una eventual licencia ASIC',
      'Confirmar qué servicio designado presta y desde qué entidad'
    ],
    activity_tags: ['custody', 'exchange', 'transfer']
  },
  'us-payment-stablecoins': {
    framework_type: 'Ley federal de payment stablecoins',
    market_access: 'La emisión para personas de EE. UU. queda reservada a permitted payment stablecoin issuers.',
    applies_to: [
      'Emisores federales o estatales permitidos de payment stablecoins',
      'Emisores extranjeros que ofrezcan payment stablecoins a personas de Estados Unidos bajo el régimen aplicable',
      'Reservas, redención y divulgación del payment stablecoin'
    ],
    does_not_apply_to: [
      'No es una licencia general para exchanges, brokers, DeFi o custodia',
      'No cubre automáticamente tokens de inversión ni otros criptoactivos',
      'Un payment stablecoin cubierto no se convierte por ello en depósito bancario asegurado'
    ],
    regulated_activities: ['Emisión de stablecoin', 'Reservas', 'Redención', 'Divulgación', 'Supervisión de emisor'],
    core_obligations: [
      'Reservas permitidas y respaldo conforme al texto legal',
      'Redención y divulgación periódica de composición de reservas',
      'Supervisión federal o estatal según categoría de emisor',
      'Restricciones de emisión, representación y reutilización de reservas'
    ],
    verification_steps: [
      'Confirmar que el activo cumple la definición de payment stablecoin',
      'Identificar al emisor y su supervisor federal o estatal',
      'Revisar reservas, derecho de redención y fecha real de aplicación de cada obligación'
    ],
    activity_tags: ['issuer', 'stablecoin', 'payments']
  }
});

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
    content_type: sourceHealth[source.id]?.content_type || null,
    observed_url: sourceHealth[source.id]?.observed_url || null,
    access_method: 'PUBLIC_OFFICIAL_SOURCE',
    changed_in_session: detectedChanges.includes(source.id)
  }));
  const regimes = clone(REGULATORY_REGIMES).map((regime) => ({
    ...regime,
    ...clone(REGULATORY_DETAILS[regime.id] || {})
  }));
  const checked = sources.filter((source) => source.connection_status !== 'NOT_CHECKED');
  const reachable = sources.filter((source) => source.connection_status === 'CONNECTED');
  const jurisdictionCount = new Set(regimes.map((regime) => regime.jurisdiction)).size;
  const reviewConfig = legalReviewConfigFromEnvironment();
  const reviewLedger = buildLegalReviewSummary(reviewConfig.records, regimes.map((regime) => regime.id), reviewConfig.trustedKeys);
  for (const regime of regimes) {
    if (reviewLedger.signed_regime_ids.includes(regime.id)) {
      regime.legal_status = 'SIGNED_LEGAL_REVIEW';
      regime.review_status = 'SIGNED';
    } else if (!regime.review_status) regime.review_status = regime.legal_reviewed_at ? 'UNSIGNED_LEGACY_REVIEW' : 'PENDING_LEGAL_SIGNOFF';
  }
  return {
    schema_version: 'kaufman-regulation-intelligence-v1',
    source_contract_version: 'official-public-v2',
    generated_at: receivedAt,
    legal_reviewed_at: '2026-07-13',
    legal_review_ledger: reviewLedger,
    review_policy: 'La fuente se monitoriza automáticamente cada 24 horas. Un HTTP correcto prueba accesibilidad, no vigencia jurídica; los cambios de contenido activan revisión editorial.',
    scope: 'Matriz informativa de perímetros regulatorios. No determina si una actividad o entidad concreta necesita licencia.',
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
      ,signed_regime_count: reviewLedger.signed_regime_ids.length
      ,pending_signoff_count: reviewLedger.pending_regime_ids.length
    },
    methodology: 'Cada marco conserva jurisdicción, autoridad, fecha efectiva, perímetro, efecto práctico, límite y enlaces primarios. Kaufman no infiere equivalencia entre registros, licencias o territorios.'
  };
}

export function validateRegulationSnapshot(snapshot) {
  if (snapshot?.schema_version !== 'kaufman-regulation-intelligence-v1') throw new Error('Invalid regulation schema');
  if (snapshot?.source_contract_version !== 'official-public-v2') throw new Error('Invalid regulation source contract');
  const sourceIds = new Set(snapshot.sources.map((source) => source.id));
  if (sourceIds.size !== snapshot.sources.length) throw new Error('Duplicate regulation source IDs');
  const regimeIds = new Set(snapshot.regimes.map((regime) => regime.id));
  if (regimeIds.size !== snapshot.regimes.length) throw new Error('Duplicate regulation regime IDs');
  for (const regime of snapshot.regimes) {
    const required = ['name', 'jurisdiction', 'legal_status', 'state', 'authority', 'effective', 'scope', 'practical_effect', 'limitation', 'framework_type', 'market_access'];
    if (required.some((key) => !regime[key])) throw new Error(`Incomplete regulation regime: ${regime.id}`);
    for (const key of ['applies_to', 'does_not_apply_to', 'regulated_activities', 'core_obligations', 'verification_steps', 'activity_tags']) {
      if (!Array.isArray(regime[key]) || !regime[key].length) throw new Error(`Incomplete regulation comparison field ${key}: ${regime.id}`);
    }
    if (!regime.legal_reviewed_at && !regime.source_verified_at) throw new Error(`Missing review provenance: ${regime.id}`);
    if (!regime.source_ids?.length || regime.source_ids.some((id) => !sourceIds.has(id))) throw new Error(`Invalid regulation sources: ${regime.id}`);
    if (JSON.stringify(regime).toUpperCase().includes('DEMO')) throw new Error(`Demo value in regulation regime: ${regime.id}`);
  }
  if (snapshot.data_quality.demo_record_count !== 0) throw new Error('Regulation snapshot cannot publish demo records');
  return true;
}

export async function checkRegulatorySource(source, fetchImpl = fetch) {
  const checkedAt = new Date().toISOString();
  let lastError = null;
  let lastStatus = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const headers = {
        accept: 'text/html,application/xhtml+xml,application/pdf,application/json;q=0.9,*/*;q=0.8',
        'user-agent': attempt === 0
          ? 'Mozilla/5.0 (compatible; KaufmanRegulationMonitor/1.1; +https://kaufmanadvisory.io)'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0 Safari/537.36'
      };
      if (attempt < 2) headers.range = 'bytes=0-65535';
      const response = await fetchImpl(source.url, {
        method: 'GET',
        redirect: 'follow',
        headers,
        signal: AbortSignal.timeout(12_000)
      });
      lastStatus = response.status;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const fingerprint = createHash('sha256').update(bytes.subarray(0, 65_536)).digest('hex');
      return {
        checked_at: checkedAt,
        connection_status: 'CONNECTED',
        http_status: response.status,
        provider_timestamp: response.headers.get('last-modified'),
        etag: response.headers.get('etag'),
        content_fingerprint: fingerprint,
        content_type: response.headers.get('content-type'),
        observed_url: response.url || source.url
      };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }
  return { checked_at: checkedAt, connection_status: 'DEGRADED', http_status: lastStatus, error: lastError?.message || 'Source unavailable' };
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
