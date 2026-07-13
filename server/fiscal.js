import { CONFIG } from './config.js';

export const FISCAL_EVENTS = Object.freeze([
  { id: 'sell_fiat', label: 'Venta a moneda fiat', short: 'Venta fiat' },
  { id: 'crypto_swap', label: 'Permuta cripto a cripto', short: 'Permuta' },
  { id: 'staking', label: 'Staking y recompensas', short: 'Staking' },
  { id: 'mining', label: 'Minería y validación', short: 'Minería' },
  { id: 'holding', label: 'Tenencia y declaración', short: 'Tenencia' }
]);

export const SOURCE_REGISTRY = Object.freeze([
  { id: 'es_irpf_crypto', jurisdiction: 'espana', authority: 'Agencia Tributaria', title: 'IRPF 2025 · monedas virtuales', url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c11-ganancias-perdidas-patrimoniales/monedas-virtuales/compra-venta-monedas-virtuales-tributacion-inversor.html', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2025-07-29', monitor: true },
  { id: 'es_savings_rates', jurisdiction: 'espana', authority: 'Agencia Tributaria', title: 'Gravamen de la base liquidable del ahorro', url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-aplicable-contribuyentes-irpf-residentes-extranjero/gravamen-base-liquidatable-ahorro.html'.replace('liquidatable','liquidable'), source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2026-03-17' },
  { id: 'es_modelo_721', jurisdiction: 'espana', authority: 'Agencia Tributaria', title: 'Modelo 721 · monedas virtuales en el extranjero', url: 'https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/declaraciones-informativas/modelo-721-decla-sobre-monedas-extranjero/preguntas-frecuentes-sobre-modelo-721/cuando-se-entiende-moneda-virtual-extranjero.html', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: null },
  { id: 'pt_cirs_10', jurisdiction: 'portugal', authority: 'Autoridade Tributária e Aduaneira', title: 'Código do IRS · artigo 10.º', url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs10.aspx', source_type: 'CONSOLIDATED_LAW', binding_level: 'PRIMARY_LAW', source_updated_at: '2026-05-20', monitor: true },
  { id: 'pt_crypto_guide', jurisdiction: 'portugal', authority: 'Autoridade Tributária e Aduaneira', title: 'Guia fiscal de produtos financeiros', url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Guias/Documents/Guia_Fiscal_produtos_financeiros.pdf', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2025-11-01' },
  { id: 'pt_cirs_31', jurisdiction: 'portugal', authority: 'Autoridade Tributária e Aduaneira', title: 'Código do IRS · regime simplificado', url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/ra/Pages/irs31ra_202503.aspx', source_type: 'CONSOLIDATED_LAW', binding_level: 'PRIMARY_LAW', source_updated_at: '2025-03-01' },
  { id: 'us_digital_assets', jurisdiction: 'estados-unidos', authority: 'Internal Revenue Service', title: 'Digital assets', url: 'https://www.irs.gov/filing/digital-assets', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2026-06-29', monitor: true },
  { id: 'us_1099_da', jurisdiction: 'estados-unidos', authority: 'Internal Revenue Service', title: 'Instructions for Form 1099-DA (2026)', url: 'https://www.irs.gov/instructions/i1099da', source_type: 'FORM_INSTRUCTIONS', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2026-06-27' },
  { id: 'ae_natural_person', jurisdiction: 'emiratos-arabes-unidos', authority: 'Federal Tax Authority', title: 'Corporate Tax · natural persons', url: 'https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics/basis.of.taxation.natural.person.aspx', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2026-06-25', monitor: true },
  { id: 'ae_vat_virtual_assets', jurisdiction: 'emiratos-arabes-unidos', authority: 'Federal Tax Authority', title: 'VAT Public Clarification VATP040', url: 'https://tax.gov.ae/Datafolder/Files/Pdf/2025/VATP040%20-%20Amendments%20to%20VAT%20ER%20-%2014%2003%202025.pdf', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2025-03-14' },
  { id: 'ar_income_tax', jurisdiction: 'argentina', authority: 'ARCA', title: 'Impuesto a las Ganancias · criptoactivos', url: 'https://arca.gob.ar/economia-digital/criptoactivos/impuesto-a-las-ganancias.asp', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: null, monitor: true },
  { id: 'ar_wealth_tax', jurisdiction: 'argentina', authority: 'ARCA', title: 'Bienes Personales · criptoactivos', url: 'https://arca.gob.ar/economia-digital/criptoactivos/impuesto-sobre-los-bienes-personales.asp', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: null },
  { id: 'ar_vat', jurisdiction: 'argentina', authority: 'ARCA', title: 'IVA · criptoactivos', url: 'https://arca.gob.ar/economia-digital/criptoactivos/impuesto-al-valor-agregado.asp', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: null },
  { id: 'co_unified_2023', jurisdiction: 'colombia', authority: 'DIAN', title: 'Concepto Unificado sobre Criptoactivos 18075 de 2023', url: 'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_18075_2023.htm', source_type: 'ADMINISTRATIVE_DOCTRINE', binding_level: 'OFFICIAL_INTERPRETATION', source_updated_at: '2023-10-18', monitor: true },
  { id: 'co_concept_2026', jurisdiction: 'colombia', authority: 'DIAN', title: 'Concepto 5146 de 2026 · CARF y valoración', url: 'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_5146_2026.htm', source_type: 'ADMINISTRATIVE_DOCTRINE', binding_level: 'OFFICIAL_INTERPRETATION', source_updated_at: '2026-04-01' },
  { id: 'cl_crypto_faq', jurisdiction: 'chile', authority: 'Servicio de Impuestos Internos', title: 'Criptomonedas · renta e IVA', url: 'https://www.sii.cl/preguntas_frecuentes/criptomonedas/001_250_7833.htm', source_type: 'ADMINISTRATIVE_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2025-10-23', monitor: true },
  { id: 'cl_renta_2026', jurisdiction: 'chile', authority: 'Servicio de Impuestos Internos', title: 'Guía Práctica de Declaración de Renta 2026', url: 'https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf', source_type: 'FILING_GUIDANCE', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2026-04-01' },
  { id: 'cl_f1964', jurisdiction: 'chile', authority: 'Servicio de Impuestos Internos', title: 'Formulario 1964 · activos digitales', url: 'https://www.sii.cl/ayudas/ayudas_por_servicios/2120-formularios_y_plazos_2026-2171.html', source_type: 'REPORTING_REGISTER', binding_level: 'OFFICIAL_GUIDANCE', source_updated_at: '2026-01-01' },
  { id: 'mx_prodecon', jurisdiction: 'mexico', authority: 'PRODECON', title: 'Ingresos de personas físicas por enajenación de criptomonedas', url: 'https://www.prodecon.gob.mx/Documentos/bannerPrincipal/2021/CRIPTOMONEDAS_.pdf', source_type: 'INTERPRETIVE_STUDY', binding_level: 'NON_BINDING_OFFICIAL_GUIDANCE', source_updated_at: '2021-11-01', monitor: true }
]);

const fact = (status, trigger, category, rate, timing, reporting, sourceIds, limitation) => ({
  status, trigger, category, rate, timing, reporting, source_ids: sourceIds, limitation
});

const JURISDICTIONS = Object.freeze([
  {
    id: 'espana', code: 'ES', name: 'España', region: 'Unión Europea', currency: 'EUR', coordinates: { lat: 40.4, lon: -3.7 }, confidence: 'HIGH', legal_reviewed_at: '2026-07-13',
    scope: 'Persona física residente · inversión fuera de actividad económica', summary: 'Venta y permuta generan ganancia o pérdida patrimonial; la tenencia exterior puede activar información específica.',
    facts: {
      sell_fiat: fact('VERIFIED', 'Sí', 'Ganancia o pérdida patrimonial en la base del ahorro', 'Escala 19 %–30 % del ejercicio 2025; cálculo progresivo sobre la base total del ahorro', 'En la transmisión', 'IRPF; conservar valor y fecha de adquisición, gastos y valor de transmisión', ['es_irpf_crypto','es_savings_rates'], 'No incorpora situación autonómica, patrimonio, compensación de pérdidas ni actividad económica.'),
      crypto_swap: fact('VERIFIED', 'Sí', 'Permuta con ganancia o pérdida patrimonial', 'Escala del ahorro; valor de transmisión según reglas de permuta', 'En cada intercambio por otro criptoactivo', 'IRPF por operación', ['es_irpf_crypto','es_savings_rates'], 'El cálculo exige valoración en euros de ambos activos en la fecha de la permuta.'),
      staking: fact('REVIEW_REQUIRED', 'Condicional', 'Rendimiento cuya categoría depende del contrato y de la organización de medios', 'No existe una tasa única publicable sin calificar la renta', 'Según puesta a disposición o realización aplicable', 'IRPF y, si existe actividad, obligaciones económicas', ['es_irpf_crypto'], 'La guía de transmisión no resuelve todos los modelos de staking; requiere análisis del producto.'),
      mining: fact('REVIEW_REQUIRED', 'Sí, si existe renta', 'Actividad económica cuando existe ordenación de medios', 'Escala general y obligaciones de actividad; no se calcula aquí', 'Devengo propio de la actividad', 'Alta, registros y declaraciones según el caso', ['es_irpf_crypto'], 'La fuente conectada no contiene una regla minera completa para todos los perfiles.'),
      holding: fact('VERIFIED', 'No por la mera tenencia en IRPF', 'Obligación informativa separada para determinadas monedas custodiadas en el extranjero', 'Sin tasa de IRPF por mera tenencia; otros impuestos pueden aplicar', 'Saldo a 31 de diciembre para la obligación informativa', 'Modelo 721 cuando se cumplan localización y umbrales; patrimonio depende de normativa aplicable', ['es_modelo_721'], 'No concluye obligación sin conocer custodio, saldo conjunto y residencia autonómica.')
    }
  },
  {
    id: 'portugal', code: 'PT', name: 'Portugal', region: 'Unión Europea', currency: 'EUR', coordinates: { lat: 39.6, lon: -8.0 }, confidence: 'HIGH', legal_reviewed_at: '2026-07-13',
    scope: 'Persona singular residente · criptoactivo que no sea valor mobiliario', summary: 'El periodo de 365 días y la forma de contraprestación cambian el momento de tributación.',
    facts: {
      sell_fiat: fact('VERIFIED', 'Sí si se mantiene menos de 365 días; exclusión condicionada desde 365 días', 'Mais-valia · categoria G', '28 % como tasa especial, con opción o supuestos de englobamiento; exclusión ≥365 días bajo condiciones', 'En la alienación onerosa a fiat o especie no cripto', 'Anexo G o G1 según tratamiento', ['pt_cirs_10','pt_crypto_guide'], 'No cubre criptoactivos que sean valores mobiliarios ni contrapartes de jurisdicciones excluidas.'),
      crypto_swap: fact('VERIFIED', 'Diferido bajo condiciones', 'No hay tributación inmediata cuando la contraprestación es otro criptoactivo', 'La base se traslada al activo recibido', 'Hasta posterior alienación a fiat o especie no cripto', 'Mantener trazabilidad de coste y periodo', ['pt_cirs_10','pt_crypto_guide'], 'La excepción depende de residencia/contraparte y naturaleza del activo.'),
      staking: fact('VERIFIED', 'Condicional', 'Rendimiento de capital recibido en cripto y tratado al realizarse según el art. 5', 'Tratamiento como mais-valia al disponer del cripto recibido', 'En la alienación posterior del activo recibido', 'Declaración según categoría y evento de salida', ['pt_crypto_guide'], 'No cubre staking organizado como actividad empresarial.'),
      mining: fact('VERIFIED', 'Sí', 'Categoria B · actividad empresarial/profesional', 'Coeficiente 0,95 en régimen simplificado para minería, antes de aplicar la escala', 'En la alienación onerosa según reglas de actividad', 'Obligaciones de actividad y registros', ['pt_cirs_31'], 'Coeficiente no equivale a tipo efectivo; pueden aplicar contabilidad organizada y otras reglas.'),
      holding: fact('VERIFIED', 'No por mera tenencia', 'Sin imposición anual específica por mantener el activo', 'La exclusión de venta ≥365 días no es universal', 'La pérdida de residencia puede equipararse a alienación', 'Conservar fecha, coste, transferencias y jurisdicción de contraparte', ['pt_cirs_10'], 'No confundir ausencia de hecho por tenencia con exención futura garantizada.')
    }
  },
  {
    id: 'estados-unidos', code: 'US', name: 'Estados Unidos', region: 'Federal', currency: 'USD', coordinates: { lat: 38.0, lon: -97.0 }, confidence: 'HIGH', legal_reviewed_at: '2026-07-13',
    scope: 'Contribuyente individual · impuesto federal; excluye reglas estatales', summary: 'Los activos digitales son propiedad: venta y permuta realizan ganancia; recompensas y minería generan renta ordinaria.',
    facts: {
      sell_fiat: fact('VERIFIED', 'Sí', 'Capital gain/loss si era activo de capital', 'Corto o largo plazo según periodo de tenencia y renta total', 'En la disposición', 'Form 8949 y Schedule D; 1099-DA no sustituye el cálculo de base', ['us_digital_assets','us_1099_da'], 'No incluye impuesto estatal, net investment income tax ni limitaciones personales.'),
      crypto_swap: fact('VERIFIED', 'Sí', 'Intercambio de propiedad por otra propiedad', 'Ganancia o pérdida sobre valor de mercado en USD', 'En el intercambio', 'Form 8949 / Schedule D cuando sea activo de capital', ['us_digital_assets'], 'La identidad de lotes y costes de transacción afecta la base.'),
      staking: fact('VERIFIED', 'Sí', 'Ordinary income', 'Valor de mercado cuando existe dominio y control; posterior disposición genera segundo evento', 'Al recibir/controlar la recompensa', 'Schedule 1 u otro formulario según actividad', ['us_digital_assets'], 'La clasificación empresarial y self-employment requiere hechos adicionales.'),
      mining: fact('VERIFIED', 'Sí', 'Ordinary income; puede ser trade or business', 'Valor de mercado al recibir; posible self-employment tax', 'Al recibir/controlar la recompensa', 'Schedule 1 o Schedule C según organización de la actividad', ['us_digital_assets'], 'No calcula deducciones, depreciación, gastos ni impuesto estatal.'),
      holding: fact('VERIFIED', 'No por mera tenencia', 'Propiedad; la pregunta de activos digitales distingue tenencia de recepción/disposición', 'Sin tasa federal por mera tenencia', 'Declaración al recibir o disponer', 'Pregunta de activos digitales; 1099-DA para ventas de brokers dentro de su alcance', ['us_digital_assets','us_1099_da'], 'Un formulario informativo incompleto no elimina la obligación de declarar la operación real.')
    }
  },
  {
    id: 'emiratos-arabes-unidos', code: 'AE', name: 'Emiratos Árabes Unidos', region: 'Federal', currency: 'AED', coordinates: { lat: 24.3, lon: 54.4 }, confidence: 'HIGH', legal_reviewed_at: '2026-07-13',
    scope: 'Persona física · distinción inversión personal / business activity', summary: 'La inversión personal se excluye del Corporate Tax; la actividad empresarial supera el umbral por volumen de negocio, no por ganancia.',
    facts: {
      sell_fiat: fact('VERIFIED', 'Condicional', 'Fuera de Corporate Tax si es personal investment income; dentro si deriva de business activity', 'Registro cuando el turnover empresarial supera AED 1 millón; la inversión personal se excluye', 'Según realización y naturaleza de la actividad', 'Registro de Corporate Tax solo si se cumplen los requisitos empresariales', ['ae_natural_person'], 'No toda operación cripto es automáticamente inversión personal; importan frecuencia, organización y finalidad.'),
      crypto_swap: fact('REVIEW_REQUIRED', 'Condicional', 'Sigue la distinción entre inversión personal y actividad empresarial', 'No hay tasa personal única aplicable al supuesto sin calificar la actividad', 'Según tratamiento de la actividad', 'Registros si forma parte de business activity', ['ae_natural_person'], 'La página oficial conectada no publica una regla autónoma para cada permuta cripto.'),
      staking: fact('REVIEW_REQUIRED', 'Condicional', 'Puede ser inversión personal o actividad empresarial según hechos', 'No calculable sin calificación', 'Según derecho a la recompensa y actividad', 'Trazabilidad y posible registro empresarial', ['ae_natural_person'], 'Requiere revisar contrato, escala y organización.'),
      mining: fact('VERIFIED', 'Condicional', 'Actividad empresarial; tratamiento VAT depende de si existe destinatario identificable', 'Corporate Tax si se cumplen condiciones; VAT tiene análisis separado', 'Según actividad y prestación', 'Registro CT/VAT cuando proceda', ['ae_natural_person','ae_vat_virtual_assets'], 'El umbral de AED 1 millón es turnover empresarial, no beneficio neto.'),
      holding: fact('VERIFIED', 'No por mera inversión personal', 'Personal investment income excluido de business activity para Corporate Tax', 'Sin impuesto federal personal sobre la mera tenencia en este marco', 'No aplica por mera tenencia', 'Conservar evidencia de carácter personal frente a empresarial', ['ae_natural_person'], 'No cubre free zones, sociedades, residencia en otro Estado ni impuestos extranjeros.')
    }
  },
  {
    id: 'argentina', code: 'AR', name: 'Argentina', region: 'América del Sur', currency: 'ARS', coordinates: { lat: -34.6, lon: -64.0 }, confidence: 'HIGH', legal_reviewed_at: '2026-07-13',
    scope: 'Persona humana residente · marco nacional', summary: 'Las monedas digitales están expresamente alcanzadas en Ganancias y ARCA las considera gravadas en Bienes Personales.',
    facts: {
      sell_fiat: fact('VERIFIED', 'Sí', 'Impuesto cedular para la ganancia de la enajenación', '5 % en pesos sin ajuste o 15 % en moneda extranjera/con ajuste según la guía ARCA', 'En la enajenación', 'Impuesto a las Ganancias', ['ar_income_tax'], 'Fuente, moneda, coste y localización pueden cambiar el encuadre.'),
      crypto_swap: fact('VERIFIED', 'Sí', 'Enajenación incluye permuta/cambio', 'La alícuota depende de moneda y fuente de la renta', 'En la permuta', 'Ganancias y trazabilidad de valoración', ['ar_income_tax'], 'La valoración y fuente de monedas descentralizadas requieren criterio específico.'),
      staking: fact('NOT_DETERMINED', 'No concluido', 'Sin regla específica suficiente en las fuentes conectadas', 'No publicable', 'No determinado', 'Revisión profesional', ['ar_income_tax'], 'No se extrapola el tratamiento de minería a staking.'),
      mining: fact('VERIFIED', 'Sí', 'Renta gravada cualquiera sea la persona que realice PoW', 'Según régimen aplicable al contribuyente y actividad', 'Al obtener la recompensa según reglas aplicables', 'Ganancias; actividad y facturación según caso', ['ar_income_tax'], 'No calcula ingresos brutos provinciales, gastos ni valoración.'),
      holding: fact('VERIFIED', 'Sí para Bienes Personales si se cumplen condiciones generales', 'ARCA considera criptoactivos gravados como bienes', 'Alícuotas y mínimos del periodo; no se fija una tasa única aquí', 'Valuación a cierre del periodo', 'Bienes Personales web · tipo de bien criptoactivos', ['ar_wealth_tax'], 'La localización y valuación siguen siendo puntos jurídicamente sensibles.')
    }
  },
  {
    id: 'colombia', code: 'CO', name: 'Colombia', region: 'América del Sur', currency: 'COP', coordinates: { lat: 4.6, lon: -74.1 }, confidence: 'HIGH', legal_reviewed_at: '2026-07-13',
    scope: 'Persona natural residente · reglas generales del Estatuto Tributario', summary: 'DIAN trata criptoactivos como intangibles y reconoce que no existe definición ni valoración tributaria especial en la ley.',
    facts: {
      sell_fiat: fact('VERIFIED', 'Sí', 'Ingreso ordinario o ganancia ocasional según destinación y periodo', 'Escala/régimen general; no existe tasa cripto única', 'Cuando se realiza el ingreso', 'Renta y patrimonio', ['co_unified_2023','co_concept_2026'], 'Clasificar activo fijo vs movible y fuente nacional exige hechos del contribuyente.'),
      crypto_swap: fact('VERIFIED', 'Sí', 'Permuta de activo intangible con análisis de ingreso y coste fiscal', 'Régimen general', 'En la permuta', 'Renta; soportar valor patrimonial y valor de enajenación', ['co_unified_2023'], 'No hay metodología legal especial de valoración cripto.'),
      staking: fact('VERIFIED', 'Sí si produce ingreso', 'Ingreso en especie; DeFi puede generar intereses, utilidades u otros conceptos', 'Según naturaleza fiscal del rendimiento', 'Al percibirlo o realizarlo según obligación contable', 'Renta y posible información exógena', ['co_unified_2023'], 'La etiqueta del protocolo no determina la categoría tributaria.'),
      mining: fact('VERIFIED', 'Sí', 'Ingreso derivado de actividad con criptoactivos', 'Régimen general y obligaciones de actividad', 'Según realización del ingreso', 'Renta, facturación e información exógena cuando corresponda', ['co_unified_2023'], 'No calcula costes, ICA ni obligaciones territoriales.'),
      holding: fact('VERIFIED', 'Sí como información patrimonial', 'Activo intangible incluido en patrimonio a 31 de diciembre', 'Sin base especial: reglas generales de valoración patrimonial', 'Cierre del año gravable', 'Declaración de renta/patrimonio; CARF afecta reporte por proveedores', ['co_unified_2023','co_concept_2026'], 'El CARF no sustituye la obligación material ni crea por sí solo una tasa.')
    }
  },
  {
    id: 'chile', code: 'CL', name: 'Chile', region: 'América del Sur', currency: 'CLP', coordinates: { lat: -33.5, lon: -70.7 }, confidence: 'HIGH', legal_reviewed_at: '2026-07-13',
    scope: 'Persona natural residente · marco nacional', summary: 'La venta genera renta bajo reglas generales y no está afecta a IVA por tratarse de un bien incorporal.',
    facts: {
      sell_fiat: fact('VERIFIED', 'Sí', 'Renta por diferencia entre valor de venta y coste tributario', 'Impuesto Global Complementario o régimen empresarial según actividad', 'En la venta', 'Formulario 22 y respaldos de adquisición/venta', ['cl_crypto_faq','cl_renta_2026'], 'Habitualidad, actividad y régimen del contribuyente modifican el resultado.'),
      crypto_swap: fact('REVIEW_REQUIRED', 'Condicional', 'Posible enajenación bajo reglas generales', 'No existe tasa cripto única', 'Según configuración jurídica de la permuta', 'Mantener valoración y trazabilidad', ['cl_renta_2026'], 'La fuente conectada no resuelve de forma autónoma todas las permutas.'),
      staking: fact('NOT_DETERMINED', 'No concluido', 'Sin regla específica suficiente en las fuentes conectadas', 'No publicable', 'No determinado', 'Revisión profesional', ['cl_renta_2026'], 'No se asimila automáticamente a interés o actividad.'),
      mining: fact('REVIEW_REQUIRED', 'Sí si produce renta', 'Actividad generadora de renta', 'Régimen general o empresarial', 'Según devengo/percibo aplicable', 'Renta y registros de actividad', ['cl_renta_2026'], 'No hay una tasa única ni cálculo sin estructura de costes.'),
      holding: fact('VERIFIED', 'No por mera tenencia; existe reporte por terceros', 'Formulario 1964 informa activos digitales respecto de residentes por sujetos obligados', 'Sin tasa por mera tenencia en este hecho', 'Reporte anual del obligado informante', 'F1964 · plazo oficial de proveedores; no es una autodeclaración universal del titular', ['cl_f1964'], 'No confundir reporte de terceros con obligación personal de presentar el formulario.')
    }
  },
  {
    id: 'mexico', code: 'MX', name: 'México', region: 'América del Norte', currency: 'MXN', coordinates: { lat: 23.6, lon: -102.5 }, confidence: 'MEDIUM', legal_reviewed_at: '2026-07-13',
    scope: 'Persona física residente · criterio interpretativo, no régimen cripto específico', summary: 'No existe un régimen fiscal integral específico conectado; PRODECON propone tratar la venta como enajenación de bienes.',
    facts: {
      sell_fiat: fact('INTERPRETIVE', 'Probablemente sí', 'Enajenación de bienes según análisis PRODECON', 'Puede existir pago provisional/retención del 20 % sobre el importe bajo art. 126; no equivale al impuesto final', 'En la enajenación', 'ISR y comprobación según partes de la operación', ['mx_prodecon'], 'Criterio no vinculante y anterior a 2026; requiere confirmar ley vigente y mecánica de la contraparte.'),
      crypto_swap: fact('NOT_DETERMINED', 'No concluido', 'Sin criterio específico suficiente conectado', 'No publicable', 'No determinado', 'Revisión de la operación concreta', ['mx_prodecon'], 'No se extiende automáticamente la conclusión de venta a toda permuta.'),
      staking: fact('NOT_DETERMINED', 'No concluido', 'Reglas generales según naturaleza del ingreso', 'No publicable', 'No determinado', 'Revisión profesional', ['mx_prodecon'], 'No existe guía oficial específica conectada para el producto.'),
      mining: fact('REVIEW_REQUIRED', 'Sí si genera ingreso', 'Actividad empresarial/profesional bajo reglas generales', 'Depende del régimen del contribuyente', 'Según percepción y actividad', 'ISR, IVA y comprobantes según caso', ['mx_prodecon'], 'La fuente conectada se centra en enajenación, no resuelve minería de forma completa.'),
      holding: fact('NOT_DETERMINED', 'Sin hecho específico conectado por mera tenencia', 'No hay impuesto patrimonial federal cripto específico identificado', 'No publicable como exención', 'No determinado', 'Conservar coste y control de wallets/exchanges', ['mx_prodecon'], 'Ausencia de regla específica en la fuente no equivale a exención.')
    }
  }
]);

const CHANGE_SIGNALS = Object.freeze([
  { id: 'us-1099da-2026', date: '2026-06-28', jurisdiction: 'estados-unidos', title: 'Form 1099-DA entra en fase de reporte 2026', impact: 'Brokers reportan ventas y, para determinados activos cubiertos adquiridos desde 2026, información de base.', source_ids: ['us_1099_da'], confidence: 'HIGH' },
  { id: 'pt-cirs-2026', date: '2026-05-20', jurisdiction: 'portugal', title: 'Portugal actualiza la numeración del artículo 10.º', impact: 'Se conserva la exclusión condicionada desde 365 días y el diferimiento de determinadas permutas.', source_ids: ['pt_cirs_10'], confidence: 'HIGH' },
  { id: 'co-carf-2026', date: '2026-04-01', jurisdiction: 'colombia', title: 'DIAN precisa CARF y la ausencia de valoración especial', impact: 'Aumenta el reporte por proveedores, pero continúan aplicándose reglas generales de valoración y renta.', source_ids: ['co_concept_2026'], confidence: 'HIGH' },
  { id: 'cl-f1964-2026', date: '2026-01-01', jurisdiction: 'chile', title: 'Formulario 1964 para información de activos digitales', impact: 'El reporte corresponde a sujetos obligados sobre contribuyentes residentes; no es una autodeclaración universal.', source_ids: ['cl_f1964'], confidence: 'HIGH' }
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export function buildFiscalSnapshot(sourceHealth = {}, receivedAt = new Date().toISOString()) {
  const jurisdictions = clone(JURISDICTIONS);
  const sources = SOURCE_REGISTRY.map((source) => ({
    ...source,
    checked_at: sourceHealth[source.id]?.checked_at || null,
    connection_status: sourceHealth[source.id]?.connection_status || 'NOT_CHECKED',
    http_status: sourceHealth[source.id]?.http_status || null
  }));
  const facts = jurisdictions.flatMap((jurisdiction) => Object.values(jurisdiction.facts));
  const sourcedFacts = facts.filter((row) => row.source_ids?.length);
  const resolvedFacts = facts.filter((row) => row.status !== 'NOT_DETERMINED');
  const sourceJurisdictions = new Set(sources.map((source) => source.jurisdiction));
  const checkedSources = sources.filter((source) => source.connection_status !== 'NOT_CHECKED');
  const reachableSources = sources.filter((source) => source.connection_status === 'CONNECTED');
  return {
    schema_version: 'kaufman-fiscal-intelligence-v1',
    generated_at: receivedAt,
    legal_reviewed_at: '2026-07-13',
    review_policy: 'Monitorización diaria de disponibilidad; revisión jurídica editorial cuando cambia una fuente. La accesibilidad no certifica vigencia material.',
    scope: 'Comparación informativa para personas físicas residentes. No calcula una deuda tributaria ni sustituye asesoramiento.',
    events: clone(FISCAL_EVENTS),
    jurisdictions,
    sources,
    change_signals: clone(CHANGE_SIGNALS),
    data_quality: {
      jurisdiction_count: jurisdictions.length,
      fact_count: facts.length,
      facts_with_source_pct: Math.round(sourcedFacts.length / facts.length * 10_000) / 100,
      resolved_fact_pct: Math.round(resolvedFacts.length / facts.length * 10_000) / 100,
      high_confidence_jurisdictions: jurisdictions.filter((row) => row.confidence === 'HIGH').length,
      primary_jurisdiction_coverage_pct: Math.round(sourceJurisdictions.size / jurisdictions.length * 10_000) / 100,
      source_count: sources.length,
      checked_source_count: checkedSources.length,
      reachable_source_pct: checkedSources.length ? Math.round(reachableSources.length / checkedSources.length * 10_000) / 100 : null,
      provider_timestamp_available: false,
      final_tax_liability_calculated: false
    },
    decision_contract: {
      required_inputs: ['jurisdiction', 'event', 'taxpayer_type', 'tax_residence', 'activity_character', 'holding_period', 'cost_basis', 'proceeds', 'custody_location'],
      output: ['trigger', 'category', 'rate_mechanism', 'timing', 'reporting', 'sources', 'limitations'],
      prohibited_output: ['personalized_advice', 'final_tax_liability', 'residence_recommendation', 'guaranteed_exemption']
    },
    methodology: 'Hecho fiscal por jurisdicción y evento; las tasas solo se muestran cuando una fuente oficial permite contextualizarlas. INTERPRETIVE y REVIEW_REQUIRED bloquean cualquier conclusión automática.'
  };
}

export function validateFiscalSnapshot(snapshot) {
  if (snapshot?.schema_version !== 'kaufman-fiscal-intelligence-v1') throw new Error('Invalid fiscal schema');
  const eventIds = snapshot.events.map((event) => event.id);
  if (new Set(eventIds).size !== eventIds.length) throw new Error('Duplicate fiscal event IDs');
  const jurisdictionIds = snapshot.jurisdictions.map((row) => row.id);
  if (new Set(jurisdictionIds).size !== jurisdictionIds.length) throw new Error('Duplicate jurisdiction IDs');
  for (const jurisdiction of snapshot.jurisdictions) {
    if (!jurisdiction.coordinates || !Number.isFinite(jurisdiction.coordinates.lat) || !Number.isFinite(jurisdiction.coordinates.lon)) throw new Error(`Invalid coordinates: ${jurisdiction.id}`);
    for (const eventId of eventIds) {
      const row = jurisdiction.facts[eventId];
      if (!row || !row.status || !row.trigger || !row.category || !row.rate || !row.limitation) throw new Error(`Incomplete fiscal fact: ${jurisdiction.id}/${eventId}`);
      if (!row.source_ids?.length) throw new Error(`Unsourced fiscal fact: ${jurisdiction.id}/${eventId}`);
    }
  }
  if (snapshot.data_quality.final_tax_liability_calculated !== false) throw new Error('Fiscal snapshot must not calculate final liability');
  return true;
}

export async function checkFiscalSource(source, fetchImpl = fetch) {
  const checkedAt = new Date().toISOString();
  try {
    let response = await fetchImpl(source.url, { method: 'HEAD', redirect: 'follow', headers: { 'user-agent': 'Kaufman-Fiscal-Intelligence/1.0' }, signal: AbortSignal.timeout(8_000) });
    if (response.status === 405) response = await fetchImpl(source.url, { method: 'GET', redirect: 'follow', headers: { range: 'bytes=0-1024', 'user-agent': 'Kaufman-Fiscal-Intelligence/1.0' }, signal: AbortSignal.timeout(8_000) });
    return { checked_at: checkedAt, connection_status: response.ok ? 'CONNECTED' : 'DEGRADED', http_status: response.status };
  } catch (error) {
    return { checked_at: checkedAt, connection_status: 'DEGRADED', http_status: null, error: error.message };
  }
}

export class FiscalConnector {
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
    const initial = buildFiscalSnapshot(this.sourceHealth);
    validateFiscalSnapshot(initial);
    this.onData(initial);
    this.onHealth('fiscal_registry', { connection_status: 'CONNECTED', last_message_at: initial.generated_at, monitoring_status: 'STARTING' });
    this.refresh();
  }

  stop() { this.stopped = true; clearTimeout(this.timer); }

  async refresh() {
    const monitored = SOURCE_REGISTRY.filter((source) => source.monitor);
    const results = await Promise.all(monitored.map(async (source) => [source.id, await checkFiscalSource(source, this.fetchImpl)]));
    this.sourceHealth = Object.fromEntries(results);
    const snapshot = buildFiscalSnapshot(this.sourceHealth);
    validateFiscalSnapshot(snapshot);
    this.onData(snapshot);
    const connected = results.filter(([, status]) => status.connection_status === 'CONNECTED').length;
    this.onHealth('fiscal_registry', {
      connection_status: connected ? 'CONNECTED' : 'DEGRADED',
      last_message_at: snapshot.generated_at,
      monitored_sources: results.length,
      reachable_sources: connected
    });
    if (!this.stopped) this.timer = setTimeout(() => this.refresh(), this.config.fiscalIntervalMs);
  }
}
