const OFFICIAL_PRODUCTS = Object.freeze([
  {
    id: 'ledger', name: 'Ledger Wallet', repository: 'LedgerHQ/ledger-live',
    release_url: 'https://api.github.com/repos/LedgerHQ/ledger-live/releases/latest',
    advisories_url: 'https://api.github.com/repos/LedgerHQ/ledger-live/security-advisories?per_page=10',
    status_url: 'https://status.ledger.com/api/v2/status.json',
    firmware: { status: 'DEVICE_MEDIATED', label: 'Firmware gestionado desde Ledger Wallet', source_url: 'https://support.ledger.com/article/360013349800-zd' },
    compatibility: ['Escritorio', 'Móvil', 'Signer hardware']
  },
  {
    id: 'trezor', name: 'Trezor Suite', repository: 'trezor/trezor-suite',
    release_url: 'https://api.github.com/repos/trezor/trezor-suite/releases/latest',
    advisories_url: 'https://api.github.com/repos/trezor/trezor-firmware/security-advisories?per_page=10',
    status_url: null,
    firmware_urls: [
      { model: 'Trezor Model One', url: 'https://data.trezor.io/firmware/1/releases.json' },
      { model: 'Trezor Safe / Model T', url: 'https://data.trezor.io/firmware/2/releases.json' }
    ],
    compatibility: ['Escritorio', 'Web', 'Signer hardware']
  },
  {
    id: 'metamask', name: 'MetaMask Extension', repository: 'MetaMask/metamask-extension',
    release_url: 'https://api.github.com/repos/MetaMask/metamask-extension/releases/latest',
    advisories_url: 'https://api.github.com/repos/MetaMask/metamask-extension/security-advisories?per_page=10',
    status_url: null,
    firmware: { status: 'NOT_APPLICABLE', label: 'Wallet de software: no usa firmware propio', source_url: 'https://github.com/MetaMask/metamask-extension/security/policy' },
    compatibility: ['Extensión de navegador', 'Móvil', 'Conexión con signer hardware']
  }
]);

const cleanRelease = (payload) => payload && !payload.draft ? ({
  version: payload.tag_name || payload.name,
  published_at: payload.published_at,
  source_url: payload.html_url,
  verification_status: 'OFFICIAL_RELEASE_OBSERVED'
}) : null;

const cleanAdvisory = (row) => ({
  id: row.ghsa_id,
  severity: String(row.severity || 'unknown').toUpperCase(),
  published_at: row.published_at,
  updated_at: row.updated_at,
  source_url: row.html_url,
  status: row.withdrawn_at ? 'WITHDRAWN' : 'PUBLISHED'
});

function latestFirmware(payload, model, sourceUrl) {
  const rows = Array.isArray(payload) ? payload : payload?.releases;
  const row = Array.isArray(rows) ? rows.find((item) => item?.version && !item?.skip) || rows[0] : null;
  if (!row?.version) return null;
  return {
    model,
    version: Array.isArray(row.version) ? row.version.join('.') : String(row.version),
    published_at: row.release || row.date || null,
    status: 'SIGNED_METADATA_OBSERVED',
    source_url: sourceUrl
  };
}

async function optional(task) {
  try { return await task(); } catch { return null; }
}

export async function buildWalletIntelligence({ fetchJson, receivedAt = new Date().toISOString() }) {
  const products = await Promise.all(OFFICIAL_PRODUCTS.map(async (product) => {
    const [releasePayload, advisoryPayload, statusPayload] = await Promise.all([
      optional(() => fetchJson(product.release_url)),
      optional(() => fetchJson(product.advisories_url, { headers: { accept: 'application/vnd.github+json' } })),
      product.status_url ? optional(() => fetchJson(product.status_url)) : null
    ]);
    const firmware = product.firmware_urls
      ? (await Promise.all(product.firmware_urls.map(async (entry) => latestFirmware(await optional(() => fetchJson(entry.url)), entry.model, entry.url)))).filter(Boolean)
      : [product.firmware];
    const advisories = Array.isArray(advisoryPayload) ? advisoryPayload.filter((row) => row?.published_at).map(cleanAdvisory) : [];
    return {
      id: product.id,
      name: product.name,
      repository: product.repository,
      application: cleanRelease(releasePayload),
      firmware,
      compatibility: { status: 'DOCUMENTED', channels: product.compatibility, source_url: releasePayload?.html_url || product.firmware?.source_url || product.release_url },
      advisories: { status: advisoryPayload ? 'PUBLIC_REGISTRY_OBSERVED' : 'UNAVAILABLE', open_or_published_count: advisories.filter((row) => row.status === 'PUBLISHED').length, items: advisories },
      service: statusPayload?.status ? { status: 'OBSERVED', indicator: String(statusPayload.status.indicator || 'unknown').toUpperCase(), description: statusPayload.status.description, source_url: product.status_url } : { status: 'NOT_PUBLISHED', indicator: null, description: 'No se localizó un endpoint público verificable de estado.', source_url: null }
    };
  }));
  const dimensions = products.flatMap((product) => [product.application, product.firmware?.length, product.compatibility?.status === 'DOCUMENTED', product.advisories?.status === 'PUBLIC_REGISTRY_OBSERVED']);
  return {
    schema_version: 'kaufman-wallet-intelligence-v2',
    generated_at: receivedAt,
    products,
    coverage: { expected_controls: products.length * 4, observed_controls: dimensions.filter(Boolean).length, products: products.length },
    methodology: 'Releases y avisos públicos observados en repositorios oficiales; firmware Trezor desde metadatos firmados y estado Ledger desde su endpoint público. La ausencia de avisos publicados no demuestra ausencia de vulnerabilidades.'
  };
}

export function validateWalletIntelligence(snapshot) {
  if (snapshot?.schema_version !== 'kaufman-wallet-intelligence-v2') throw new Error('Invalid wallet intelligence schema');
  if (!Array.isArray(snapshot.products) || snapshot.products.length < 3) throw new Error('Wallet product coverage incomplete');
  for (const product of snapshot.products) {
    if (!product.id || !product.application || !product.firmware?.length || !product.compatibility || !product.advisories) throw new Error(`Incomplete wallet controls: ${product.id}`);
  }
  return true;
}
