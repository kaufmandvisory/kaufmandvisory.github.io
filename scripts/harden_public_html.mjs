import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VERSION = 'kaufman-v67';
const ROUTES = {
  home: ['Kaufman · Inteligencia blockchain', 'Mercado, regulación, tokenización, infraestructura y riesgo bajo una misma capa de evidencia pública.'],
  mercados: ['Mercados y capital tokenizado', 'RWA, redes, stablecoins, flujos institucionales, gas y precios de referencia calculados desde mercados públicos.'],
  regulacion: ['Regulación blockchain', 'Normas, consultas, licencias y textos oficiales organizados por jurisdicción y estado jurídico.'],
  tokenizacion: ['Tokenización', 'Productos, entidades, redes y capital onchain con metodología, límites y fuentes públicas.'],
  fiscal: ['Fiscal', 'Comparador de hechos fiscales por jurisdicción con fuentes oficiales y resultados bloqueados cuando faltan datos.'],
  empresas: ['Empresas', 'Actividad corporativa, exposición blockchain e iniciativas comprobables.'],
  bancos: ['Bancos', 'Custodia, pagos, tokenización y servicios bancarios documentados.'],
  exchanges: ['Exchanges', 'Mercados, comisiones, custodia, contraparte y disponibilidad por proveedor.'],
  wallets: ['Wallets', 'Custodia fría y caliente, firmware, compatibilidad, recuperación y avisos públicos.'],
  proyectos: ['Proyectos e infraestructura Web3', 'Dependencias de cadena, contratos, oráculos, almacenamiento, indexación y gobierno.'],
  mineria: ['Minería de Bitcoin', 'Hashprice, hashrate, dificultad, comisiones, pools, ASIC, rentabilidad y coste eléctrico internacional con cálculos reproducibles.'],
  hardware: ['Hardware', 'Equipos de minería, potencia, eficiencia y requisitos operativos desde especificaciones oficiales.'],
  fuentes: ['Fuentes', 'Registro público de conectores, documentación, periodicidad y alcance de cada observación.'],
  contacto: ['Contacto', 'Consultas, correcciones de datos y solicitudes sobre privacidad: contact@kaufmanadvisory.io.'],
  aviso: ['Aviso legal', 'Kaufman Advisory Group LLC publica información general sobre blockchain. No ejecuta operaciones ni presta asesoramiento personalizado.'],
  privacidad: ['Política de privacidad', 'La analítica opcional solo se carga después del consentimiento. Puedes ejercer tus derechos en contact@kaufmanadvisory.io.'],
  cookies: ['Política de cookies', 'Tecnologías utilizadas, proveedores, duración, consentimiento y forma de cambiar la elección.'],
  terminos: ['Términos de uso', 'Condiciones de acceso, límites informativos, fuentes y reglas de utilización de Kaufman.'],
  '404': ['Página no encontrada', 'La ruta solicitada no existe. Puedes volver al mapa principal de inteligencia blockchain de Kaufman.'],
  retirado: ['Servicio retirado', 'Esta ruta ya no forma parte de Kaufman. La plataforma actual está disponible desde la portada.']
};

const NAV = [
  ['/mercados/', 'Mercados'],
  ['/regulacion/', 'Regulación'],
  ['/tokenizacion/', 'Tokenización'],
  ['/mineria/', 'Minería'],
  ['/fiscal/', 'Fiscal']
];

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const fallback = (page) => {
  const [title, description] = ROUTES[page] || ['Kaufman', 'Inteligencia blockchain conectada a fuentes públicas.'];
  const contact = page === 'contacto'
    ? '<p><a class="kf-source-contact" href="mailto:contact@kaufmanadvisory.io">contact@kaufmanadvisory.io</a></p>'
    : '';
  return `<div id="kaufman-app"><header class="kf-source-header"><a href="/" aria-label="Kaufman, inicio"><strong>KAUFMAN</strong><span>BLOCKCHAIN INTELLIGENCE</span></a></header><main class="kf-source-fallback" id="main-content"><p class="kf-source-kicker">KAUFMAN · FUENTE PÚBLICA</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p>${contact}<nav aria-label="Secciones principales">${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</nav><p class="kf-source-status">El contenido esencial permanece disponible sin JavaScript. Los datos automáticos y comparadores se activan cuando el navegador carga la aplicación.</p></main></div>`;
};

