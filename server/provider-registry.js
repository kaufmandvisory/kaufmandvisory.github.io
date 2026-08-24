const SERVICE_LABELS = Object.freeze({
  a: 'Custodia y administración de criptoactivos',
  b: 'Gestión de una plataforma de negociación',
  c: 'Canje de criptoactivos por fondos',
  d: 'Canje de criptoactivos por otros criptoactivos',
  e: 'Ejecución de órdenes por cuenta de clientes',
  f: 'Colocación de criptoactivos',
  g: 'Recepción y transmisión de órdenes',
  h: 'Asesoramiento sobre criptoactivos',
  i: 'Gestión de carteras de criptoactivos',
  j: 'Transferencia de criptoactivos por cuenta de clientes'
});

export const ESMA_PROVIDER_REGISTER_URL = 'https://www.esma.europa.eu/sites/default/files/2024-12/CASPS.csv';
export const ESMA_NON_COMPLIANT_URL = 'https://www.esma.europa.eu/sites/default/files/2024-12/NCASP.csv';
export const ESMA_MICA_PAGE_URL = 'https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica';

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const source = String(text || '').replace(/^(?:\uFEFF|ï»¿)/, '');
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ',') {
      row.push(field.trim());
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, '').trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else field += character;
  }
  row.push(field.replace(/\r$/, '').trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, String(values[index] || '').replace(/(?:\uFFFD|ï¿½)/g, '')])));
}

function isoDate(value) {
  const match = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

function serviceCodes(value) {
  return String(value || '').split('|').map((part) => part.trim().match(/^([a-j])\./i)?.[1]?.toLowerCase()).filter(Boolean);
}

function list(value) {
  return [...new Set(String(value || '').split('|').map((item) => item.trim()).filter(Boolean))];
}

function providerRecord(row) {
  const codes = serviceCodes(row.ac_serviceCode);
  return {
    authority: row.ae_competentAuthority,
    home_state: row.ae_homeMemberState,
    legal_name: row.ae_lei_name,
    commercial_name: row.ae_commercial_name || null,
    lei: row.ae_lei || null,
    address: row.ae_address || null,
    websites: list(`${row.ae_website || ''}|${row.ae_website_platform || ''}`),
    authorisation_date: isoDate(row.ac_authorisationNotificationDate),
    authorisation_end_date: isoDate(row.ac_authorisationEndDate),
    service_codes: codes,
    services: codes.map((code) => SERVICE_LABELS[code]),
    jurisdictions: list(row.ac_serviceCode_cou),
    record_updated_at: isoDate(row.ac_lastupdate),
    comments: row.ac_comments || null
  };
}

function nonCompliantRecord(row) {
  return {
    authority: row.ae_competentAuthority,
    reporting_state: row.ae_homeMemberState,
    legal_name: row.ae_lei_name || null,
    commercial_name: row.ae_commercial_name || null,
    lei: row.ae_lei || null,
    websites: list(row.ae_website),
    decision_date: isoDate(row.ae_decision_date),
    record_updated_at: isoDate(row.ae_lastupdate),
    infringement: row.ae_infrigment || null,
    reason: row.ae_reason || null,
    comments: row.ae_comments || null
  };
}

export function buildProviderRegistry({ caspsCsv, nonCompliantCsv, receivedAt = new Date().toISOString(), sourceLastModified = null }) {
  const providers = parseCsv(caspsCsv).map(providerRecord).filter((row) => row.legal_name && row.authority);
  const nonCompliant = parseCsv(nonCompliantCsv).map(nonCompliantRecord).filter((row) => row.legal_name || row.commercial_name || row.websites.length);
  const today = receivedAt.slice(0, 10);
  const active = providers.filter((row) => (!row.authorisation_date || row.authorisation_date <= today) && (!row.authorisation_end_date || row.authorisation_end_date >= today));
  return {
    schema_version: 'kaufman-provider-registry-v1',
    generated_at: receivedAt,
    source_last_modified: sourceLastModified,
    jurisdiction_scope: 'EEA',
    customer_view: 'ES',
    source: {
      authority: 'ESMA',
      register_url: ESMA_PROVIDER_REGISTER_URL,
      non_compliant_url: ESMA_NON_COMPLIANT_URL,
      context_url: ESMA_MICA_PAGE_URL,
      cadence: 'ESMA publica el registro provisional con frecuencia semanal; Kaufman lo consulta diariamente.'
    },
    service_dictionary: SERVICE_LABELS,
    providers,
    non_compliant_entities: nonCompliant,
    data_quality: {
      provider_records: providers.length,
      active_records: active.length,
      records_covering_spain: active.filter((row) => row.jurisdictions.includes('ES')).length,
      records_without_service_detail: providers.filter((row) => !row.service_codes.length).length,
      non_compliant_records: nonCompliant.length
    },
    output_contract: {
      permitted: ['Confirmar que un registro coincide con una entidad', 'Mostrar servicios y territorios declarados en el registro', 'Enlazar la evidencia oficial y su fecha'],
      prohibited: ['Afirmar que un proveedor es seguro', 'Recomendar contratar o invertir', 'Inferir que una marca corresponde a una entidad sin probarlo', 'Sustituir asesoramiento legal o fiscal'],
      unresolved_label: 'REQUIERE CONFIRMACIÓN PROFESIONAL'
    }
  };
}

export { SERVICE_LABELS };
