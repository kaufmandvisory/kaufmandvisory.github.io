const freeze = (value) => Object.freeze(value);

export const FISCAL_CALCULATION_MODELS = freeze({
  espana: freeze({
    kind: 'PROGRESSIVE_INCREMENTAL', currency: 'EUR', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['es_irpf_crypto', 'es_savings_rates', 'es_lirpf_current'],
    brackets: freeze([
      { up_to: 6_000, rate: 0.19 }, { up_to: 50_000, rate: 0.21 },
      { up_to: 200_000, rate: 0.23 }, { up_to: 300_000, rate: 0.27 },
      { up_to: null, rate: 0.30 }
    ]),
    result_label: 'IRPF incremental estimado sobre la base del ahorro',
    exclusions: ['Compensación de pérdidas', 'Impuesto sobre el Patrimonio', 'Solidaridad', 'Actividad económica']
  }),
  portugal: freeze({
    kind: 'PORTUGAL_CRYPTO_2026', currency: 'EUR', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['pt_cirs_10', 'pt_cirs_72', 'pt_cirs_68'],
    special_rate: 0.28, long_holding_days: 365, mandatory_aggregation_threshold: 86_634,
    general_brackets: freeze([
      { up_to: 8_342, rate: 0.125 }, { up_to: 12_587, rate: 0.157 },
      { up_to: 17_838, rate: 0.212 }, { up_to: 23_089, rate: 0.241 },
      { up_to: 29_397, rate: 0.311 }, { up_to: 43_090, rate: 0.349 },
      { up_to: 46_566, rate: 0.431 }, { up_to: 86_634, rate: 0.446 },
      { up_to: null, rate: 0.48 }
    ]),
    result_label: 'IRS incremental estimado',
    exclusions: ['Activos que sean valores mobiliarios', 'Contrapartes en jurisdicciones excluidas', 'Pérdida de residencia', 'Actividad empresarial']
  }),
  'estados-unidos': freeze({
    kind: 'US_CAPITAL_GAIN_2026', currency: 'USD', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['us_digital_assets', 'us_2026_rates'],
    ordinary_brackets: freeze({
      single: freeze([{ up_to: 12_400, rate: .10 }, { up_to: 50_400, rate: .12 }, { up_to: 105_700, rate: .22 }, { up_to: 201_775, rate: .24 }, { up_to: 256_225, rate: .32 }, { up_to: 640_600, rate: .35 }, { up_to: null, rate: .37 }]),
      joint: freeze([{ up_to: 24_800, rate: .10 }, { up_to: 100_800, rate: .12 }, { up_to: 211_400, rate: .22 }, { up_to: 403_550, rate: .24 }, { up_to: 512_450, rate: .32 }, { up_to: 768_700, rate: .35 }, { up_to: null, rate: .37 }]),
      head: freeze([{ up_to: 17_700, rate: .10 }, { up_to: 67_450, rate: .12 }, { up_to: 105_700, rate: .22 }, { up_to: 201_750, rate: .24 }, { up_to: 256_200, rate: .32 }, { up_to: 640_600, rate: .35 }, { up_to: null, rate: .37 }]),
      separate: freeze([{ up_to: 12_400, rate: .10 }, { up_to: 50_400, rate: .12 }, { up_to: 105_700, rate: .22 }, { up_to: 201_775, rate: .24 }, { up_to: 256_225, rate: .32 }, { up_to: 384_350, rate: .35 }, { up_to: null, rate: .37 }])
    }),
    long_term_brackets: freeze({
      single: freeze([{ up_to: 49_450, rate: 0 }, { up_to: 545_500, rate: .15 }, { up_to: null, rate: .20 }]),
      joint: freeze([{ up_to: 98_900, rate: 0 }, { up_to: 613_700, rate: .15 }, { up_to: null, rate: .20 }]),
      head: freeze([{ up_to: 66_200, rate: 0 }, { up_to: 579_600, rate: .15 }, { up_to: null, rate: .20 }]),
      separate: freeze([{ up_to: 49_450, rate: 0 }, { up_to: 306_850, rate: .15 }, { up_to: null, rate: .20 }])
    }),
    result_label: 'Impuesto federal incremental estimado',
    exclusions: ['Impuesto estatal', 'NIIT', 'AMT', 'Deducciones', 'Ajustes de base y lotes']
  }),
  'emiratos-arabes-unidos': freeze({
    kind: 'UAE_NATURAL_PERSON', currency: 'AED', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['ae_natural_person', 'ae_natural_person_guide'],
    business_turnover_threshold: 1_000_000, zero_rate_threshold: 375_000, business_rate: .09,
    result_label: 'Corporate Tax incremental estimado para persona física',
    exclusions: ['Sociedades', 'Free zones', 'IVA', 'Residencia fiscal extranjera', 'Small Business Relief']
  }),
  argentina: freeze({
    kind: 'ARGENTINA_CEDULAR', currency: 'ARS', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['ar_income_tax'],
    rates: freeze({ local_unadjusted: .05, foreign_or_adjusted: .15, foreign_source: .15 }),
    result_label: 'Impuesto cedular estimado sobre la ganancia',
    exclusions: ['Deducción especial', 'Quebrantos', 'Bienes Personales', 'Ingresos Brutos', 'Conversión monetaria']
  }),
  colombia: freeze({
    kind: 'COLOMBIA_INCOME_2026', currency: 'COP', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['co_unified_2023', 'co_tax_statute', 'co_2026_uvt'],
    uvt_value: 52_374, long_holding_days: 730, occasional_gain_rate: .15,
    ordinary_brackets_uvt: freeze([
      { up_to: 1_090, rate: 0 }, { up_to: 1_700, rate: .19 },
      { up_to: 4_100, rate: .28 }, { up_to: 8_670, rate: .33 },
      { up_to: 18_970, rate: .35 }, { up_to: 31_000, rate: .37 },
      { up_to: null, rate: .39 }
    ]),
    result_label: 'Impuesto nacional incremental estimado',
    exclusions: ['ICA y tributos territoriales', 'Rentas exentas', 'Deducciones', 'Patrimonio', 'Valoración especial inexistente']
  }),
  chile: freeze({
    kind: 'CHILE_IGC_2026', currency: 'CLP', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['cl_crypto_gain', 'cl_igc_2026'],
    annual_table: freeze([
      { up_to: 11_265_804, factor: 0, rebate: 0 },
      { up_to: 25_035_120, factor: .04, rebate: 450_632.16 },
      { up_to: 41_725_200, factor: .08, rebate: 1_452_036.96 },
      { up_to: 58_415_280, factor: .135, rebate: 3_746_922.96 },
      { up_to: 75_105_360, factor: .23, rebate: 9_296_374.56 },
      { up_to: 100_140_480, factor: .304, rebate: 14_854_171.20 },
      { up_to: 258_696_240, factor: .35, rebate: 19_460_633.28 },
      { up_to: null, factor: .40, rebate: 32_395_445.28 }
    ]),
    result_label: 'Impuesto Global Complementario incremental estimado',
    exclusions: ['Corrección monetaria del coste', 'Habitualidad', 'Actividad empresarial', 'Créditos y exenciones']
  }),
  mexico: freeze({
    kind: 'MEXICO_PROVISIONAL_126', currency: 'MXN', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['mx_lisr_126', 'mx_prodecon'],
    provisional_rate_on_gross: .20,
    result_label: 'Pago provisional orientativo del artículo 126',
    exclusions: ['Cuota anual final', 'Deducciones', 'Retenedor no residente', 'Actividad empresarial', 'Tratamiento definitivo de la permuta']
  }),
  'reino-unido': freeze({
    kind: 'UK_CGT_2026', currency: 'GBP', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['uk_hmrc_crypto_manual', 'uk_cgt_rates'],
    annual_exempt_amount: 3_000, basic_rate_band: 37_700, basic_rate: .18, higher_rate: .24,
    result_label: 'CGT incremental estimado',
    exclusions: ['Pérdidas y ganancias del mismo ejercicio', 'Pooling y reglas same-day/30-day', 'Residencia y remittance basis', 'Actividad profesional']
  }),
  alemania: freeze({
    kind: 'GERMANY_PRIVATE_DISPOSAL', currency: 'EUR', year: 2026,
    events: ['sell_fiat', 'crypto_swap'], source_ids: ['de_bmf_crypto', 'de_estg_23'],
    long_holding_days: 365, annual_exemption_threshold: 1_000,
    result_label: 'Tratamiento orientativo de disposición privada',
    exclusions: ['Tipo personal final', 'Actividad empresarial', 'Otras disposiciones privadas del año', 'Identificación y valoración de lotes']
  })
});

