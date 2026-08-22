const RPC_URL = 'https://ethereum-rpc.publicnode.com';

const hexNumber = (value) => value ? Number.parseInt(String(value), 16) : null;

async function ethereumRpc(fetchJson, calls) {
  const payload = await fetchJson(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(calls.map((call, index) => ({ jsonrpc: '2.0', id: index + 1, ...call })))
  });
  return Array.isArray(payload) ? payload : [payload];
}

function decodeLatestRoundData(hex) {
  const clean = String(hex || '').replace(/^0x/, '');
  if (clean.length < 64 * 5) return null;
  const words = Array.from({ length: 5 }, (_, index) => clean.slice(index * 64, (index + 1) * 64));
  const answer = Number(BigInt(`0x${words[1]}`));
  const updatedAt = Number(BigInt(`0x${words[3]}`));
  if (!Number.isFinite(answer) || !Number.isFinite(updatedAt) || updatedAt <= 0) return null;
  return { answer: answer / 1e8, updated_at: new Date(updatedAt * 1000).toISOString() };
}

async function safe(task) { try { return await task(); } catch (error) { return { error: error.message }; } }

export async function buildWeb3Telemetry({ fetchJson, fetchText, receivedAt = new Date().toISOString(), l2Intelligence }) {
  const [ethereum, chainlink, ens, ipfs, filecoin, graph] = await Promise.all([
    safe(async () => {
      const rows = await ethereumRpc(fetchJson, [
        { method: 'eth_getBlockByNumber', params: ['latest', false] },
        { method: 'eth_syncing', params: [] }
      ]);
      const block = rows.find((row) => row.id === 1)?.result;
      if (!block?.number) throw new Error('latest block unavailable');
      return { status: 'CHAIN_OBSERVED', metric: `Bloque ${hexNumber(block.number).toLocaleString('es-ES')}`, provider_timestamp: new Date(hexNumber(block.timestamp) * 1000).toISOString(), source_url: RPC_URL, detail: rows.find((row) => row.id === 2)?.result === false ? 'Nodo sincronizado' : 'Nodo sincronizando' };
    }),
    safe(async () => {
      const feed = '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c';
      const rows = await ethereumRpc(fetchJson, [{ method: 'eth_call', params: [{ to: feed, data: '0xfeaf968c' }, 'latest'] }]);
      const decoded = decodeLatestRoundData(rows[0]?.result);
      if (!decoded) throw new Error('oracle round unavailable');
      return { status: 'CONTRACT_OBSERVED', metric: `BTC/USD ${decoded.answer.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`, provider_timestamp: decoded.updated_at, source_url: 'https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1', detail: `Feed ${feed}` };
    }),
    safe(async () => {
      const registry = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
      const rows = await ethereumRpc(fetchJson, [{ method: 'eth_getCode', params: [registry, 'latest'] }]);
      const bytecode = rows[0]?.result;
      if (!bytecode || bytecode === '0x') throw new Error('registry contract unavailable');
      return { status: 'CONTRACT_OBSERVED', metric: `${Math.floor((bytecode.length - 2) / 2).toLocaleString('es-ES')} bytes de bytecode`, provider_timestamp: receivedAt, source_url: 'https://docs.ens.domains/learn/deployments', detail: `Registro ENS ${registry}` };
    }),
    safe(async () => {
      const page = await fetchText('https://ipfs.io/');
      if (!page || page.length < 100) throw new Error('gateway unavailable');
      return { status: 'GATEWAY_OBSERVED', metric: 'Gateway público accesible', provider_timestamp: receivedAt, source_url: 'https://ipfs.io/', detail: 'La disponibilidad de un gateway no garantiza persistencia del contenido.' };
    }),
    safe(async () => {
      const release = await fetchJson('https://api.github.com/repos/filecoin-project/lotus/releases/latest');
      if (!release?.tag_name) throw new Error('release unavailable');
      return { status: 'OFFICIAL_RELEASE_OBSERVED', metric: release.tag_name, provider_timestamp: release.published_at, source_url: release.html_url, detail: 'Cliente Lotus · última release oficial' };
    }),
    safe(async () => {
      const release = await fetchJson('https://api.github.com/repos/graphprotocol/graph-node/releases/latest');
      if (!release?.tag_name) throw new Error('release unavailable');
      return { status: 'OFFICIAL_RELEASE_OBSERVED', metric: release.tag_name, provider_timestamp: release.published_at, source_url: release.html_url, detail: 'Graph Node · última release oficial' };
    })
  ]);
  const arbitrumProject = l2Intelligence?.projects?.find((row) => /arbitrum/i.test(`${row.slug || ''} ${row.name || ''}`));
  const arbitrum = arbitrumProject ? {
    status: 'L2BEAT_OBSERVED',
    metric: arbitrumProject.stage_label_es || arbitrumProject.stage || 'Madurez observada',
    provider_timestamp: l2Intelligence.generated_at || receivedAt,
    source_url: arbitrumProject.source_url,
    detail: `TVS ${Number(arbitrumProject.tvs_usd || 0).toLocaleString('es-ES')} USD`
  } : { error: 'L2BEAT project unavailable' };
  const profiles = [
    ['ethereum', 'Ethereum', 'Liquidación', ethereum],
    ['arbitrum', 'Arbitrum One', 'Escalado', arbitrum],
    ['chainlink', 'Chainlink', 'Datos externos', chainlink],
    ['ipfs', 'IPFS', 'Datos persistentes', ipfs],
    ['filecoin', 'Filecoin', 'Persistencia incentivada', filecoin],
    ['the-graph', 'The Graph', 'Indexación', graph],
    ['ens', 'ENS', 'Identidad', ens]
  ].map(([id, name, layer, observation]) => ({ id, name, layer, ...observation, verification_status: observation?.error ? 'UNAVAILABLE' : observation.status }));
  const observed = profiles.filter((row) => row.verification_status !== 'UNAVAILABLE').length;
  return {
    schema_version: 'kaufman-web3-telemetry-v1',
    generated_at: receivedAt,
    profiles,
    coverage: { expected: profiles.length, observed, observed_pct: Math.round(observed / profiles.length * 10_000) / 100 },
    methodology: 'Telemetría pública de cadena, contratos, releases y disponibilidad. Cada señal mide una dependencia concreta; no convierte el proyecto en descentralizado ni seguro.'
  };
}

export function validateWeb3Telemetry(snapshot) {
  if (snapshot?.schema_version !== 'kaufman-web3-telemetry-v1') throw new Error('Invalid Web3 telemetry schema');
  if (snapshot?.coverage?.expected !== 7 || snapshot?.coverage?.observed < 5) throw new Error('Web3 telemetry coverage below minimum');
  return true;
}
