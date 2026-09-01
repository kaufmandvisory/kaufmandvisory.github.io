import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDominanceSnapshot, buildOpenInterestSnapshot, buildDvolSnapshot, buildEtfFlowSnapshot, buildEtfHistoricalSnapshot } from './market-context.js';

test('builds dominance without using CoinGecko as a ticker', () => {
  const result = buildDominanceSnapshot({ data: { market_cap_percentage: { btc: 58.1, eth: 9.9 }, total_market_cap: { usd: 2_000_000 }, updated_at: 1783936800 } }, '2026-07-13T12:00:00.000Z');
  assert.equal(result.btc_pct, 58.1);
  assert.equal(result.others_pct, 32);
  assert.match(result.methodology, /no interviene en el ticker/i);
});

test('builds open interest with explicit source perimeter', () => {
  const result = buildOpenInterestSnapshot({ total24h: 1000, change_1d: 2, change_7d: -3, totalDataChart: [[1783900800, 1000]], protocols: [{ name: 'Venue A', total24h: 700, chains: ['Chain'] }] }, '2026-07-13T12:00:00.000Z');
  assert.equal(result.open_interest_usd, 1000);
  assert.equal(result.top_venues[0].name, 'Venue A');
  assert.match(result.methodology, /no equivale a todo el mercado mundial/i);
});

test('uses the latest Deribit volatility close', () => {
  const result = buildDvolSnapshot({ BTC: { result: { data: [[1_783_900_800_000, 40, 42, 39, 41.25]] } }, ETH: { result: { data: [[1_783_900_800_000, 50, 55, 49, 54.5]] } } });
  assert.equal(result.assets.btc.value, 41.25);
  assert.equal(result.assets.eth.value, 54.5);
});

test('parses ETF flows and removes an empty current-day placeholder', () => {
  const data = {
    bitcoin: { totalInflow: 0, monthlyData: [{ isoDate: '2026-07-10', inflow: 100, outflow: -20, net: 80 }, { isoDate: '2026-07-13', inflow: 0, outflow: 0, net: 0 }], providers: [] },
    ethereum: { totalInflow: 0, monthlyData: [{ isoDate: '2026-07-10', inflow: 10, outflow: -15, net: -5 }], providers: [] }
  };
  const html = `<script>self.__next_f.push([1,"data":${JSON.stringify(data).replaceAll('"', '\\"')}])</script>${'x'.repeat(1200)}`;
  const result = buildEtfFlowSnapshot(html, '2026-07-13T12:00:00.000Z');
  assert.equal(result.assets.bitcoin.latest_date, '2026-07-10');
  assert.equal(result.assets.bitcoin.latest_net_flow_usd, 80);
  assert.equal(result.assets.ethereum.latest_net_flow_usd, -5);
});

test('builds 7, 30 and 90 calendar-day ETF histories', () => {
  const rows = [];
  for (let day = 1; day <= 100; day += 1) {
    const date = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
    rows.push({ date, asset: 'BTC', net_inflow_usd: day, net_assets_usd: 1000 });
    rows.push({ date, asset: 'ETH', net_inflow_usd: -day, net_assets_usd: 500 });
  }
  const result = buildEtfHistoricalSnapshot({ rows }, '2026-04-10T12:00:00.000Z');
  assert.equal(result.assets.bitcoin.series.length, 90);
  assert.equal(result.assets.bitcoin.period_session_count['7d'], 7);
  assert.equal(result.assets.bitcoin.period_session_count['30d'], 30);
  assert.equal(result.assets.bitcoin.period_session_count['90d'], 90);
  assert.equal(result.assets.ethereum.latest_net_flow_usd, -100);
});