export function progressiveTax(amount, brackets) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const bracket of brackets) {
    const upper = bracket.up_to == null ? Infinity : bracket.up_to;
    tax += Math.max(0, Math.min(amount, upper) - lower) * bracket.rate;
    if (amount <= upper) break;
    lower = upper;
  }
  return tax;
}

const incrementalProgressiveTax = (priorBase, gain, brackets) =>
  Math.max(0, progressiveTax(priorBase + gain, brackets) - progressiveTax(priorBase, brackets));

function chileTax(amount, table) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const row = table.find((item) => item.up_to == null || amount <= item.up_to) || table.at(-1);
  return Math.max(0, amount * row.factor - row.rebate);
}

const result = (model, gain, taxEstimate, extra = {}) => {
  const roundedTax = Math.round(Math.max(0, taxEstimate) * 100) / 100;
  return ({
  status: 'CALCULATED', currency: model.currency, gain, tax_estimate: roundedTax,
  effective_rate: gain > 0 ? roundedTax / gain : 0,
  result_label: model.result_label, source_ids: model.source_ids, exclusions: model.exclusions, ...extra
  });
};

export function estimateFiscalScenario(input) {
  const model = FISCAL_CALCULATION_MODELS[input.jurisdiction];
  if (!model) return { status: 'UNAVAILABLE', reason: 'Jurisdicción no cubierta.' };
  if (!model.events.includes(input.event)) return { status: 'INPUT_REQUIRED', reason: 'Este evento aún requiere calificación profesional antes de calcular.' };
  if (input.profile === 'company') return { status: 'OUT_OF_SCOPE', reason: 'El contrato de cálculo cubre personas físicas, no sociedades.' };
  const proceeds = Number(input.proceeds);
  const cost = Number(input.cost);
  const priorBase = Math.max(0, Number(input.prior_base) || 0);
  const holdingDays = Math.max(0, Number(input.holding_days) || 0);
  if (!Number.isFinite(proceeds) || !Number.isFinite(cost) || proceeds < 0 || cost < 0) return { status: 'INPUT_REQUIRED', reason: 'Introduce valor de salida y coste fiscal.' };
  const gain = proceeds - cost;
  if (gain <= 0) return result(model, gain, 0, { status: 'NO_POSITIVE_GAIN', method: 'No se calcula cuota positiva; el tratamiento de pérdidas queda fuera del modelo.' });

  if (model.kind === 'PROGRESSIVE_INCREMENTAL') return result(model, gain, incrementalProgressiveTax(priorBase, gain, model.brackets), { method: 'Diferencia entre la cuota de la base del ahorro con y sin esta ganancia.' });
  if (model.kind === 'PORTUGAL_CRYPTO_2026') {
    if (input.event === 'crypto_swap') return result(model, gain, 0, { status: 'DEFERRED', method: 'Permuta cripto a cripto: diferimiento bajo las condiciones del artículo 10.º.' });
    if (holdingDays >= model.long_holding_days) return result(model, gain, 0, { status: 'CONDITIONAL_EXCLUSION', method: 'Exclusión por tenencia mínima de 365 días, condicionada por activo y contraparte.' });
    if (priorBase + gain >= model.mandatory_aggregation_threshold) return result(model, gain, incrementalProgressiveTax(priorBase, gain, model.general_brackets), { method: 'Englobamiento obligatorio estimado al alcanzarse el último escalón.' });
    return result(model, gain, gain * model.special_rate, { method: 'Tasa especial del 28 % para saldo positivo de criptoactivos.' });
  }
  if (model.kind === 'US_CAPITAL_GAIN_2026') {
    const filing = model.ordinary_brackets[input.filing_status] ? input.filing_status : 'single';
    const isLong = holdingDays > 365;
    const brackets = isLong ? model.long_term_brackets[filing] : model.ordinary_brackets[filing];
    return result(model, gain, incrementalProgressiveTax(priorBase, gain, brackets), { method: `${isLong ? 'Ganancia de capital a largo plazo' : 'Ganancia a corto plazo como renta ordinaria'}; estado de declaración ${filing}.` });
  }
  if (model.kind === 'UAE_NATURAL_PERSON') {
    if (input.profile === 'individual-investor') return result(model, gain, 0, { status: 'PERSONAL_INVESTMENT_EXCLUDED', method: 'Inversión personal fuera del Corporate Tax, bajo el perfil declarado.' });
    const turnover = Number(input.turnover);
    if (!Number.isFinite(turnover) || turnover < 0) return { status: 'INPUT_REQUIRED', reason: 'Introduce el volumen de negocio anual para una actividad en EAU.' };
    if (turnover <= model.business_turnover_threshold) return result(model, gain, 0, { status: 'BELOW_TURNOVER_THRESHOLD', method: 'Volumen de negocio empresarial no superior a AED 1.000.000.' });
    const corporateTax = (base) => Math.max(0, base - model.zero_rate_threshold) * model.business_rate;
    return result(model, gain, corporateTax(priorBase + gain) - corporateTax(priorBase), { method: '9 % sobre renta imponible que excede AED 375.000; turnover superior a AED 1.000.000.' });
  }
  if (model.kind === 'ARGENTINA_CEDULAR') {
    const treatment = model.rates[input.tax_context] ? input.tax_context : 'foreign_or_adjusted';
    return result(model, gain, gain * model.rates[treatment], { method: `${(model.rates[treatment] * 100).toLocaleString('es-ES')} % según fuente y moneda declaradas (${treatment}).` });
  }
  if (model.kind === 'COLOMBIA_INCOME_2026') {
    if (holdingDays >= model.long_holding_days && input.tax_context === 'capital_asset') return result(model, gain, gain * model.occasional_gain_rate, { method: 'Ganancia ocasional estimada: activo fijo mantenido dos años o más.' });
    const priorUvt = priorBase / model.uvt_value, gainUvt = gain / model.uvt_value;
    return result(model, gain, incrementalProgressiveTax(priorUvt, gainUvt, model.ordinary_brackets_uvt) * model.uvt_value, { method: `Renta ordinaria incremental; UVT 2026 = ${model.uvt_value.toLocaleString('es-ES')} COP.` });
  }
  if (model.kind === 'CHILE_IGC_2026') return result(model, gain, Math.max(0, chileTax(priorBase + gain, model.annual_table) - chileTax(priorBase, model.annual_table)), { method: 'Diferencia en IGC anual 2026; el coste introducido debe estar corregido monetariamente.' });
  if (model.kind === 'MEXICO_PROVISIONAL_126') return result(model, gain, proceeds * model.provisional_rate_on_gross, { status: 'CONDITIONAL_PROVISIONAL', effective_rate: null, method: '20 % sobre el importe total como pago provisional si resulta aplicable el artículo 126; no es la cuota anual.' });
  if (model.kind === 'UK_CGT_2026') {
    const taxableGain = Math.max(0, gain - model.annual_exempt_amount);
    const basicCapacity = Math.max(0, model.basic_rate_band - priorBase);
    const lowerPart = Math.min(taxableGain, basicCapacity);
    const higherPart = Math.max(0, taxableGain - lowerPart);
    return result(model, gain, lowerPart * model.basic_rate + higherPart * model.higher_rate, { method: 'Aplica el annual exempt amount de £3.000 y reparte la ganancia restante entre 18 % y 24 % según la capacidad declarada de la banda básica.' });
  }
  if (model.kind === 'GERMANY_PRIVATE_DISPOSAL') {
    if (holdingDays > model.long_holding_days) return result(model, gain, 0, { status: 'OUTSIDE_PRIVATE_DISPOSAL_WINDOW', method: 'Tenencia superior a un año: la disposición privada queda fuera de §23 EStG bajo el perfil declarado.' });
    if (priorBase + gain < model.annual_exemption_threshold) return result(model, gain, 0, { status: 'BELOW_ANNUAL_EXEMPTION_THRESHOLD', method: 'La suma declarada de ganancias privadas permanece por debajo de la Freigrenze anual de €1.000.' });
    return { status: 'INPUT_REQUIRED', reason: 'La ganancia está dentro de un año y alcanza la Freigrenze: el tipo depende de la renta imponible total alemana. Kaufman no inventa una cuota.' };
  }
  return { status: 'UNAVAILABLE', reason: 'Modelo de cálculo no disponible.' };
}
