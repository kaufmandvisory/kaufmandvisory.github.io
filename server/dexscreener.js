const ALLOWED_QUOTES = new Set(['USDC', 'USDT']);
const ETHEREUM_RPC = 'https://eth.drpc.org';
const SOLANA_SIGNATURE_RPC = 'https://solana-rpc.publicnode.com';
const SOLANA_TRANSACTION_RPC = 'https://api.mainnet-beta.solana.com';
const SWAP_TOPICS = [
  '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'
];

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function normalized(value) {
  return String(value || '').trim().toLowerCase();
}

function differencePct(left, right) {
  const a = numberOrNull(left);
  const b = numberOrNull(right);
  if (a === null || b === null) return null;
  return Math.abs(a / b - 1) * 100;
}

function responseTimeIsCredible(responseAt, receivedAt) {
  const source = Date.parse(responseAt);
  const received = Date.parse(receivedAt);
  return Number.isFinite(source) && Number.isFinite(received) && Math.abs(received - source) <= 120_000;
}

async function rpc(fetchImpl, url, body) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(9_000)
  });
  if (!response.ok) throw new Error(`Onchain RPC HTTP ${response.status}`);
  const payload = await response.json();
  if (payload?.error) throw new Error(payload.error.message || 'Onchain RPC error');
  return payload?.result;
}

async function rpcBatch(fetchImpl, url, body) {
  const response = await fetchImpl(url, {
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', 'user-agent': 'Kaufman-Market-Antenna/1.0' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(12_000)
  });
  if (!response.ok) throw new Error(`Onchain RPC batch HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error('Onchain RPC batch response invalid');
  return payload;
}

export async function fetchEthereumLastSwap(pairAddress, fetchImpl = fetch) {
  const latestHex = await rpc(fetchImpl, ETHEREUM_RPC, { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] });
  const latest = Number.parseInt(latestHex, 16);
  if (!Number.isFinite(latest)) throw new Error('Ethereum latest block unavailable');
  const fromBlock = `0x${Math.max(0, latest - 1_024).toString(16)}`;
  const logs = await rpc(fetchImpl, ETHEREUM_RPC, {
    jsonrpc: '2.0', id: 2, method: 'eth_getLogs',
    params: [{ address: pairAddress, fromBlock, toBlock: latestHex, topics: [SWAP_TOPICS] }]
  });
  if (!Array.isArray(logs) || !logs.length) throw new Error('No recent Ethereum Swap log');
  const log = [...logs].sort((a, b) => Number.parseInt(b.blockNumber, 16) - Number.parseInt(a.blockNumber, 16) || Number.parseInt(b.logIndex, 16) - Number.parseInt(a.logIndex, 16))[0];
  const block = await rpc(fetchImpl, ETHEREUM_RPC, { jsonrpc: '2.0', id: 3, method: 'eth_getBlockByNumber', params: [log.blockNumber, false] });
  const timestamp = Number.parseInt(block?.timestamp, 16);
  if (!Number.isFinite(timestamp)) throw new Error('Ethereum block timestamp unavailable');
  const blockNumber = Number.parseInt(log.blockNumber, 16);
  return {
    chain_id: 'ethereum',
    pair_address: pairAddress,
    provider_timestamp: new Date(timestamp * 1_000).toISOString(),
    block_number: blockNumber,
    block_hash: log.blockHash || block?.hash || null,
    transaction_hash: log.transactionHash || null,
    log_index: Number.parseInt(log.logIndex, 16),
    evidence_url: `https://etherscan.io/tx/${log.transactionHash}`,
    source: 'Ethereum JSON-RPC dRPC',
    exact_trade_timestamp_available: true,
    verification_status: 'CHAIN_TRADE_VERIFIED'
  };
}

