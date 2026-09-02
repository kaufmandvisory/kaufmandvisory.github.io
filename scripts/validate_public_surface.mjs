import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VERSION = 'kaufman-v64';
const shells = [
  'index.html', 'mercados/index.html', 'regulacion/index.html', 'tokenizacion/index.html',
  'fiscal/index.html', 'empresas/index.html', 'bancos/index.html',
  'exchanges/index.html', 'wallets/index.html', 'proyectos/index.html', 'mineria/index.html',
  'hardware/index.html',
  'fuentes/index.html', 'contacto/index.html', 'aviso-legal.html', 'privacidad.html',
  'politica-cookies.html', 'terminos.html', '404.html', 'checkout.html', 'intake.html'
];

const failures = [];
for (const relative of shells) {
  const html = await fs.readFile(path.join(ROOT, relative), 'utf8');
  const checks = {
    fallback: /class="kf-source-fallback"/.test(html),
    csp_header_only: !/http-equiv="Content-Security-Policy"/.test(html),
    referrer: /name="referrer" content="strict-origin-when-cross-origin"/.test(html),
    robots: /name="robots"/.test(html),
    title: /<h1>[^<]{3,}<\/h1>/.test(html),
    current_assets: html.includes(VERSION),
    favicon: new RegExp(`<link rel="icon" href="\\/favicon\\.svg\\?v=${VERSION}" type="image\\/svg\\+xml">`).test(html),
    bank_intelligence: new RegExp(`<script src="\\/assets\\/bank-intelligence\\.js\\?v=${VERSION}" defer><\\/script>`).test(html),
    valid_meta_markup: !/<meta\s+<meta/i.test(html),
    no_leaked_meta_attributes: !/<\/head>\s*<body[^>]*>\s*content="/i.test(html)
  };
  for (const [check, passed] of Object.entries(checks)) if (!passed) failures.push(`${relative}: ${check}`);
}

const privacy = await fs.readFile(path.join(ROOT, 'privacidad.html'), 'utf8');
if (!/contact@kaufmanadvisory\.io/.test(privacy)) failures.push('privacidad.html: contacto');
const cookies = await fs.readFile(path.join(ROOT, 'politica-cookies.html'), 'utf8');
if (!/data-page="cookies"/.test(cookies)) failures.push('politica-cookies.html: ruta');
const robots = await fs.readFile(path.join(ROOT, 'robots.txt'), 'utf8');
for (const rule of ['/blog/', '/files/']) if (!robots.includes(`Disallow: ${rule}`)) failures.push(`robots.txt: ${rule}`);

const appScript = await fs.readFile(path.join(ROOT, 'assets/kaufman-app.js'), 'utf8');
const appStyles = await fs.readFile(path.join(ROOT, 'assets/kaufman.css'), 'utf8');
for (const marker of ['kf-mining-hero-frame', 'data-mining-hero-observed', 'ASIC · SHA-256', 'data-mining-country-expand']) {
  if (!appScript.includes(marker)) failures.push(`mineria: falta ${marker}`);
}
for (const rejectedCopy of ['Modela la operación', 'Resultado modelado', 'no una promesa', 'Escenario guardado']) {
  if (appScript.includes(rejectedCopy)) failures.push(`mineria: reaparece texto rechazado: ${rejectedCopy}`);
}
const miningHero = await fs.stat(path.join(ROOT, 'assets/images/mining-operations-hero-v1.jpg')).catch(() => null);
if (!miningHero || miningHero.size < 100_000) failures.push('mineria: imagen hero ausente o incompleta');
for (const marker of ['kf-fiscal-editorial', '/assets/images/fiscal-review-v1.jpg', 'Introduce los datos de tu operación.']) {
  if (!appScript.includes(marker)) failures.push(`fiscal: falta ${marker}`);
}
for (const marker of ['data-regulation-table', 'data-regulation-detail', 'data-regulation-comparison', 'data-regulation-expand', 'A quién afecta', 'Qué no cubre']) {
  if (!appScript.includes(marker)) failures.push(`regulacion: falta ${marker}`);
}
for (const rejectedRegulationPattern of ['Construyendo fichas regulatorias', 'Mapa de regímenes']) {
  if (appScript.includes(rejectedRegulationPattern)) failures.push(`regulacion: reaparece interfaz retirada: ${rejectedRegulationPattern}`);
}
if (!appScript.includes("['regulacion','contacto','aviso','privacidad','cookies','terminos','retirado']")) {
  failures.push('regulacion: el cierre comercial vuelve a estar habilitado');
}
for (const token of [
  '--kf-type-display:', '--kf-type-page-title:', '--kf-type-section-title:',
  '--kf-type-section-compact:', '--kf-type-component-title:', '--kf-type-page-deck:',
  '--kf-type-section-deck:', '--kf-type-body:', '--kf-type-meta:', '--kf-type-label:'
]) {
  if (!appStyles.includes(token)) failures.push(`tipografia: falta el token ${token}`);
}
for (const selector of ['.kf-reg-hero h1', '.kf-mining-page .kf-mining-hero-copy h1', '.kf-bank-page-head h1', '.kf-reg-section-head h2']) {
  if (!appStyles.includes(selector)) failures.push(`tipografia: falta el contrato para ${selector}`);
}
for (const retiredFiscalFeature of ['kf-fiscal-globe-section', 'data-fiscal-earth', 'Pausar rotación', 'NASA/GSFC']) {
  if (appScript.includes(retiredFiscalFeature) || appStyles.includes(retiredFiscalFeature)) failures.push(`fiscal: permanece el globo retirado: ${retiredFiscalFeature}`);
}
const fiscalPhoto = await fs.stat(path.join(ROOT, 'assets/images/fiscal-review-v1.jpg')).catch(() => null);
if (!fiscalPhoto || fiscalPhoto.size < 100_000) failures.push('fiscal: fotografía editorial ausente o incompleta');
for (const retiredPath of ['herramientas/index.html', 'rentabilidades/index.html']) {
  const present = await fs.stat(path.join(ROOT, retiredPath)).then(() => true).catch(() => false);
  if (present) failures.push(`${retiredPath}: la página retirada todavía existe`);
}
for (const retiredRoute of ['/herramientas/', '/rentabilidades/']) {
  if (appScript.includes(retiredRoute)) failures.push(`aplicación: conserva enlace a ${retiredRoute}`);
}

const faviconIco = await fs.readFile(path.join(ROOT, 'favicon.ico'));
const validIcoHeader = faviconIco.length > 22
  && faviconIco[0] === 0x00
  && faviconIco[1] === 0x00
  && faviconIco[2] === 0x01
  && faviconIco[3] === 0x00;
if (!validIcoHeader) failures.push('favicon.ico: archivo ICO ausente o inválido');

if (failures.length) {
  console.error(JSON.stringify({ status: 'FAIL', failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'PASS', shells_checked: shells.length, raw_source_fallback: true, csp_header_only: true, favicon_ico: true }, null, 2));
