import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from './config.js';
import { computeReferences } from './market-core.js';
import { createBinanceConnector, createCoinbaseConnector, createKrakenConnector, DexScreenerConnector } from './connectors.js';
import { CoinGeckoMetadataConnector } from './metadata.js';
import { AuxiliaryConnector } from './auxiliary.js';
import { TokenizationConnector } from './tokenization.js';
import { L2BeatConnector } from './l2beat.js';
import { FiscalConnector } from './fiscal.js';
import { RegulationConnector } from './regulation.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8'
};

class MarketAntenna {
  constructor(config = CONFIG) {
    this.config = config;
    this.rawQuotes = new Map();
    this.providerHealth = {};
    this.references = {};
    this.stablecoins = {};
    this.metadata = {};
    this.pools = [];
    this.auxiliary = {};
    this.tokenization = null;
    this.l2Intelligence = null;
    this.fiscalIntelligence = null;
    this.regulationIntelligence = null;
    this.history = new Map();
    this.clients = new Set();
    const callbacks = {
      onQuote: (quote) => this.upsertQuote(quote),
      onHealth: (provider, health) => this.setHealth(provider, health)
    };
    this.connectors = [
      createCoinbaseConnector(callbacks),
      createKrakenConnector(callbacks),
      createBinanceConnector(callbacks),
      new DexScreenerConnector({
        ...callbacks,
        onPools: (pools) => this.replaceDexPools(pools),
        getReferencePrice: (assetId) => this.references[assetId]?.price || null
      }),
      new CoinGeckoMetadataConnector({
        onMetadata: (metadata) => { this.metadata = metadata; },
        onHealth: callbacks.onHealth
      }),
      new AuxiliaryConnector({
        onData: (data) => { this.auxiliary = data; },
        onHealth: callbacks.onHealth
      }),
      new TokenizationConnector({
        onData: (data) => { this.tokenization = data; this.broadcast(); },
        onHealth: callbacks.onHealth
      }),
      new L2BeatConnector({
        onData: (data) => { this.l2Intelligence = data; this.broadcast(); },
        onHealth: callbacks.onHealth
      }),
      new FiscalConnector({
        onData: (data) => { this.fiscalIntelligence = data; this.broadcast(); },
        onHealth: callbacks.onHealth
      }),
      new RegulationConnector({
        onData: (data) => { this.regulationIntelligence = data; this.broadcast(); },
        onHealth: callbacks.onHealth
      })
    ];
  }

  upsertQuote(quote) {
    const key = [quote.provider, quote.venue, quote.asset_id, quote.currency, quote.onchain_identity || ''].join('|');
    this.rawQuotes.set(key, quote);
  }

  replaceDexPools(pools) {
    this.pools = pools;
    for (const [key, quote] of this.rawQuotes) {
      if (quote.provider === 'dexscreener') this.rawQuotes.delete(key);
    }
    for (const pool of pools) {
      if (!pool.price) continue;
      this.upsertQuote({
        asset_id: pool.canonical_asset_id,
        onchain_identity: pool.identity,
        chain_id: pool.chain_id,
        contract_address: pool.contract_address,
        price: pool.price,
        currency: pool.currency,
        provider: 'dexscreener',
        venue: `DEX Screener ${pool.dex}:${pool.pair_address}`,
        provider_timestamp: pool.provider_timestamp,
        received_at: pool.received_at,
        volume_24h_quote: pool.volume_24h_quote,
        verification_status: pool.verification_status
      });
    }
  }

  setHealth(provider, health) {
    this.providerHealth[provider] = { ...(this.providerHealth[provider] || {}), ...health, updated_at: new Date().toISOString() };
  }

  start() {
    for (const connector of this.connectors) connector.start();
    this.timer = setInterval(() => this.tick(), this.config.snapshotIntervalMs);
    this.monitor = setInterval(() => {
      for (const connector of this.connectors) connector.monitor?.();
    }, 1_000);
    this.tick();
  }

  stop() {
    clearInterval(this.timer);
    clearInterval(this.monitor);
    for (const connector of this.connectors) connector.stop();
  }

  tick() {
    const computed = computeReferences(this.rawQuotes.values(), this.providerHealth, Date.now(), this.config);
    this.references = computed.references;
    this.stablecoins = computed.stablecoins;
    for (const reference of Object.values(this.references)) {
      if (!reference.price) continue;
      const rows = this.history.get(reference.asset_id) || [];
      const previous = rows.at(-1);
      if (!previous || previous.price !== reference.price || previous.venues.join('|') !== reference.venues.join('|')) {
        rows.push(reference);
        if (rows.length > this.config.historyLimit) rows.splice(0, rows.length - this.config.historyLimit);
        this.history.set(reference.asset_id, rows);
      }
    }
    this.broadcast();
  }

