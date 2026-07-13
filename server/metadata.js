import { ASSETS, CONFIG } from './config.js';

const PUBLIC_API = 'https://api.coingecko.com/api/v3';

function validateTimestamp(value, maxAgeMs = CONFIG.metadataMaxAgeMs) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return { valid: false, age_ms: null, reason: 'LAST_UPDATED_MISSING' };
  const ageMs = Math.max(0, Date.now() - timestamp);
  return { valid: ageMs <= maxAgeMs, age_ms: ageMs, reason: ageMs <= maxAgeMs ? null : 'LAST_UPDATED_STALE' };
}

async function getJson(url) {
  const headers = { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' };
  if (process.env.COINGECKO_DEMO_API_KEY) headers['x-cg-demo-api-key'] = process.env.COINGECKO_DEMO_API_KEY;
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(9_000)
  });
  if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);
  return response.json();
}

export class CoinGeckoMetadataConnector {
  constructor({ onMetadata, onHealth, config = CONFIG }) {
    this.onMetadata = onMetadata;
    this.onHealth = onHealth;
    this.config = config;
    this.marketTimer = null;
    this.detailsTimer = null;
    this.records = {};
    this.stopped = false;
  }

  start() {
    this.stopped = false;
    this.refreshMarkets();
    setTimeout(() => this.refreshDetails(), 60_000);
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.marketTimer);
    clearTimeout(this.detailsTimer);
  }

  publish() {
    this.onMetadata(this.records);
  }

  async refreshMarkets() {
    try {
      const ids = Object.values(ASSETS).map((asset) => asset.coingeckoId).join(',');
      const rows = await getJson(`${PUBLIC_API}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&sparkline=false`);
      for (const row of rows) {
        const validation = validateTimestamp(row.last_updated);
        this.records[row.id] = {
          ...(this.records[row.id] || {}),
          id: row.id,
          symbol: row.symbol,
          name: row.name,
          image: row.image,
          market_cap_usd: row.market_cap,
          circulating_supply: row.circulating_supply,
          last_updated_at: row.last_updated,
          age_ms: validation.age_ms,
          verification_status: validation.valid ? 'VERIFIED' : 'UNAVAILABLE',
          exclusion_reason: validation.reason,
          usage: 'METADATA_ONLY'
        };
      }
      this.onHealth('coingecko_metadata', { connection_status: 'CONNECTED', last_message_at: new Date().toISOString() });
      this.publish();
    } catch (error) {
      this.onHealth('coingecko_metadata', { connection_status: 'DEGRADED', last_error: error.message });
    } finally {
      if (!this.stopped) this.marketTimer = setTimeout(() => this.refreshMarkets(), this.config.metadataMarketIntervalMs);
    }
  }

  async refreshDetails() {
    try {
      for (const asset of Object.values(ASSETS)) {
        const row = await getJson(`${PUBLIC_API}/coins/${encodeURIComponent(asset.coingeckoId)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`);
        const validation = validateTimestamp(row.last_updated);
        this.records[row.id] = {
          ...(this.records[row.id] || {}),
          id: row.id,
          symbol: row.symbol,
          name: row.name,
          image: row.image?.large || row.image?.small || this.records[row.id]?.image || null,
          categories: Array.isArray(row.categories) ? row.categories : [],
          last_updated_at: row.last_updated,
          age_ms: validation.age_ms,
          verification_status: validation.valid ? 'VERIFIED' : 'UNAVAILABLE',
          exclusion_reason: validation.reason,
          usage: 'METADATA_ONLY'
        };
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
      this.publish();
    } catch (error) {
      this.onHealth('coingecko_metadata', { connection_status: 'DEGRADED', last_error: error.message });
    } finally {
      if (!this.stopped) this.detailsTimer = setTimeout(() => this.refreshDetails(), this.config.metadataDetailsIntervalMs);
    }
  }
}
