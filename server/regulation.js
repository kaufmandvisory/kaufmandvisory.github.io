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
      const response = await fetchImpl(source.url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          accept: 'text/html,application/xhtml+xml,application/pdf,application/json;q=0.9,*/*;q=0.8',
          range: 'bytes=0-65535',
          'user-agent': 'Mozilla/5.0 (compatible; KaufmanRegulationMonitor/1.1; +https://kaufmanadvisory.io)'
        },
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