  snapshot() {
    const computed = computeReferences(this.rawQuotes.values(), this.providerHealth, Date.now(), this.config);
    this.references = computed.references;
    this.stablecoins = computed.stablecoins;
    return {
      schema_version: 'kaufman-market-antenna-v1',
      generated_at: new Date().toISOString(),
      reference_prices: this.references,
      stablecoin_fx: this.stablecoins,
      providers: this.providerHealth,
      onchain_pools: this.pools,
      metadata: this.metadata,
      auxiliary: this.auxiliary,
      tokenization_markets: this.tokenization,
      l2_intelligence: this.l2Intelligence,
      fiscal_intelligence: this.fiscalIntelligence,
      regulation_intelligence: this.regulationIntelligence,
      thresholds: {
        fresh_ms: this.config.freshMs,
        stale_after_ms: this.config.freshMs,
        degraded_after_ms: this.config.degradedMs,
        unavailable_after_ms: this.config.unavailableMs,
        divergence_pct: this.config.divergenceThresholdPct,
        minimum_volume_usd_24h: this.config.minimumVolumeUsd24h,
        tokenization_max_age_ms: this.config.tokenizationMaxAgeMs,
        l2beat_max_age_ms: this.config.l2beatMaxAgeMs,
        fiscal_max_age_ms: this.config.fiscalMaxAgeMs,
        regulation_max_age_ms: this.config.regulationMaxAgeMs
      }
    };
  }

  broadcast() {
    if (!this.clients.size) return;
    const payload = `event: snapshot\ndata: ${JSON.stringify(this.snapshot())}\n\n`;
    for (const client of this.clients) {
      try { client.write(payload); } catch { this.clients.delete(client); }
    }
  }

  addClient(response) {
    this.clients.add(response);
    response.write(`event: snapshot\ndata: ${JSON.stringify(this.snapshot())}\n\n`);
    const heartbeat = setInterval(() => response.write(`: heartbeat ${Date.now()}\n\n`), 15_000);
    response.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(response);
    });
  }
}

const antenna = new MarketAntenna();

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function serveStatic(request, response, url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { response.writeHead(400).end('Bad request'); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let candidate = path.resolve(ROOT, relative);
  if (!candidate.startsWith(`${ROOT}${path.sep}`) && candidate !== ROOT) { response.writeHead(403).end('Forbidden'); return; }
  try {
    const stat = await fs.stat(candidate);
    if (stat.isDirectory()) candidate = path.join(candidate, 'index.html');
    const body = await fs.readFile(candidate);
    response.writeHead(200, {
      'content-type': MIME[path.extname(candidate).toLowerCase()] || 'application/octet-stream',
      'cache-control': ['.html', '.js', '.css'].includes(path.extname(candidate).toLowerCase()) ? 'no-cache' : 'public, max-age=300'
    });
    response.end(body);
  } catch {
    try {
      const body = await fs.readFile(path.join(ROOT, '404.html'));
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      response.end(body);
    } catch { response.writeHead(404).end('Not found'); }
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/api/market/stream') {
    response.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive', 'x-accel-buffering': 'no'
    });
    antenna.addClient(response);
    return;
  }
  if (url.pathname === '/api/market/snapshot') { sendJson(response, 200, antenna.snapshot()); return; }
  if (url.pathname === '/api/market/health') {
    const connected = Object.values(antenna.providerHealth).filter((provider) => provider.connection_status === 'CONNECTED').length;
    sendJson(response, connected ? 200 : 503, { status: connected ? 'UP' : 'STARTING', providers: antenna.providerHealth });
    return;
  }
  if (url.pathname === '/api/market/history') {
    const asset = url.searchParams.get('asset') || 'bitcoin';
    const requested = Math.max(1, Math.min(600, Number(url.searchParams.get('limit')) || 100));
    sendJson(response, 200, { asset_id: asset, prices: (antenna.history.get(asset) || []).slice(-requested) });
    return;
  }
  await serveStatic(request, response, url);
});

server.listen(CONFIG.port, '127.0.0.1', () => {
  antenna.start();
  console.log(`Kaufman Market Antenna v1 listening on http://127.0.0.1:${CONFIG.port}`);
});

function shutdown() {
  antenna.stop();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