export async function fetchSolanaLastSwap(pairAddress, fetchImpl = fetch) {
  const signatures = await rpc(fetchImpl, SOLANA_SIGNATURE_RPC, {
    jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
    params: [pairAddress, { limit: 100, commitment: 'confirmed' }]
  });
  if (!Array.isArray(signatures) || !signatures.length) throw new Error('No recent Solana signatures');
  const request = signatures.map((row, index) => ({
    jsonrpc: '2.0', id: index + 2, method: 'getTransaction',
    params: [row.signature, { encoding: 'json', commitment: 'confirmed', maxSupportedTransactionVersion: 0 }]
  }));
  let transactions = [];
  let matchIndex = -1;
  for (let attempt = 0; attempt < 3 && matchIndex < 0; attempt += 1) {
    try {
      const responses = await rpcBatch(fetchImpl, SOLANA_TRANSACTION_RPC, request);
      const byId = new Map(responses.map((row) => [row.id, row.result || null]));
      transactions = signatures.map((row, index) => byId.get(index + 2) || null);
      matchIndex = transactions.findIndex((transaction) => (transaction?.meta?.logMessages || []).some((line) => /Program log: Instruction: Swap(?:V2)?\b/i.test(line)));
    } catch {}
    if (matchIndex < 0) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  for (let index = 0; index < signatures.length && matchIndex < 0; index += 1) {
    try {
      const transaction = await rpc(fetchImpl, SOLANA_SIGNATURE_RPC, request[index]);
      if ((transaction?.meta?.logMessages || []).some((line) => /Program log: Instruction: Swap(?:V2)?\b/i.test(line))) {
        transactions[index] = transaction;
        matchIndex = index;
      }
    } catch {}
  }
  if (matchIndex < 0) throw new Error('No confirmed Solana swap instruction');
  const signature = signatures[matchIndex];
  const transaction = transactions[matchIndex];
  const blockTime = Number(transaction?.blockTime ?? signature?.blockTime);
  if (!Number.isFinite(blockTime)) throw new Error('Solana block timestamp unavailable');
  return {
    chain_id: 'solana',
    pair_address: pairAddress,
    provider_timestamp: new Date(blockTime * 1_000).toISOString(),
    slot: Number(transaction?.slot ?? signature?.slot),
    signature: signature.signature,
    evidence_url: `https://solscan.io/tx/${signature.signature}`,
    source: 'Solana Mainnet JSON-RPC',
    exact_trade_timestamp_available: true,
    verification_status: 'CHAIN_TRADE_VERIFIED'
  };
}

export async function fetchOnchainSwapEvidence({ chainId, pairAddress }, fetchImpl = fetch) {
  const chain = normalized(chainId);
  const operation = chain === 'ethereum'
    ? () => fetchEthereumLastSwap(pairAddress, fetchImpl)
    : chain === 'solana'
      ? () => fetchSolanaLastSwap(pairAddress, fetchImpl)
      : null;
  if (!operation) throw new Error(`Unsupported onchain evidence chain: ${chain}`);
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { return await operation(); } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
    }
  }
  throw lastError;
}

export function selectDexPair(asset, pairs = []) {
  const contract = normalized(asset.contractAddress || asset.address);
  return pairs
    .filter((pair) => normalized(pair.chainId) === normalized(asset.chainId || asset.chain))
    .filter((pair) => normalized(pair.baseToken?.address) === contract)
    .filter((pair) => ALLOWED_QUOTES.has(String(pair.quoteToken?.symbol || '').toUpperCase()))
    .filter((pair) => numberOrNull(pair.priceUsd) !== null && numberOrNull(pair.liquidity?.usd) !== null)
    .sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0))[0] || null;
}

