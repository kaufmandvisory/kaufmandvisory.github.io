export const CONFIG = Object.freeze({
  port: Number(process.env.PORT || 4173),
  freshMs: 5_000,
  degradedMs: 15_000,
  unavailableMs: 60_000,
  divergenceThresholdPct: Number(process.env.KAUFMAN_DIVERGENCE_PCT || 2.5),
  minimumVolumeUsd24h: Number(process.env.KAUFMAN_MIN_VOLUME_USD || 100_000),
  minimumDexVolumeUsd24h: Number(process.env.KAUFMAN_MIN_DEX_VOLUME_USD || 250_000),
  gapWarningMs: 15_000,
  reconnectAfterMs: 60_000,
  reconnectBaseMs: 1_000,
  reconnectMaxMs: 30_000,
  snapshotIntervalMs: 1_000,
  historyLimit: 600,
  dexPollMs: 15_000,
  metadataMarketIntervalMs: 10 * 60_000,
  metadataDetailsIntervalMs: 6 * 60 * 60_000,
  metadataMaxAgeMs: 15 * 60_000,
  gasIntervalMs: 15 * 60_000,
  feesIntervalMs: 24 * 60 * 60_000,
  tokenizationIntervalMs: 60 * 60_000,
  tokenizationMaxAgeMs: 24 * 60 * 60_000,
  l2beatIntervalMs: 60 * 60_000,
  l2beatMaxAgeMs: 24 * 60 * 60_000,
  fiscalIntervalMs: 24 * 60 * 60_000,
  fiscalMaxAgeMs: 48 * 60 * 60_000,
  regulationIntervalMs: 24 * 60 * 60_000,
  regulationMaxAgeMs: 48 * 60 * 60_000
});

export const ASSETS = Object.freeze({
  bitcoin: { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin' },
  ethereum: { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
  solana: { id: 'solana', symbol: 'SOL', name: 'Solana', coingeckoId: 'solana' },
  usdt: { id: 'usdt', symbol: 'USDT', name: 'Tether', coingeckoId: 'tether', stablecoin: true },
  usdc: { id: 'usdc', symbol: 'USDC', name: 'USD Coin', coingeckoId: 'usd-coin', stablecoin: true }
});

export const COINBASE_MARKETS = Object.freeze({
  'BTC-USD': { assetId: 'bitcoin', currency: 'USD' },
  'ETH-USD': { assetId: 'ethereum', currency: 'USD' },
  'SOL-USD': { assetId: 'solana', currency: 'USD' },
  'USDT-USD': { assetId: 'usdt', currency: 'USD' },
  'USDC-USD': { assetId: 'usdc', currency: 'USD' }
});

export const KRAKEN_MARKETS = Object.freeze({
  'BTC/USD': { assetId: 'bitcoin', currency: 'USD' },
  'ETH/USD': { assetId: 'ethereum', currency: 'USD' },
  'SOL/USD': { assetId: 'solana', currency: 'USD' },
  'USDT/USD': { assetId: 'usdt', currency: 'USD' },
  'USDC/USD': { assetId: 'usdc', currency: 'USD' }
});

export const BINANCE_MARKETS = Object.freeze({
  BTCUSDT: { assetId: 'bitcoin', currency: 'USDT' },
  ETHUSDT: { assetId: 'ethereum', currency: 'USDT' },
  SOLUSDT: { assetId: 'solana', currency: 'USDT' },
  USDCUSDT: { assetId: 'usdc', currency: 'USDT' }
});

export const ONCHAIN_ASSETS = Object.freeze([
  {
    chainId: 'ethereum',
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    canonicalAssetId: 'ethereum',
    name: 'Wrapped Ether'
  },
  {
    chainId: 'ethereum',
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    canonicalAssetId: 'bitcoin',
    name: 'Wrapped Bitcoin'
  },
  {
    chainId: 'solana',
    contractAddress: 'So11111111111111111111111111111111111111112',
    canonicalAssetId: 'solana',
    name: 'Wrapped SOL'
  }
]);

export const ONCHAIN_QUOTES = Object.freeze({
  ethereum: Object.freeze({
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT'
  }),
  solana: Object.freeze({
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC'
  })
});

export function onchainKey(chainId, contractAddress) {
  return `${String(chainId).toLowerCase()}:${String(contractAddress).toLowerCase()}`;
}
