import { CONFIG } from './config.js';

const DEFILLAMA_PROTOCOLS_URL = 'https://api.llama.fi/protocols';
const DEFILLAMA_STABLECOINS_URL = 'https://stablecoins.llama.fi/stablecoins?includePrices=true';

const SEGMENTS = Object.freeze([
  ['Treasury Bills', 'Deuda soberana tokenizada'],
  ['Private Credit', 'Crédito privado tokenizado'],
  ['Commodities', 'Materias primas tokenizadas'],
  ['Stocks & ETFs', 'Acciones y ETF tokenizados'],
  ['Money Market Funds', 'Fondos monetarios onchain'],
  ['Real Estate', 'Inmobiliario tokenizado']
]);

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function isSyntheticChainKey(value) {
  return /(^|[-_])(borrowed|staking|pool2)$/i.test(String(value));
}

export function buildTokenizationSnapshot(protocolPayload, stablecoinPayload, observedAt = new Date().toISOString()) {
  if (!Array.isArray(protocolPayload)) throw new Error('DefiLlama protocols response is not an array');
  if (!Array.isArray(stablecoinPayload?.peggedAssets)) throw new Error('DefiLlama stablecoin response is incomplete');

  const excluded = [];
  const rwaProtocols = protocolPayload.filter((protocol) => {
    if (protocol?.category !== 'RWA') return false;
    const tvl = finitePositive(protocol.tvl);
    if (!tvl) { excluded.push({ name: protocol?.name || 'unknown', reason: 'TVL_INVALID_OR_ZERO' }); return false; }
    if (protocol.misrepresentedTokens === true) { excluded.push({ name: protocol.name, reason: 'MISREPRESENTED_TOKENS' }); return false; }
    if (protocol.doublecounted === true) { excluded.push({ name: protocol.name, reason: 'PROVIDER_DOUBLECOUNTED' }); return false; }
    return true;
  }).map((protocol) => ({ ...protocol, tvl: Number(protocol.tvl) }));

  const totalRwaTvl = rwaProtocols.reduce((sum, protocol) => sum + protocol.tvl, 0);
  const sorted = [...rwaProtocols].sort((a, b) => b.tvl - a.tvl);

  const segments = SEGMENTS.map(([tag, label]) => {
    const matches = rwaProtocols.filter((protocol) => Array.isArray(protocol.tags) && protocol.tags.includes(tag));
    const value = matches.reduce((sum, protocol) => sum + protocol.tvl, 0);
    return {
      key: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-'), tag, label,
      value_usd: value,
      share_of_tracked_rwa_pct: totalRwaTvl ? round(value / totalRwaTvl * 100) : null,
      protocol_count: matches.length,
      methodology: 'Suma del TVL de protocolos RWA con esta etiqueta; las categorías pueden solaparse.'
    };
  }).filter((segment) => segment.value_usd > 0);

  const networks = new Map();
  const chainAllocation = new Map();
  let networkAllocatedTvl = 0;
  let rawChainBreakdownMismatchRecords = 0;
  for (const protocol of rwaProtocols) {
    const values = protocol.chainTvls && typeof protocol.chainTvls === 'object' ? protocol.chainTvls : {};
    const entries = Object.entries(values)
      .filter(([network, rawValue]) => !isSyntheticChainKey(network) && finitePositive(rawValue))
      .map(([network, rawValue]) => [network, Number(rawValue)]);
    const rawTotal = entries.reduce((sum, [, value]) => sum + value, 0);
    const deviationPct = rawTotal ? Math.abs(rawTotal / protocol.tvl - 1) * 100 : null;
    if (deviationPct !== null && deviationPct > 2) rawChainBreakdownMismatchRecords += 1;
    chainAllocation.set(protocol.slug || protocol.name, {
      networks: entries.map(([network]) => network),
      raw_total_usd: rawTotal || null,
      raw_deviation_pct: deviationPct === null ? null : round(deviationPct),
      status: rawTotal ? 'NORMALIZED_TO_PRODUCT_TVL' : 'UNAVAILABLE'
    });
    if (!rawTotal) continue;
    networkAllocatedTvl += protocol.tvl;
    for (const [network, rawValue] of entries) {
      const value = protocol.tvl * rawValue / rawTotal;
      const record = networks.get(network) || { name: network, value_usd: 0, protocols: new Set() };
      record.value_usd += value;
      record.protocols.add(protocol.slug || protocol.name);
      networks.set(network, record);
    }
  }
  const networkRows = [...networks.values()].map((record) => ({
    name: record.name,
    value_usd: record.value_usd,
    share_pct: totalRwaTvl ? round(record.value_usd / totalRwaTvl * 100) : null,
    protocol_count: record.protocols.size
  })).sort((a, b) => b.value_usd - a.value_usd);

  const stablecoins = stablecoinPayload.peggedAssets.filter((asset) => asset?.pegType === 'peggedUSD');
  let stablecoinValue = 0;
  let stablecoinPrevious = 0;
  let stablecoinExcluded = 0;
  const stablecoinNetworks = new Map();
  for (const asset of stablecoins) {
    const circulating = finitePositive(asset?.circulating?.peggedUSD);
    const price = finitePositive(asset?.price);
    if (!circulating || !price) { stablecoinExcluded += 1; continue; }
    stablecoinValue += circulating * price;
    const previous = finitePositive(asset?.circulatingPrevDay?.peggedUSD);
    if (previous) stablecoinPrevious += previous * price;
    for (const [network, row] of Object.entries(asset.chainCirculating || {})) {
      const chainSupply = finitePositive(row?.current?.peggedUSD);
      if (!chainSupply) continue;
      stablecoinNetworks.set(network, (stablecoinNetworks.get(network) || 0) + chainSupply * price);
    }
  }
  const stablecoinNetworkRows = [...stablecoinNetworks.entries()].map(([name, value]) => ({
    name,
    value_usd: value,
    share_pct: stablecoinValue ? round(value / stablecoinValue * 100) : null
  })).sort((a, b) => b.value_usd - a.value_usd);

  const rwaLending = protocolPayload.filter((protocol) => protocol?.category === 'RWA Lending' && finitePositive(protocol.tvl) && protocol.misrepresentedTokens !== true && protocol.doublecounted !== true);
  const rwaLendingTvl = rwaLending.reduce((sum, protocol) => sum + Number(protocol.tvl), 0);
  const topFiveValue = sorted.slice(0, 5).reduce((sum, protocol) => sum + protocol.tvl, 0);
  const topTenValue = sorted.slice(0, 10).reduce((sum, protocol) => sum + protocol.tvl, 0);
  const multichainValue = rwaProtocols.filter((protocol) => Array.isArray(protocol.chains) && protocol.chains.length > 1).reduce((sum, protocol) => sum + protocol.tvl, 0);
  const allNetworks = new Set(networkRows.map((network) => network.name));
  const products = sorted.map((protocol) => {
    const allocation = chainAllocation.get(protocol.slug || protocol.name);
    const projectUrl = safeUrl(protocol.url);
    const adapterUrl = safeUrl(protocol.tvlCodePath);
    return {
      id: String(protocol.slug || protocol.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: protocol.name,
      slug: protocol.slug || null,
      value_usd: protocol.tvl,
      share_pct: totalRwaTvl ? round(protocol.tvl / totalRwaTvl * 100) : null,
      change_7d_pct: Number.isFinite(Number(protocol.change_7d)) ? Number(protocol.change_7d) : null,
      tags: Array.isArray(protocol.tags) ? protocol.tags : [],
      networks: allocation?.networks || [],
      source_url: projectUrl,
      adapter_url: adapterUrl,
      verification_status: 'AGGREGATOR_OBSERVED',
      data_quality: {
        project_link: projectUrl ? 'PRESENT' : 'MISSING',
        adapter_link: adapterUrl ? 'PRESENT' : 'MISSING',
        network_distribution: allocation?.status || 'UNAVAILABLE',
        raw_chain_breakdown_deviation_pct: allocation?.raw_deviation_pct ?? null
      }
    };
  });
  const moverUniverse = products.filter((product) => product.value_usd >= 10_000_000 && Number.isFinite(product.change_7d_pct));
  const gainers = [...moverUniverse].filter((product) => product.change_7d_pct > 0).sort((a, b) => b.change_7d_pct - a.change_7d_pct).slice(0, 5);
  const decliners = [...moverUniverse].filter((product) => product.change_7d_pct < 0).sort((a, b) => a.change_7d_pct - b.change_7d_pct).slice(0, 5);
  const leadingSegment = [...segments].sort((a, b) => b.value_usd - a.value_usd)[0] || null;
  const leadingNetwork = networkRows[0] || null;
  const sourceLinksPresent = products.filter((product) => product.source_url).length;
  const adapterLinksPresent = products.filter((product) => product.adapter_url).length;
  const weeklyChangePresent = products.filter((product) => Number.isFinite(product.change_7d_pct)).length;
  const exclusionReasons = Object.fromEntries([...new Set(excluded.map((row) => row.reason))].map((reason) => [reason, excluded.filter((row) => row.reason === reason).length]));
  const insights = [
    totalRwaTvl && leadingSegment ? {
      id: 'leading-asset-class', level: 'STRUCTURE', title: 'La deuda soberana domina la tokenización rastreada',
      statement: `${leadingSegment.label} representa ${leadingSegment.share_of_tracked_rwa_pct.toFixed(1)} % del capital RWA rastreado.`,
      evidence: { numerator_usd: leadingSegment.value_usd, denominator_usd: totalRwaTvl, protocol_count: leadingSegment.protocol_count },
      methodology: 'Participación de la etiqueta líder sobre el TVL RWA elegible; las etiquetas pueden solaparse.'
    } : null,
    totalRwaTvl ? {
      id: 'market-concentration', level: topFiveValue / totalRwaTvl >= 0.5 ? 'RISK' : 'STRUCTURE', title: 'La concentración importa más que el número de productos',
      statement: `Los cinco mayores productos concentran ${round(topFiveValue / totalRwaTvl * 100).toFixed(1)} % del capital rastreado.`,
      evidence: { top_5_value_usd: topFiveValue, total_rwa_tvl_usd: totalRwaTvl },
      methodology: 'Suma de los cinco mayores productos dividida por el TVL RWA elegible.'
    } : null,
    leadingNetwork ? {
      id: 'network-concentration', level: 'INFRASTRUCTURE', title: 'La infraestructura también está concentrada',
      statement: `${leadingNetwork.name} concentra ${leadingNetwork.share_pct.toFixed(1)} % de la asignación RWA por red.`,
      evidence: { network_value_usd: leadingNetwork.value_usd, allocated_tvl_usd: networkAllocatedTvl, protocol_count: leadingNetwork.protocol_count },
      methodology: 'Los chainTvls de cada producto se normalizan a su TVL total antes de agregarse por red.'
    } : null,
    gainers[0] ? {
      id: 'weekly-mover', level: 'MOVEMENT', title: 'Mayor expansión semanal con escala material',
      statement: `${gainers[0].name} varía ${gainers[0].change_7d_pct.toFixed(2)} % en 7 días sobre ${round(gainers[0].value_usd).toLocaleString('en-US')} USD rastreados.`,
      evidence: { product_id: gainers[0].id, value_usd: gainers[0].value_usd, change_7d_pct: gainers[0].change_7d_pct, minimum_tvl_usd: 10_000_000 },
      methodology: 'Mayor variación positiva entre productos con al menos 10 M USD de TVL.'
    } : null,
    {
      id: 'data-limit', level: 'DATA_QUALITY', title: 'La cobertura cuantitativa supera a la evidencia institucional',
      statement: `${sourceLinksPresent} de ${products.length} productos tienen enlace de proyecto y ${excluded.length} registros RWA fueron excluidos.`,
      evidence: { products: products.length, project_links_present: sourceLinksPresent, excluded_records: excluded.length },
      methodology: 'Completitud de enlaces en la respuesta de Protocols y reglas de exclusión Kaufman.'
    }
  ].filter(Boolean);

  return {
    schema_version: 'kaufman-tokenization-markets-v2',
    received_at: observedAt,
    provider_timestamp: null,
    verification_status: 'SOURCE_OBSERVED',
    confidence: 'MEDIUM',
    sources: [
      { name: 'DefiLlama · Protocols', url: DEFILLAMA_PROTOCOLS_URL, role: 'TVL, etiquetas y distribución por red' },
      { name: 'DefiLlama · Stablecoins', url: DEFILLAMA_STABLECOINS_URL, role: 'circulación, precio observado y distribución por red' }
    ],
    kpis: {
      tracked_rwa_tvl_usd: totalRwaTvl,
      usd_stablecoin_value_usd: stablecoinValue,
      rwa_lending_tvl_usd: rwaLendingTvl,
      treasury_bills_tvl_usd: segments.find((segment) => segment.tag === 'Treasury Bills')?.value_usd || null
    },
    ratios: {
      tracked_rwa_to_stablecoin_pct: stablecoinValue ? round(totalRwaTvl / stablecoinValue * 100) : null,
      top_5_concentration_pct: totalRwaTvl ? round(topFiveValue / totalRwaTvl * 100) : null,
      top_10_concentration_pct: totalRwaTvl ? round(topTenValue / totalRwaTvl * 100) : null,
      multichain_tvl_share_pct: totalRwaTvl ? round(multichainValue / totalRwaTvl * 100) : null,
      network_allocation_coverage_pct: totalRwaTvl ? round(networkAllocatedTvl / totalRwaTvl * 100) : null,
      stablecoin_to_rwa_multiple: totalRwaTvl ? round(stablecoinValue / totalRwaTvl, 2) : null,
      stablecoin_supply_change_24h_pct: stablecoinPrevious ? round((stablecoinValue / stablecoinPrevious - 1) * 100, 3) : null
    },
    coverage: {
      rwa_protocols: rwaProtocols.length,
      rwa_lending_protocols: rwaLending.length,
      networks: allNetworks.size,
      multichain_protocols: rwaProtocols.filter((protocol) => Array.isArray(protocol.chains) && protocol.chains.length > 1).length,
      excluded_rwa_records: excluded.length,
      excluded_stablecoin_records: stablecoinExcluded
    },
    data_quality: {
      grain: 'Un producto o protocolo por slug de DefiLlama; un registro de red por red normalizada.',
      raw_rwa_records: protocolPayload.filter((protocol) => protocol?.category === 'RWA').length,
      published_products: products.length,
      publication_rate_pct: protocolPayload.filter((protocol) => protocol?.category === 'RWA').length ? round(products.length / protocolPayload.filter((protocol) => protocol?.category === 'RWA').length * 100) : null,
      project_link_coverage_pct: products.length ? round(sourceLinksPresent / products.length * 100) : null,
      adapter_link_coverage_pct: products.length ? round(adapterLinksPresent / products.length * 100) : null,
      weekly_change_coverage_pct: products.length ? round(weeklyChangePresent / products.length * 100) : null,
      network_allocation_coverage_pct: totalRwaTvl ? round(networkAllocatedTvl / totalRwaTvl * 100) : null,
      raw_chain_breakdown_mismatch_records: rawChainBreakdownMismatchRecords,
      exclusion_reasons: exclusionReasons,
      provider_timestamp_available: false
    },
    segments,
    networks: networkRows,
    stablecoin_networks: stablecoinNetworkRows,
    leaders: products.slice(0, 10),
    products,
    movers: { minimum_tvl_usd: 10_000_000, gainers, decliners },
    analysis_engine: {
      name: 'Kaufman Grounded Analysis v1',
      mode: 'DETERMINISTIC_SOURCE_GROUNDED',
      generated_at: observedAt,
      uses_external_llm: false,
      policy: 'Solo genera conclusiones desde campos presentes en este snapshot; no completa hechos institucionales ni cifras ausentes.',
      insights
    },
    methodology: {
      title: 'Capital desplegado, no capitalización de tokens',
      summary: 'Suma TVL de protocolos clasificados por DefiLlama como RWA; excluye valores nulos, marcados como mal representados o como doble conteo. La distribución por red suma chainTvls.',
      segment_warning: 'Las etiquetas de clase de activo no son mutuamente excluyentes: no deben sumarse entre sí.',
      stablecoin_method: 'Circulación USD multiplicada por el precio observado por DefiLlama; no se presupone paridad 1:1.',
      network_method: 'Los chainTvls de cada producto se convierten en pesos y se normalizan a su TVL total antes de agregarse por red. Los productos sin desglose se excluyen solo de la distribución de red.',
      provider_caveat: 'DefiLlama actualiza TVL y stablecoin supply aproximadamente cada hora. No publica timestamp por fila en estos endpoints; Kaufman conserva la hora de recepción.',
      valuation_caveat: 'La valoración sigue los adaptadores del proveedor. Su metodología general puede usar CoinGecko u oráculos onchain; nunca se usa aquí como ticker Kaufman.'
    }
  };
}

export class TokenizationConnector {
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
    const receivedAt = new Date().toISOString();
    try {
      const [protocolResponse, stablecoinResponse] = await Promise.all([
        fetch(DEFILLAMA_PROTOCOLS_URL, { headers: { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' }, signal: AbortSignal.timeout(25_000) }),
        fetch(DEFILLAMA_STABLECOINS_URL, { headers: { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' }, signal: AbortSignal.timeout(25_000) })
      ]);
      if (!protocolResponse.ok) throw new Error(`DefiLlama protocols HTTP ${protocolResponse.status}`);
      if (!stablecoinResponse.ok) throw new Error(`DefiLlama stablecoins HTTP ${stablecoinResponse.status}`);
      const snapshot = buildTokenizationSnapshot(await protocolResponse.json(), await stablecoinResponse.json(), receivedAt);
      this.onData(snapshot);
      this.onHealth('defillama_tokenization', {
        connection_status: 'CONNECTED',
        last_message_at: receivedAt,
        records: snapshot.coverage.rwa_protocols,
        excluded: snapshot.coverage.excluded_rwa_records + snapshot.coverage.excluded_stablecoin_records
      });
    } catch (error) {
      this.onHealth('defillama_tokenization', { connection_status: 'DEGRADED', last_error: error.message });
    } finally {
      if (!this.stopped) this.timer = setTimeout(() => this.refresh(), this.config.tokenizationIntervalMs);
    }
  }
}
