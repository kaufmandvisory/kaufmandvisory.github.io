import { buildDominanceSnapshot, buildOpenInterestSnapshot, buildDvolSnapshot, buildEtfFlowSnapshot } from '../server/market-context.js';
import { buildIsharesIssuerObservation, reconcileEtfFlows } from '../server/etf-flows.js';

const TIMEOUT_MS = 9_000;
const USER_AGENT = 'Kaufman-Market-Antenna/1.0 contact@kaufmanadvisory.io';

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, ...(options.headers || {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
  return response.json();
};

const fetchText = async (url) => {
  const response = await fetch(url, { headers: { Accept: 'text/html', 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${new URL(url).hostname} HTTP ${response.status}`);
  return response.text();
};

const fetchDvol = async (receivedAt) => {
  const end = Date.now();
  const start = end - 6 * 60 * 60_000;
  const endpoint = (asset) => `https://www.deribit.com/api/v2/public/get_volatility_index_data?currency=${asset}&start_timestamp=${start}&end_timestamp=${end}&resolution=60`;
  const [BTC, ETH] = await Promise.all([fetchJson(endpoint('BTC')), fetchJson(endpoint('ETH'))]);
  return buildDvolSnapshot({ BTC, ETH }, receivedAt);
};

const fetchEtfFlows = async (receivedAt) => {
  const sources = [
    { asset: 'bitcoin', ticker: 'IBIT', url: 'https://www.ishares.com/us/products/333011/ishares-bitcoin-trust-etf' },
    { asset: 'ethereum', ticker: 'ETHA', url: 'https://www.ishares.com/us/products/337614/isharesethereum-trust-etf' }
  ];
  const [aggregateHtml, ...issuerHtml] = await Promise.all([
    fetchText('https://coinflows.org/'),
    ...sources.map((source) => fetchText(source.url))
  ]);
  const aggregate = buildEtfFlowSnapshot(aggregateHtml, receivedAt);
  const observations = sources.map((source, index) => buildIsharesIssuerObservation({ ...source, html: issuerHtml[index], receivedAt }));
  return reconcileEtfFlows(aggregate, observations, receivedAt);
};

const publicHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept',
  'Cache-Control': 'public, max-age=30, stale-while-revalidate=270',
  'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
  'X-Content-Type-Options': 'nosniff'
};

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: publicHeaders });
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers: publicHeaders });

  const receivedAt = new Date().toISOString();
  const jobs = {
    dominance: fetchJson('https://api.coingecko.com/api/v3/global').then((payload) => buildDominanceSnapshot(payload, receivedAt)),
    open_interest: fetchJson('https://api.llama.fi/overview/open-interest?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=true').then((payload) => buildOpenInterestSnapshot(payload, receivedAt)),
    implied_volatility: fetchDvol(receivedAt),
    etf_flows: fetchEtfFlows(receivedAt)
  };
  const entries = await Promise.all(Object.entries(jobs).map(async ([key, job]) => {
    try { return [key, await job, null]; } catch (error) { return [key, null, error?.message || 'Error de fuente']; }
  }));
  const data = Object.fromEntries(entries.map(([key, value]) => [key, value]));
  const errors = Object.fromEntries(entries.filter(([, , error]) => error).map(([key, , error]) => [key, error]));
  const available = Object.values(data).filter(Boolean).length;
  const payload = {
    schema_version: 'kaufman-market-context-v1',
    delivery_mode: 'LIVE_EDGE_CONTEXT',
    generated_at: receivedAt,
    refresh_interval_ms: 5 * 60_000,
    status: available === Object.keys(jobs).length ? 'LIVE' : available ? 'DEGRADED' : 'UNAVAILABLE',
    ...data,
    errors
  };
  return new Response(JSON.stringify(payload), { status: available ? 200 : 503, headers: publicHeaders });
};
