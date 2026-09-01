import { mkdir, writeFile } from 'node:fs/promises';
import marketContext from '../.netlify-functions/market-context.mjs';

const target = new URL('../api/market/', import.meta.url);
await mkdir(target, { recursive: true });

const endpoints = [
  ['context', marketContext, 'https://kaufmanadvisory.io/api/market/context']
];

const liveEndpoints = {
  context: '/api/market/context'
};

for (const [name, handler, url] of endpoints) {
  try {
    const response = await handler(new Request(url, { method: 'GET', headers: { Accept: 'application/json' } }));
    const body = await response.text();
    const payload = JSON.parse(body);
    payload.source_delivery_mode = payload.delivery_mode;
    payload.delivery_mode = 'STATIC_DAILY_FALLBACK';
    payload.status = 'SNAPSHOT_ONLY';
    payload.refresh_interval_ms = 24 * 60 * 60_000;
    payload.live_endpoint = liveEndpoints[name];
    payload.snapshot_warning = 'Copia diaria para continuidad y diagnóstico; no utilizar como ticker en vivo.';
    await writeFile(new URL(name, target), `${JSON.stringify(payload)}\n`, 'utf8');
    console.log(`${name}: HTTP ${response.status}`);
  } catch (error) {
    const body = {
      schema_version: `kaufman-${name}-static-v1`,
      delivery_mode: 'STATIC_POLLING',
      generated_at: new Date().toISOString(),
      status: 'UNAVAILABLE',
      error: error?.message || 'No se pudo generar el snapshot público'
    };
    await writeFile(new URL(name, target), `${JSON.stringify(body)}\n`, 'utf8');
    console.error(`${name}: ${body.error}`);
  }
}

const streamContract = {
  schema_version: 'kaufman-market-transport-v1',
  delivery_mode: 'STATIC_POLLING',
  generated_at: new Date().toISOString(),
  status: 'AVAILABLE',
  transport: 'polling',
  live_price_endpoint: '/api/market/snapshot',
  live_context_endpoint: '/api/market/context',
  live_gas_endpoint: '/api/market/gas',
  same_origin_fallbacks: ['/api/market/snapshot', '/api/market/context', '/api/market/gas'],
  note: 'El dominio principal publica precios y gas server-side cada cinco minutos y contexto de mercado diario. El frontend consulta únicamente rutas same-origin.'
};
await writeFile(new URL('stream', target), `${JSON.stringify(streamContract)}\n`, 'utf8');