export function verifyDexPair({ asset, pair, confirmation, receivedAt, sourceResponseAt, confirmationResponseAt, referencePriceUsd = null, onchainEvidence = null }) {
  if (!pair) throw new Error('DEX pair is required');
  const chainId = String(asset.chainId || asset.chain).toLowerCase();
  const contractAddress = String(asset.contractAddress || asset.address);
  const price = numberOrNull(pair.priceUsd);
  const confirmedPrice = numberOrNull(confirmation?.priceUsd);
  const referenceDeviation = differencePct(price, referencePriceUsd);
  const endpointPriceDeviation = differencePct(price, confirmedPrice);
  const endpointLiquidityDeviation = differencePct(pair.liquidity?.usd, confirmation?.liquidity?.usd);
  const endpointVolumeDeviation = differencePct(pair.volume?.h24, confirmation?.volume?.h24);
  const checks = {
    chain_id_match: normalized(pair.chainId) === normalized(chainId) && normalized(confirmation?.chainId) === normalized(chainId),
    contract_match: normalized(pair.baseToken?.address) === normalized(contractAddress) && normalized(confirmation?.baseToken?.address) === normalized(contractAddress),
    pair_address_match: normalized(pair.pairAddress) !== '' && normalized(pair.pairAddress) === normalized(confirmation?.pairAddress),
    quote_asset_allowed: ALLOWED_QUOTES.has(String(pair.quoteToken?.symbol || '').toUpperCase()) && String(pair.quoteToken?.symbol || '').toUpperCase() === String(confirmation?.quoteToken?.symbol || '').toUpperCase(),
    source_response_time_valid: responseTimeIsCredible(sourceResponseAt, receivedAt) && responseTimeIsCredible(confirmationResponseAt, receivedAt),
    endpoint_price_match: endpointPriceDeviation !== null && endpointPriceDeviation <= 1,
    endpoint_liquidity_match: endpointLiquidityDeviation !== null && endpointLiquidityDeviation <= 5,
    endpoint_volume_match: endpointVolumeDeviation !== null && endpointVolumeDeviation <= 5,
    onchain_pair_match: Boolean(onchainEvidence?.exact_trade_timestamp_available) && normalized(onchainEvidence?.chain_id) === normalized(chainId) && normalized(onchainEvidence?.pair_address) === normalized(pair.pairAddress),
    onchain_timestamp_valid: Boolean(onchainEvidence?.exact_trade_timestamp_available) && Number.isFinite(Date.parse(onchainEvidence?.provider_timestamp)),
    reference_price_match: referenceDeviation === null ? null : referenceDeviation <= 2.5
  };
  const structuralChecks = Object.entries(checks)
    .filter(([key]) => key !== 'reference_price_match')
    .every(([, value]) => value === true);
  const referenceChecked = checks.reference_price_match !== null;
  const fullyVerified = structuralChecks && (!referenceChecked || checks.reference_price_match === true);
  const verificationStatus = fullyVerified
    ? (referenceChecked ? 'VERIFIED' : 'SOURCE_CROSSCHECKED')
    : 'REVIEW_REQUIRED';
  const sourceObservedAt = new Date(confirmationResponseAt || sourceResponseAt).toISOString();

  return {
    name: asset.name,
    canonical_asset_id: asset.canonicalAssetId || asset.id,
    identity: `${chainId}:${contractAddress.toLowerCase()}`,
    chain_id: chainId,
    contract_address: contractAddress,
    dex: pair.dexId || null,
    pair_address: pair.pairAddress || null,
    quote_contract_address: pair.quoteToken?.address || null,
    quote_symbol: pair.quoteToken?.symbol || null,
    url: pair.url || confirmation?.url || null,
    price,
    currency: 'USD',
    volume_24h_quote: numberOrNull(pair.volume?.h24),
    liquidity_usd: numberOrNull(pair.liquidity?.usd),
    transactions_5m: Number(confirmation?.txns?.m5?.buys || 0) + Number(confirmation?.txns?.m5?.sells || 0),
    provider_timestamp: onchainEvidence?.provider_timestamp || null,
    source_response_at: sourceObservedAt,
    received_at: receivedAt,
    exact_trade_timestamp_available: Boolean(onchainEvidence?.exact_trade_timestamp_available),
    onchain_evidence: onchainEvidence,
    verification_status: verificationStatus,
    verification_method: referenceChecked
      ? 'DEX Screener token-pairs + endpoint del pool + identidad chainId/contrato + último swap verificado por JSON-RPC + contraste Kaufman Reference Price.'
      : 'DEX Screener token-pairs + endpoint del pool + identidad chainId/contrato + último swap verificado por JSON-RPC; no se usa como precio de referencia.',
    verification_checks: checks,
    endpoint_price_deviation_pct: endpointPriceDeviation,
    reference_price_usd: numberOrNull(referencePriceUsd),
    reference_deviation_pct: referenceDeviation
  };
}
