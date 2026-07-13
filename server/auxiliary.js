import { CONFIG } from './config.js';

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function hexWeiToGwei(value) {
  if (typeof value !== 'string' || !value.startsWith('0x')) return null;
  try { return Number(BigInt(value)) / 1e9; } catch { return null; }
}

export function buildEthereumFeeSnapshot(feeHistory, block, receivedAt = new Date().toISOString()) {
  if (!Array.isArray(feeHistory?.baseFeePerGas) || feeHistory.baseFeePerGas.length < 2) throw new Error('Incomplete eth_feeHistory base fees');
  if (!Array.isArray(feeHistory?.reward) || !feeHistory.reward.length) throw new Error('Incomplete eth_feeHistory rewards');
  const baseFee = hexWeiToGwei(feeHistory.baseFeePerGas.at(-1));
  if (!Number.isFinite(baseFee)) throw new Error('Invalid EIP-1559 base fee');
  const priorities = [0, 1, 2].map((index) => median(feeHistory.reward.map((row) => hexWeiToGwei(row?.[index]))));
  if (priorities.some((value) => !Number.isFinite(value))) throw new Error('Invalid EIP-1559 priority fees');
  const utilization = median((feeHistory.gasUsedRatio || []).map(Number));
  const blockNumber = typeof block?.number === 'string' ? Number.parseInt(block.number, 16) : null;
  const blockTimestamp = typeof block?.timestamp === 'string' ? new Date(Number.parseInt(block.timestamp, 16) * 1000).toISOString() : null;
  const names = ['safe', 'standard', 'fast'];
  const tiers = Object.fromEntries(names.map((name, index) => [name, {
    max_fee_gwei: baseFee + priorities[index],
    base_fee_gwei: baseFee,
    priority_fee_gwei: priorities[index]
  }]));
  return {
    base_fee_gwei: baseFee,
    gas_used_ratio: Number.isFinite(utilization) ? Math.round(utilization * 10_000) / 10_000 : null,
    block_number: Number.isFinite(blockNumber) ? blockNumber : null,
    provider_timestamp: blockTimestamp,
    received_at: receivedAt,
    tiers,
    verification_status: blockTimestamp ? 'CHAIN_OBSERVED' : 'TIMESTAMP_UNVERIFIED',
    methodology: 'eth_feeHistory sobre 20 bloques; percentiles 10/50/90 de propina + base fee EIP-1559 del siguiente bloque'
  };
}

export class AuxiliaryConnector {
  constructor({ onData, onHealth, config = CONFIG }) {
    this.onData = onData;
    this.onHealth = onHealth;
    this.config = config;
    this.data = { ethereum_gas: null, ethereum_fees: null, etherscan_gas_oracle: null, exchange_fees: null };
    this.gasTimer = null;
    this.feesTimer = null;
    this.stopped = false;
  }

