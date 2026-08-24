import {
  BINANCE_MARKETS,
  COINBASE_MARKETS,
  CONFIG,
  KRAKEN_MARKETS,
  ONCHAIN_ASSETS
} from './config.js';
import { fetchDexPairForAsset, fetchOnchainSwapEvidence, verifyDexPair } from './dexscreener.js';

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

class ResilientWebSocketConnector {
  constructor({ name, url, subscribe, parse, onQuote, onHealth, config = CONFIG }) {
    this.name = name;
    this.url = url;
    this.subscribe = subscribe;
    this.parse = parse;
    this.onQuote = onQuote;
    this.onHealth = onHealth;
    this.config = config;
    this.socket = null;
    this.stopped = false;
    this.attempt = 0;
    this.reconnectTimer = null;
    this.lastMessageAt = null;
    this.lastGapMarkedAt = null;
    this.sequenceByChannel = new Map();
    this.metrics = { messages: 0, quotes: 0, reconnects: 0, gaps: 0, parse_errors: 0 };
  }

  start() {
    this.stopped = false;
    this.connect();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.reconnectTimer);
    try { this.socket?.close(); } catch {}
  }

  health(connectionStatus, extra = {}) {
    this.onHealth(this.name, {
      connection_status: connectionStatus,
      last_message_at: this.lastMessageAt ? new Date(this.lastMessageAt).toISOString() : null,
      ...this.metrics,
      ...extra
    });
  }

  connect() {
    if (this.stopped) return;
    this.health('CONNECTING');
    let socket;
    try {
      socket = new WebSocket(this.url);
    } catch (error) {
      this.scheduleReconnect(error);
      return;
    }
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.attempt = 0;
      this.lastMessageAt = Date.now();
      this.lastGapMarkedAt = null;
      this.health('CONNECTED');
      for (const message of this.subscribe()) socket.send(JSON.stringify(message));
    });

    socket.addEventListener('message', (event) => {
      const receivedAt = new Date();
      this.lastMessageAt = receivedAt.getTime();
      this.metrics.messages += 1;
      try {
        const payload = JSON.parse(String(event.data));
        const heartbeatCounter = payload.channel === 'heartbeats' ? Number(payload.events?.[0]?.heartbeat_counter) : null;
        const sequence = Number.isFinite(heartbeatCounter) ? heartbeatCounter : null;
        const channel = payload.channel || payload.stream || payload.e || 'default';
        if (Number.isFinite(sequence)) {
          const previous = this.sequenceByChannel.get(channel);
          if (Number.isFinite(previous) && sequence > previous + 1) this.metrics.gaps += sequence - previous - 1;
          this.sequenceByChannel.set(channel, sequence);
        }
        const quotes = this.parse(payload, receivedAt);
        for (const quote of quotes) {
          this.metrics.quotes += 1;
          this.onQuote(quote);
        }
        this.health('CONNECTED', { latency_ms: quotes.length ? Math.max(0, ...quotes.map((quote) => quote.provider_timestamp ? receivedAt - new Date(quote.provider_timestamp) : 0)) : null });
      } catch (error) {
        this.metrics.parse_errors += 1;
        this.health('CONNECTED', { last_error: error.message });
      }
    });

    socket.addEventListener('error', () => this.health('DEGRADED', { last_error: 'WebSocket error' }));
    socket.addEventListener('close', (event) => {
      if (socket !== this.socket || this.stopped) return;
      this.health('DISCONNECTED', { close_code: event.code, close_reason: event.reason || null });
      this.scheduleReconnect(new Error(`Socket closed (${event.code})`));
    });
  }

  monitor(now = Date.now()) {
    if (!this.lastMessageAt || !this.socket) return;
    const silenceMs = now - this.lastMessageAt;
    if (silenceMs > this.config.gapWarningMs) {
      if (!this.lastGapMarkedAt || now - this.lastGapMarkedAt > this.config.gapWarningMs) {
        this.metrics.gaps += 1;
        this.lastGapMarkedAt = now;
      }
      this.health('DEGRADED', { silence_ms: silenceMs });
    }
    if (silenceMs > this.config.reconnectAfterMs) {
      try { this.socket.close(4000, 'heartbeat timeout'); } catch {}
    }
  }

  scheduleReconnect(error) {
    if (this.stopped) return;
    this.attempt += 1;
    this.metrics.reconnects += 1;
    const base = Math.min(this.config.reconnectMaxMs, this.config.reconnectBaseMs * (2 ** Math.min(this.attempt, 5)));
    const delay = Math.round(base * (0.75 + Math.random() * 0.5));
    this.health('RECONNECTING', { retry_in_ms: delay, last_error: error.message });
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }
}

export function createCoinbaseConnector(callbacks) {
  return new ResilientWebSocketConnector({
    name: 'coinbase',
    url: 'wss://advanced-trade-ws.coinbase.com',
    ...callbacks,
    subscribe: () => [
      { type: 'subscribe', product_ids: Object.keys(COINBASE_MARKETS), channel: 'ticker' },
      { type: 'subscribe', product_ids: Object.keys(COINBASE_MARKETS), channel: 'heartbeats' }
    ],
    parse: (payload, receivedAt) => {
      if (payload.channel !== 'ticker') return [];
      const timestamp = payload.timestamp ? new Date(payload.timestamp).toISOString() : null;
      return (payload.events || []).flatMap((event) => (event.tickers || []).map((ticker) => {
        const market = COINBASE_MARKETS[ticker.product_id];
        const price = numberOrNull(ticker.price);
        const volumeBase = numberOrNull(ticker.volume_24_h);
        if (!market || !price) return null;
        return {
          asset_id: market.assetId,
          price,
          currency: market.currency,
          provider: 'coinbase',
          venue: `Coinbase ${ticker.product_id}`,
          provider_timestamp: timestamp,
          received_at: receivedAt.toISOString(),
          volume_24h_quote: volumeBase ? volumeBase * price : null,
          verification_status: 'OBSERVED'
        };
      }).filter(Boolean));
    }
  });
}

