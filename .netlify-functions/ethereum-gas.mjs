import { buildEthereumFeeSnapshot } from '../server/auxiliary.js';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept',
  'Cache-Control': 'public, max-age=15, stale-while-revalidate=45',
  'Netlify-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
  'X-Content-Type-Options': 'nosniff'
};

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers });
  try {
    const receivedAt = new Date().toISOString();
    const response = await fetch('https://ethereum-rpc.publicnode.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Kaufman-Market-Antenna/1.0 contact@kaufmanadvisory.io' },
      body: JSON.stringify([
        { jsonrpc: '2.0', method: 'eth_feeHistory', params: ['0x14', 'latest', [10, 50, 90]], id: 1 },
        { jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', false], id: 2 }
      ]),
      signal: AbortSignal.timeout(9_000)
    });
    if (!response.ok) throw new Error(`Ethereum RPC HTTP ${response.status}`);
    const payload = await response.json();
    const fees = buildEthereumFeeSnapshot(payload.find((row) => row.id === 1)?.result, payload.find((row) => row.id === 2)?.result, receivedAt);
    return new Response(JSON.stringify({ schema_version: 'kaufman-ethereum-gas-v1', delivery_mode: 'LIVE_EDGE_GAS', generated_at: receivedAt, refresh_interval_ms: 60_000, ethereum_fees: fees }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ schema_version: 'kaufman-ethereum-gas-v1', status: 'UNAVAILABLE', error: error?.message || 'Ethereum RPC no disponible' }), { status: 503, headers });
  }
};

export const config = { path: '/api/market/gas' };
