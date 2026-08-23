# Kaufman · endurecimiento de dominio y correo

Estado comprobado: 23 de agosto de 2026.

Este documento no contiene credenciales. Separa cambios que pueden aplicarse sin interrumpir servicios de cambios que exigen inventario o acceso administrativo.

## DNS que debe aplicarse en Cloudflare

### IPv6 del apex

Crear cuatro registros `AAAA`, DNS only, nombre `@`, TTL automático:

- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

Son los valores publicados por GitHub Pages. No sustituir los cuatro registros `A` existentes.

### CAA

La web actual usa un certificado de Let's Encrypt. Antes de activar el proxy de Cloudflare, autorizar también las CA que Cloudflare puede usar:

- `CAA @ 0 issue "letsencrypt.org"`
- `CAA @ 0 issue "pki.goog"`
- `CAA @ 0 issue "sectigo.com"`
- `CAA @ 0 issue "ssl.com"`

No crear `issuewild` mientras no exista una necesidad real de certificados wildcard.

### DNSSEC

Activar DNSSEC en Cloudflare y publicar el DS generado en el registrador. No declarar el control como resuelto hasta que la consulta pública `DS kaufmanadvisory.io` responda y un validador externo confirme la cadena.

## Correo que exige control administrativo

1. En Zoho Mail Admin, crear un selector nuevo —por ejemplo `zmail2026`— con clave RSA de 2048 bits.
2. Publicar el TXT entregado por Zoho en `zmail2026._domainkey.kaufmanadvisory.io`.
3. Verificar y activar el selector nuevo en Zoho.
4. Confirmar que correo real sale firmado por el selector nuevo antes de retirar `zmail` de 1024 bits.
5. Inventariar los envíos de Amazon SES y comprobar SPF y DKIM alineados con `kaufmanadvisory.io`.
6. Solo después de revisar informes agregados DMARC, avanzar de `p=quarantine` a `p=reject; pct=100`. No se añade `ruf` por defecto: los informes forenses pueden contener información sensible y muchos receptores no los envían.

No convertir SPF de `~all` a `-all` hasta confirmar que Zoho y SES son los únicos emisores legítimos.

## Cabeceras

GitHub Pages ya entrega HSTS, pero no permite configurar todas las cabeceras por repositorio. La CSP canónica, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS se sirven en el dominio principal mediante una regla de transformación de Cloudflare. Los HTML no conservan una CSP en `<meta>` para evitar políticas simultáneas divergentes. `_headers` y `netlify.toml` mantienen la configuración equivalente para un despliegue alternativo en Netlify.
