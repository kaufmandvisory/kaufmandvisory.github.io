import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const shells = [
  'index.html', 'mercados/index.html', 'regulacion/index.html', 'tokenizacion/index.html',
  'herramientas/index.html', 'fiscal/index.html', 'empresas/index.html', 'bancos/index.html',
  'exchanges/index.html', 'wallets/index.html', 'proyectos/index.html', 'mineria/index.html',
  'hardware/index.html', 'rentabilidades/index.html', 'riesgos/index.html', 'fichas/index.html',
  'fuentes/index.html', 'contacto/index.html', 'aviso-legal.html', 'privacidad.html',
  'politica-cookies.html', 'terminos.html', '404.html', 'checkout.html', 'intake.html'
];

const failures = [];
for (const relative of shells) {
  const html = await fs.readFile(path.join(ROOT, relative), 'utf8');
  const checks = {
    fallback: /class="kf-source-fallback"/.test(html),
    csp: /http-equiv="Content-Security-Policy"/.test(html),
    referrer: /name="referrer" content="strict-origin-when-cross-origin"/.test(html),
    robots: /name="robots"/.test(html),
    title: /<h1>[^<]{3,}<\/h1>/.test(html),
    current_assets: /kaufman-v29/.test(html),
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

if (failures.length) {
  console.error(JSON.stringify({ status: 'FAIL', failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'PASS', shells_checked: shells.length, raw_source_fallback: true, meta_csp: true }, null, 2));