export function createKrakenConnector(callbacks) {
  return new ResilientWebSocketConnector({
    name: 'kraken',
    url: 'wss://ws.kraken.com/v2',
    ...callbacks,
    subscribe: () => [{
      method: 'subscribe',
      params: { channel: 'ticker', symbol: Object.keys(KRAKEN_MARKETS), event_trigger: 'trades', snapshot: true },
      req_id: 1
    }],
    parse: (payload, receivedAt) => {
      if (payload.channel !== 'ticker' || !Array.isArray(payload.data)) return [];
      return payload.data.map((ticker) => {
        const market = KRAKEN_MARKETS[ticker.symbol];
        const price = numberOrNull(ticker.last);
        const volumeBase = numberOrNull(ticker.volume);
        if (!market || !price) return null;
        return {
          asset_id: market.assetId,
          price,
          currency: market.currency,
          provider: 'kraken',
          venue: `Kraken ${ticker.symbol}`,
          provider_timestamp: ticker.timestamp ? new Date(ticker.timestamp).toISOString() : null,
          received_at: receivedAt.toISOString(),
          volume_24h_quote: volumeBase ? volumeBase * price : null,
          verification_status: 'OBSERVED'
        };
      }).filter(Boolean);
    }
  });
}

export function createBinanceConnector(callbacks) {
  const streams = Object.keys(BINANCE_MARKETS).map((symbol) => `${symbol.toLowerCase()}@ticker`).join('/');
  return new ResilientWebSocketConnector({
    name: 'binance',
    // Host público de market-data sin API key; evita el endpoint de trading
    // regionalmente restringido y no expone ninguna conexión al navegador.
    url: `wss://data-stream.binance.vision/stream?streams=${streams}`,
    ...callbacks,
    subscribe: () => [],
    parse: (payload, receivedAt) => {
      const ticker = payload.data || payload;
      const market = BINANCE_MARKETS[ticker.s];
      const price = numberOrNull(ticker.c);
      if (!market || !price) return [];
      return [{
        asset_id: market.assetId,
        price,
        currency: market.currency,
        provider: 'binance',
        venue: `Binance ${ticker.s}`,
        provider_timestamp: Number.isFinite(ticker.E) ? new Date(ticker.E).toISOString() : null,
        received_at: receivedAt.toISOString(),
        volume_24h_quote: numberOrNull(ticker.q),
        verification_status: 'OBSERVED'
      }];
    }
  });
}

export class DexScreenerConnector {
  constructor({ onQuote, onPools, onHealth, getReferencePrice = () => null, config = CONFIG }) {
    this.onQuote = onQuote;
    this.onPools = onPools;
    this.onHealth = onHealth;
    this.getReferencePrice = getReferencePrice;
    this.config = config;
    this.timer = null;
    this.stopped = false;
    this.metrics = { messages: 0, quotes: 0, reconnects: 0, gaps: 0, parse_errors: 0 };
  }

  start() {
    this.stopped = false;
    this.poll();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.timer);
  }

  async poll() {
    const receivedAt = new Date();
    this.onHealth('dexscreener', { connection_status: 'CONNECTING', ...this.metrics });
    try {
      const selectedPairs = [];
      for (const asset of ONCHAIN_ASSETS) {
        const selected = await fetchDexPairForAsset(asset);
        this.metrics.messages += 1;
        selectedPairs.push({ asset, pair: selected.pair, sourceResponseAt: selected.source_response_at });
      }
      const selectedPools = (await Promise.all(selectedPairs.map(async ({ asset, pair, sourceResponseAt }) => {
        const url = `https://api.dexscreener.com/latest/dex/pairs/${encodeURIComponent(asset.chainId)}/${encodeURIComponent(pair.pairAddress)}`;
        const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' }, signal: AbortSignal.timeout(9_000) });
        if (!response.ok) throw new Error(`DEX Screener confirmation HTTP ${response.status}`);
        const payload = await response.json();
        this.metrics.messages += 1;
        const confirmation = payload.pair || payload.pairs?.[0];
        const onchainEvidence = await fetchOnchainSwapEvidence({ chainId: asset.chainId, pairAddress: pair.pairAddress });
        return verifyDexPair({
          asset,
          pair,
          confirmation,
          receivedAt: receivedAt.toISOString(),
          sourceResponseAt,
          confirmationResponseAt: response.headers.get('date') || receivedAt.toUTCString(),
          referencePriceUsd: this.getReferencePrice(asset.canonicalAssetId),
          onchainEvidence
        });
      }))).filter(Boolean);
      this.metrics.quotes += selectedPools.filter((pool) => pool.price).length;
      this.onPools(selectedPools);
      this.onHealth('dexscreener', { connection_status: 'CONNECTED', last_message_at: receivedAt.toISOString(), ...this.metrics });
    } catch (error) {
      this.metrics.parse_errors += 1;
      this.onHealth('dexscreener', { connection_status: 'DEGRADED', last_message_at: null, last_error: error.message, ...this.metrics });
    } finally {
      if (!this.stopped) this.timer = setTimeout(() => this.poll(), this.config.dexPollMs);
    }
  }

  monitor() {}
}
