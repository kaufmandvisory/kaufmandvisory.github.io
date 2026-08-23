import { promises as dns } from 'node:dns';
import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import tls from 'node:tls';

const ROOT = path.resolve(import.meta.dirname, '..');
const DOMAIN = process.env.KAUFMAN_AUDIT_DOMAIN || 'kaufmanadvisory.io';
const BASE = `https://${DOMAIN}`;
const RDAP_URL = process.env.KAUFMAN_RDAP_URL || `https://rdap.identitydigital.services/rdap/domain/${DOMAIN}`;

const safe = async (job, fallback = []) => {
  try { return await job; } catch { return fallback; }
};

const flattenTxt = (records) => records.map((parts) => parts.join(''));

const resolveDs = async (name) => {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=DS`;
  const response = await fetch(url, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`DoH DS lookup failed: HTTP ${response.status}`);
  const payload = await response.json();
  return (payload.Answer || []).filter((record) => record.type === 43).map((record) => record.data);
};

const certificate = await new Promise((resolve) => {
  const socket = tls.connect({ host: DOMAIN, port: 443, servername: DOMAIN, rejectUnauthorized: true, minVersion: 'TLSv1.2' }, () => {
    const cert = socket.getPeerCertificate();
    resolve({
      authorized: socket.authorized,
      protocol: socket.getProtocol(),
      cipher: socket.getCipher()?.standardName || socket.getCipher()?.name || null,
      subject: cert.subject?.CN || null,
      issuer: cert.issuer?.CN || null,
      valid_from: cert.valid_from || null,
      valid_to: cert.valid_to || null,
      fingerprint256: cert.fingerprint256 || null
    });
    socket.end();
  });
  socket.once('error', (error) => resolve({ authorized: false, error: error.message }));
});

const rdap = await safe(fetch(RDAP_URL, {
  headers: { accept: 'application/rdap+json, application/json' },
  signal: AbortSignal.timeout(15_000)
}).then(async (response) => {
  if (!response.ok) throw new Error(`RDAP lookup failed: HTTP ${response.status}`);
  const payload = await response.json();
  const registrar = payload.entities?.find((entity) => entity.roles?.includes('registrar'));
  const registrarName = registrar?.vcardArray?.[1]?.find((field) => field[0] === 'fn')?.[3] || null;
  const expiration = payload.events?.find((event) => event.eventAction === 'expiration')?.eventDate || null;
  return {
    status: payload.status || [],
    registrar: registrarName,
    registrar_iana_id: registrar?.publicIds?.find((item) => item.type === 'IANA Registrar ID')?.identifier || null,
    expiration,
    dnssec_delegated: payload.secureDNS?.delegationSigned === true,
    authoritative_url: RDAP_URL
  };
}), null);

const [a, aaaa, ns, caa, ds, mx, rootTxt, dmarcTxt, dkimTxt] = await Promise.all([
  safe(dns.resolve4(DOMAIN)),
  safe(dns.resolve6(DOMAIN)),
  safe(dns.resolveNs(DOMAIN)),
  safe(dns.resolve(DOMAIN, 'CAA')),
  safe(resolveDs(DOMAIN)),
  safe(dns.resolveMx(DOMAIN)),
  safe(dns.resolveTxt(DOMAIN)).then(flattenTxt),
  safe(dns.resolveTxt(`_dmarc.${DOMAIN}`)).then(flattenTxt),
  safe(dns.resolveTxt(`zmail._domainkey.${DOMAIN}`)).then(flattenTxt)
]);

const spf = rootTxt.find((value) => value.startsWith('v=spf1')) || null;
const dmarc = dmarcTxt.find((value) => value.startsWith('v=DMARC1')) || null;
const dkim = dkimTxt.find((value) => value.startsWith('v=DKIM1')) || null;
let dkimBits = null;
try {
  const publicKey = dkim?.match(/(?:^|;)\s*p=([^;\s]+)/)?.[1];
  if (publicKey) {
    const pem = `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
    dkimBits = crypto.createPublicKey(pem).asymmetricKeyDetails?.modulusLength || null;
  }
} catch {}

const head = await fetch(BASE, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15_000) });
const headers = Object.fromEntries([...head.headers.entries()].filter(([name]) => [
  'server', 'strict-transport-security', 'content-security-policy', 'x-content-type-options',
  'x-frame-options', 'referrer-policy', 'permissions-policy', 'cache-control'
].includes(name)));

