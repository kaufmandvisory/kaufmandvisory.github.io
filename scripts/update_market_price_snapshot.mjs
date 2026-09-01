import { mkdir, rename, writeFile } from 'node:fs/promises';
import marketSnapshot from '../.netlify-functions/market-snapshot.mjs';
import ethereumGas from '../.netlify-functions/ethereum-gas.mjs';

const targetDirectory = new URL('../api/market/', import.meta.url);
const target = new URL('snapshot', targetDirectory);
const temporaryTarget = new URL('snapshot.tmp', targetDirectory);
const gasTarget = new URL('gas', targetDirectory);
const temporaryGasTarget = new URL('gas.tmp', targetDirectory);
const now = Date.now();

await mkdir(targetDirectory, { recursive: true });

const response = await marketSnapshot(new Request('https://kaufmanadvisory.io/api/market/snapshot', {
  method: 'GET',
  headers: { Accept: 'application/json' }
}));
const payload = JSON.parse(await response.text());

for (const asset of ['bitcoin', 'ethereum', 'solana']) {
  const row = payload.reference_prices?.[asset];
  if (!Number.isFinite(row?.price) || row.price <= 0) throw new Error(`${asset}: precio de referencia ausente`);
  if (row.currency !== 'USD') throw new Error(`${asset}: divisa de referencia incorrecta`);
  if (!Array.isArray(row.venues) || row.venues.length === 0) throw new Error(`${asset}: no hay mercados aptos`);
  const observedAt = Date.parse(row.received_at || row.provider_timestamp);
  if (!Number.isFinite(observedAt) || now - observedAt > 60_000) throw new Error(`${asset}: observación obsoleta`);
}

payload.source_delivery_mode = payload.delivery_mode;
payload.delivery_mode = 'AUTOMATED_5_MINUTE_SNAPSHOT';
payload.status = payload.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'AUTOMATED';
payload.refresh_interval_ms = 5 * 60_000;
payload.max_age_ms = 15 * 60_000;
payload.continuity_max_age_ms = 6 * 60 * 60_000;
payload.snapshot_warning = 'Precio de referencia calculado automáticamente en servidor. Objetivo de actualización: cinco minutos; la hora de observación siempre se muestra.';

await writeFile(temporaryTarget, `${JSON.stringify(payload)}\n`, 'utf8');
await rename(temporaryTarget, target);

let gasStatus = 'PRESERVED';
try {
  const gasResponse = await ethereumGas(new Request('https://kaufmanadvisory.io/api/market/gas', {
    method: 'GET',
    headers: { Accept: 'application/json' }
  }));
  const gasPayload = JSON.parse(await gasResponse.text());
  if (!gasResponse.ok || !Number.isFinite(gasPayload.ethereum_fees?.base_fee_gwei)) {
    throw new Error(gasPayload.error || `Ethereum RPC HTTP ${gasResponse.status}`);
  }
  gasPayload.source_delivery_mode = gasPayload.delivery_mode;
  gasPayload.delivery_mode = 'AUTOMATED_5_MINUTE_SNAPSHOT';
  gasPayload.status = 'AUTOMATED';
  gasPayload.refresh_interval_ms = 5 * 60_000;
  gasPayload.max_age_ms = 15 * 60_000;
  gasPayload.snapshot_warning = 'Comisiones Ethereum observadas automáticamente en servidor con desglose lento, estándar y rápido.';
  await writeFile(temporaryGasTarget, `${JSON.stringify(gasPayload)}\n`, 'utf8');
  await rename(temporaryGasTarget, gasTarget);
  gasStatus = 'AUTOMATED';
} catch (error) {
  console.warn(`gas: se conserva la última observación válida (${error?.message || 'fuente no disponible'})`);
}

console.log(JSON.stringify({
  status: payload.status,
  generated_at: payload.generated_at,
  delivery_mode: payload.delivery_mode,
  gas_status: gasStatus,
  prices: Object.fromEntries(Object.entries(payload.reference_prices).map(([asset, row]) => [asset, row.price]))
}, null, 2));
