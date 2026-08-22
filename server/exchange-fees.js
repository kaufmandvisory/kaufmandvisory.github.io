const SOURCE = Object.freeze({
  kraken: 'https://docs.kraken.com/api/docs/rest-api/get-tradable-asset-pairs',
  coinbase: 'https://help.coinbase.com/es-es/coinbase/trading-and-funding/advanced-trade/advanced-trade-fees',
  binance: 'https://www.binance.com/es/fee/trading',
  bit2me: 'https://support.bit2me.com/es/support/solutions/articles/35000172197',
  bitstamp: 'https://www.bitstamp.net/fee-schedule/'
});

async function krakenTiers(fetchImpl) {
  const response = await fetchImpl('https://api.kraken.com/0/public/AssetPairs?pair=XBTUSD&info=fees', {
    headers: { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' },
    signal: AbortSignal.timeout(9_000)
  });
  if (!response.ok) throw new Error(`Kraken REST HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error?.length) throw new Error(payload.error.join(', '));
  const pair = Object.values(payload.result || {})[0];
  const maker = (pair?.fees_maker || []).map(([volume, fee]) => ({ volume_30d_usd_from: Number(volume), maker_pct: Number(fee) }));
  const taker = (pair?.fees || []).map(([volume, fee]) => ({ volume_30d_usd_from: Number(volume), taker_pct: Number(fee) }));
  if (!maker.length || !taker.length || [...maker, ...taker].some((row) => Object.values(row).some((value) => !Number.isFinite(value)))) throw new Error('Incomplete Kraken fee response');
  return maker.map((row, index) => ({ ...row, taker_pct: taker[index]?.taker_pct ?? null }));
}

const BIT2ME_TIERS = Object.freeze([
  [0, 0.5, 0.6], [2_001, 0.2, 0.3], [50_001, 0.16, 0.26], [250_001, 0.08, 0.16],
  [500_001, 0.06, 0.15], [1_000_001, 0.04, 0.14], [5_000_001, 0.03, 0.13],
  [25_000_001, 0.02, 0.12], [75_000_001, 0.01, 0.11], [250_000_001, 0, 0.1]
].map(([volume_30d_eur_from, maker_pct, taker_pct]) => ({ volume_30d_eur_from, maker_pct, taker_pct })));

export async function buildExchangeFeeRegistry(fetchImpl = fetch, receivedAt = new Date().toISOString()) {
  const kraken = await krakenTiers(fetchImpl);
  return {
    schema_version: 'kaufman-exchange-fees-v2',
    received_at: receivedAt,
    refresh_interval_ms: 24 * 60 * 60_000,
    exchange: 'Kraken',
    pair: 'BTC/USD',
    maker: kraken[0].maker_pct,
    taker: kraken[0].taker_pct,
    verification_status: 'SOURCE_OBSERVED',
    methodology: 'Se publican cifras únicamente cuando la fuente oficial expone el tramo; cuando dependen de la cuenta se bloquea la cifra exacta.',
    entries: [
      {
        exchange: 'Kraken', market: 'Spot · BTC/USD', availability: 'PUBLIC_EXACT', exactness: 'EXACT_PUBLIC_API',
        maker_pct: kraken[0].maker_pct, taker_pct: kraken[0].taker_pct, tiers: kraken,
        conditions: 'Tramo inicial por volumen de 30 días; consultar niveles superiores en la tabla.', source_url: SOURCE.kraken,
        source_type: 'OFFICIAL_PUBLIC_API', observed_at: receivedAt
      },
      {
        exchange: 'Bit2Me Pro', market: 'Cripto/EUR y cripto/stablecoin', availability: 'PUBLIC_EXACT', exactness: 'EXACT_PUBLIC_TABLE',
        maker_pct: BIT2ME_TIERS[0].maker_pct, taker_pct: BIT2ME_TIERS[0].taker_pct, tiers: BIT2ME_TIERS,
        conditions: 'Sin descuento Space Center; volumen de 30 días. Pares con stablecoin base siguen otra tabla.', source_url: SOURCE.bit2me,
        source_type: 'OFFICIAL_PUBLIC_TABLE', source_modified_at: '2025-09-23T13:16:00Z', observed_at: receivedAt
      },
      {
        exchange: 'Coinbase Advanced', market: 'Spot · según cuenta', availability: 'ACCOUNT_REQUIRED', exactness: 'ACCOUNT_TIER_REQUIRED',
        maker_pct: null, taker_pct: null, tiers: [],
        conditions: 'El nivel se actualiza cada hora por volumen USD de 30 días; Coinbase exige iniciar sesión para mostrar la estructura completa.', source_url: SOURCE.coinbase,
        source_type: 'OFFICIAL_GUIDANCE', observed_at: receivedAt
      },
      {
        exchange: 'Binance', market: 'Spot · según región/cuenta', availability: 'ACCOUNT_REQUIRED', exactness: 'ACCOUNT_TIER_REQUIRED',
        maker_pct: null, taker_pct: null, tiers: [],
        conditions: 'VIP, región, producto y posible descuento BNB modifican la tarifa; se exige cotización oficial de la cuenta.', source_url: SOURCE.binance,
        source_type: 'OFFICIAL_FEE_PAGE', observed_at: receivedAt
      },
      {
        exchange: 'Bitstamp', market: 'Spot · según cuenta', availability: 'ACCOUNT_REQUIRED', exactness: 'ACCOUNT_TIER_REQUIRED',
        maker_pct: null, taker_pct: null, tiers: [],
        conditions: 'La fuente pública remite a su calendario vigente; no se congela una cifra sin nivel y mercado confirmados.', source_url: SOURCE.bitstamp,
        source_type: 'OFFICIAL_FEE_PAGE', observed_at: receivedAt
      }
    ]
  };
}