const html = await fetch(`${BASE}/?audit=raw-source`, { signal: AbortSignal.timeout(15_000) }).then((response) => response.text());
const legal = {};
for (const route of ['/privacidad.html', '/aviso-legal.html', '/terminos.html', '/contacto/']) {
  const response = await fetch(`${BASE}${route}`, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
  const body = await response.text();
  legal[route] = { status: response.status, content_type: response.headers.get('content-type'), raw_title: /<h1>[^<]{3,}<\/h1>/.test(body) };
}
const securityTxtResponse = await fetch(`${BASE}/.well-known/security.txt`, { signal: AbortSignal.timeout(15_000) });

const findings = [
  { id: 'WEB-01', control: 'TLS', status: certificate.authorized && certificate.protocol === 'TLSv1.3' ? 'PASS' : 'REVIEW', evidence: certificate },
  { id: 'WEB-02', control: 'HSTS', status: headers['strict-transport-security'] ? 'PASS' : 'MISSING', evidence: headers['strict-transport-security'] || null },
  { id: 'WEB-03', control: 'CSP', status: headers['content-security-policy'] ? 'HEADER' : /http-equiv="Content-Security-Policy"/.test(html) ? 'META_FALLBACK' : 'MISSING', evidence: headers['content-security-policy'] || 'CSP en HTML inicial' },
  { id: 'WEB-04', control: 'Anti-iframe', status: headers['x-frame-options'] || headers['content-security-policy']?.includes('frame-ancestors') ? 'PASS' : 'HOST_LIMITATION', evidence: headers['x-frame-options'] || null },
  { id: 'WEB-05', control: 'HTML legible sin JavaScript', status: /class="kf-source-fallback"/.test(html) ? 'PASS' : 'MISSING', evidence: { bytes: Buffer.byteLength(html), h1_in_source: /<h1>[^<]{3,}<\/h1>/.test(html) } },
  { id: 'WEB-06', control: 'Páginas legales', status: Object.values(legal).every((item) => item.status === 200 && item.raw_title) ? 'PASS' : 'REVIEW', evidence: legal },
  { id: 'WEB-07', control: 'Security contact', status: securityTxtResponse.ok ? 'PASS' : 'MISSING', evidence: { status: securityTxtResponse.status } },
  { id: 'DNS-01', control: 'IPv6 apex', status: aaaa.length === 4 ? 'PASS' : 'MISSING', evidence: aaaa },
  { id: 'DNS-02', control: 'DNSSEC', status: ds.length ? 'PASS' : 'MISSING', evidence: ds },
  { id: 'DNS-03', control: 'CAA', status: caa.length ? 'PASS' : 'MISSING', evidence: caa },
  { id: 'DNS-04', control: 'Registro y caducidad', status: rdap?.status?.includes('active') && rdap?.expiration && Date.parse(rdap.expiration) - Date.now() > 90 * 86_400_000 ? 'PASS' : 'REVIEW', evidence: rdap },
  { id: 'MAIL-01', control: 'SPF', status: spf?.includes('-all') ? 'ENFORCED' : spf?.includes('~all') ? 'SOFTFAIL' : 'REVIEW', evidence: spf },
  { id: 'MAIL-02', control: 'DKIM Zoho', status: dkimBits >= 2048 ? 'PASS' : 'WEAK_KEY', evidence: { selector: 'zmail', rsa_bits: dkimBits } },
  { id: 'MAIL-03', control: 'DMARC', status: dmarc?.includes('p=reject') ? 'ENFORCED' : dmarc?.includes('p=quarantine') ? 'QUARANTINE' : 'REVIEW', evidence: dmarc }
];

const unresolved = findings.filter((item) => ['MISSING', 'HOST_LIMITATION', 'SOFTFAIL', 'WEAK_KEY', 'QUARANTINE', 'REVIEW'].includes(item.status));
const report = {
  schema_version: 'kaufman-security-audit-v1',
  generated_at: new Date().toISOString(),
  domain: DOMAIN,
  status: unresolved.length ? 'EXTERNAL_ACTION_REQUIRED' : 'PASS',
  hosting: { server: headers.server || null, addresses_v4: a, nameservers: ns, mail_exchangers: mx },
  registration: rdap,
  certificate,
  response_headers: headers,
  findings,
  unresolved_count: unresolved.length,
  limitations: [
    'Los cambios de DNSSEC, CAA, IPv6 y correo requieren acceso administrativo a Cloudflare, registrador y Zoho.',
    'Core Web Vitals de campo requieren datos CrUX o analítica de usuarios reales; no se infieren desde una sola carga sintética.'
  ]
};

await fs.writeFile(path.join(ROOT, 'security-audit-latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: report.status, findings: findings.map(({ id, status }) => ({ id, status })), unresolved_count: unresolved.length }, null, 2));
