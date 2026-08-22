import { CONFIG } from './config.js';
import { computeReferences } from './market-core.js';
import { createBinanceConnector, createCoinbaseConnector, createKrakenConnector } from './connectors.js';

export class MarketStreamSession {
  constructor({ onSnapshot = () => {}, config = CONFIG } = {}) {
    this.onSnapshot = onSnapshot;
    this.config = config;
    this.rawQuotes = new Map();
    this.providerHealth = {};
    this.startedAt = Date.now();
    this.connectors = [
      createCoinbaseConnector(this.callbacks()),
      createKrakenConnector(this.callbacks()),
      createBinanceConnector(this.callbacks())
    ];
  }

  callbacks() {
    return {
      onQuote: (quote) => {
        const key = [quote.provider, quote.venue, quote.asset_id, quote.currency].join('|');
        this.rawQuotes.set(key, quote);
      },
      onHealth: (provider, health) => {
        this.providerHealth[provider] = {
          ...(this.providerHealth[provider] || {}),
          ...health,
          updated_at: new Date().toISOString()
        };
      }
    };
  }

  start() {
    for (const connector of this.connectors) connector.start();
    this.tickTimer = setInterval(() => this.tick(), this.config.snapshotIntervalMs);
    this.monitorTimer = setInterval(() => {
      for (const connector of this.connectors) connector.monitor?.();
    }, 1_000);
    this.tick();
  }

  stop() {
    clearInterval(this.tickTimer);
    clearInterval(this.monitorTimer);
    for (const connector of this.connectors) connector.stop();
  }

  snapshot() {
    const generatedAt = new Date().toISOString();
    const computed = computeReferences(this.rawQuotes.values(), this.providerHealth, Date.now(), this.config);
    return {
      schema_version: 'kaufman-market-stream-v1',
      delivery_mode: 'LIVE_SSE_WEBSOCKET',
      generated_at: generatedAt,
      session_started_at: new Date(this.startedAt).toISOString(),
      reference_prices: computed.references,
      stablecoin_fx: computed.stablecoins,
      providers: this.providerHealth,
      thresholds: {
        fresh_ms: this.config.freshMs,
        stale_after_ms: this.config.freshMs,
        degraded_after_ms: this.config.degradedMs,
        unavailable_after_ms: this.config.unavailableMs,
        divergence_pct: this.config.divergenceThresholdPct,
        minimum_volume_usd_24h: this.config.minimumVolumeUsd24h
      }
    };
  }

  tick() {
    this.onSnapshot(this.snapshot());
  }
}