  start() {
    this.stopped = false;
    this.refreshGas();
    this.refreshFees();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.gasTimer);
    clearTimeout(this.feesTimer);
  }

  publish() { this.onData(this.data); }

  async refreshGas() {
    try {
      const response = await fetch('https://ethereum-rpc.publicnode.com', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' },
        body: JSON.stringify([
          { jsonrpc: '2.0', method: 'eth_feeHistory', params: ['0x14', 'latest', [10, 50, 90]], id: 1 },
          { jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', false], id: 2 }
        ]),
        signal: AbortSignal.timeout(9_000)
      });
      if (!response.ok) throw new Error(`Ethereum RPC HTTP ${response.status}`);
      const payload = await response.json();
      const feeHistory = payload.find?.((row) => row.id === 1)?.result;
      const block = payload.find?.((row) => row.id === 2)?.result;
      const fees = buildEthereumFeeSnapshot(feeHistory, block);
      this.data.ethereum_fees = fees;
      this.data.ethereum_gas = {
        gas_gwei: fees.tiers.standard.max_fee_gwei,
        provider_timestamp: fees.provider_timestamp,
        received_at: fees.received_at,
        verification_status: fees.verification_status,
        methodology: fees.methodology
      };
      this.onHealth('ethereum_rpc', { connection_status: 'CONNECTED', last_message_at: fees.received_at, block_number: fees.block_number });
      await this.refreshEtherscanOracle(fees);
      this.publish();
    } catch (error) {
      this.data.ethereum_gas = null;
      this.data.ethereum_fees = null;
      this.onHealth('ethereum_rpc', { connection_status: 'DEGRADED', last_error: error.message });
      this.publish();
    } finally {
      if (!this.stopped) this.gasTimer = setTimeout(() => this.refreshGas(), this.config.gasIntervalMs);
    }
  }

  async refreshEtherscanOracle(chainFees) {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
      this.data.etherscan_gas_oracle = null;
      return;
    }
    try {
      const url = new URL('https://api.etherscan.io/v2/api');
      url.searchParams.set('chainid', '1');
      url.searchParams.set('module', 'gastracker');
      url.searchParams.set('action', 'gasoracle');
      url.searchParams.set('apikey', apiKey);
      const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' }, signal: AbortSignal.timeout(9_000) });
      if (!response.ok) throw new Error(`Etherscan Gas Oracle HTTP ${response.status}`);
      const payload = await response.json();
      if (payload.status !== '1') throw new Error(`Etherscan Gas Oracle: ${payload.result || payload.message}`);
      const standard = Number(payload.result.ProposeGasPrice);
      const safe = Number(payload.result.SafeGasPrice);
      const fast = Number(payload.result.FastGasPrice);
      const base = Number(payload.result.suggestBaseFee);
      if (![standard, safe, fast, base].every(Number.isFinite)) throw new Error('Incomplete Etherscan Gas Oracle response');
      this.data.etherscan_gas_oracle = {
        tiers: { safe_gwei: safe, standard_gwei: standard, fast_gwei: fast },
        base_fee_gwei: base,
        last_block: Number(payload.result.LastBlock),
        received_at: new Date().toISOString(),
        divergence_standard_pct: chainFees.tiers.standard.max_fee_gwei ? Math.abs(standard - chainFees.tiers.standard.max_fee_gwei) / chainFees.tiers.standard.max_fee_gwei * 100 : null,
        verification_status: 'SOURCE_OBSERVED',
        methodology: 'Etherscan Gas Oracle V2 · conector gratuito opcional server-side'
      };
      this.onHealth('etherscan_gas_oracle', { connection_status: 'CONNECTED', last_message_at: this.data.etherscan_gas_oracle.received_at });
    } catch (error) {
      this.data.etherscan_gas_oracle = null;
      this.onHealth('etherscan_gas_oracle', { connection_status: 'DEGRADED', last_error: error.message });
    }
  }

  async refreshFees() {
    try {
      const response = await fetch('https://api.kraken.com/0/public/AssetPairs?pair=XBTUSD&info=fees', {
        headers: { accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' },
        signal: AbortSignal.timeout(9_000)
      });
      if (!response.ok) throw new Error(`Kraken REST HTTP ${response.status}`);
      const payload = await response.json();
      if (payload.error?.length) throw new Error(payload.error.join(', '));
      const pair = Object.values(payload.result || {})[0];
      const maker = Number(pair?.fees_maker?.[0]?.[1]);
      const taker = Number(pair?.fees?.[0]?.[1]);
      if (!Number.isFinite(maker) || !Number.isFinite(taker)) throw new Error('Incomplete fee response');
      this.data.exchange_fees = {
        exchange: 'Kraken', pair: 'BTC/USD', maker, taker,
        received_at: new Date().toISOString(),
        verification_status: 'OBSERVED',
        methodology: 'primer tramo público de volumen de 30 días; actualización server-side diaria'
      };
      this.onHealth('kraken_fees', { connection_status: 'CONNECTED', last_message_at: this.data.exchange_fees.received_at });
      this.publish();
    } catch (error) {
      this.data.exchange_fees = null;
      this.onHealth('kraken_fees', { connection_status: 'DEGRADED', last_error: error.message });
      this.publish();
    } finally {
      if (!this.stopped) this.feesTimer = setTimeout(() => this.refreshFees(), this.config.feesIntervalMs);
    }
  }
}
