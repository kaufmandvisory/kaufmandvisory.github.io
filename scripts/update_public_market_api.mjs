import { mkdir, writeFile } from 'node:fs/promises';
import marketSnapshot from '../.netlify-functions/market-snapshot.mjs';
import marketContext from '../.netlify-functions/market-context.mjs';
import ethereumGas from '../.netlify-functions/ethereum-gas.mjs';

const target = new URL('../api/market/', import.meta.url);
await mkdir(target, { recursive: true });

const endpoints = [
  ['snapshot', marketSnapshot, 'https://kaufmanadvisory.io/api/market/snapshot'],
  ['context', marketContext, 'https://kaufmanadvisory.io/api/market/context'],
  ['gas', ethereumGas, 'https://kaufmanadvisory.io/api/market/gas']
];

const liveEndpoints = {
  snapshot: 'https://leafy-pudding-3f3427.netlify.app/api/market/snapshot',
  context: 'https://leafy-pudding-3f3427.netlify.app/api/market/context',
  gas: 'https://leafy-pudding-3f3427.netlify.app/api/market/gas'
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
  live_price_endpoint: 'https://leafy-pudding-3f3427.netlify.app/api/market/snapshot',
  live_context_endpoint: 'https://leafy-pudding-3f3427.netlify.app/api/market/context',
  live_gas_endpoint: 'https://leafy-pudding-3f3427.netlify.app/api/market/gas',
  same_origin_fallbacks: ['/api/market/snapshot', '/api/market/context', '/api/market/gas'],
  note: 'El dominio principal es estático y no anuncia SSE. El frontend consulta el edge server-side; las rutas same-origin son copias diarias y nunca un ticker vivo.'
};
await writeFile(new URL('stream', target), `${JSON.stringify(streamContract)}\n`, 'utf8');