const listHtml = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listHtml(target));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(target);
  }
  return files;
};

const upsertMeta = (html, key, tag) => {
  const keyPattern = key instanceof RegExp ? new RegExp(key.source, key.flags.replaceAll('g', '')) : new RegExp(key, 'i');
  const existing = html.match(/<meta\b[^>]*>/gi)?.find((candidate) => keyPattern.test(candidate));
  if (existing) return html.replace(existing, tag);
  return html.replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1${tag}`);
};

const removeMeta = (html, key) => {
  const keyPattern = key instanceof RegExp ? new RegExp(key.source, key.flags.replaceAll('g', '')) : new RegExp(key, 'i');
  const existing = html.match(/<meta\b[^>]*>/gi)?.find((candidate) => keyPattern.test(candidate));
  return existing ? html.replace(existing, '') : html;
};

const repairMalformedMeta = (html) => html.replace(/<meta\s+(<meta\b[^>]*>)\s+content="[^"]*">/gi, '$1');

const hardenAppShell = (html, page) => {
  let result = repairMalformedMeta(html).replaceAll(/kaufman-v\d+/g, VERSION).replace(/<meta name="theme-color" content="[^"]+">/i, '<meta name="theme-color" content="#f8f5f0">');
  result = removeMeta(result, /http-equiv="Content-Security-Policy"/i);
  result = result.replace(/<link\s+rel="icon"[^>]*>/gi, '').replace(/<\/head>/i, `<link rel="icon" href="/favicon.svg?v=${VERSION}" type="image/svg+xml"></head>`);
  result = upsertMeta(result, /name="referrer"/i, '<meta name="referrer" content="strict-origin-when-cross-origin">');
  result = upsertMeta(result, /name="color-scheme"/i, '<meta name="color-scheme" content="light">');
  result = upsertMeta(result, /name="application-name"/i, '<meta name="application-name" content="Kaufman">');
  const robots = ['404', 'retirado'].includes(page) ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1';
  result = upsertMeta(result, /name="robots"/i, `<meta name="robots" content="${robots}">`);
  result = result.replace(/<script\s+src="\/assets\/bank-intelligence\.js[^>]*><\/script>/gi, '');
  result = result.replace(/(<script\s+src="(?:\/)?assets\/kaufman-app\.js[^>]*><\/script>)/i, `<script src="/assets/bank-intelligence.js?v=${VERSION}" defer></script>$1`);
  result = result.replace(/<div id="kaufman-app">[\s\S]*?<\/div>(?=<\/body>)/i, fallback(page));
  return result;
};

const hardenLegacy = (html) => {
  let result = repairMalformedMeta(html);
  result = upsertMeta(result, /name="robots"/i, '<meta name="robots" content="noindex,nofollow,noarchive">');
  result = upsertMeta(result, /name="referrer"/i, '<meta name="referrer" content="strict-origin-when-cross-origin">');
  return result;
};

const files = await listHtml(ROOT);
let shells = 0;
let legacy = 0;
for (const file of files) {
  if (file.endsWith(path.join('zohoverify', 'verifyforzoho.html'))) continue;
  const original = await fs.readFile(file, 'utf8');
  const page = original.match(/data-page="([^"]+)"/i)?.[1];
  const next = page ? hardenAppShell(original, page) : hardenLegacy(original);
  if (next !== original) await fs.writeFile(file, next, 'utf8');
  if (page) shells += 1; else legacy += 1;
}

const sitemapPath = path.join(ROOT, 'sitemap.xml');
const sitemap = (await fs.readFile(sitemapPath, 'utf8')).replaceAll(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod>2026-09-02</lastmod>');
await fs.writeFile(sitemapPath, sitemap, 'utf8');

console.log(JSON.stringify({ status: 'OK', app_shells: shells, legacy_noindex: legacy, version: VERSION }, null, 2));
