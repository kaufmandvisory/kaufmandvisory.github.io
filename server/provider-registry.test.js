import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProviderRegistry, parseCsv } from './provider-registry.js';

test('parseCsv conserva comas y comillas dentro de un campo', () => {
  const rows = parseCsv('name,address\r\nExample,"Street 1, Madrid"\r\n');
  assert.deepEqual(rows, [{ name: 'Example', address: 'Street 1, Madrid' }]);
});

test('parseCsv elimina la marca BOM aunque llegue decodificada como Windows-1252', () => {
  const rows = parseCsv('ï»¿name,address\r\nExample,Madrid\r\n');
  assert.deepEqual(rows, [{ name: 'Example', address: 'Madrid' }]);
});

test('buildProviderRegistry normaliza servicios, jurisdicciones y fechas', () => {
  const casps = 'ae_competentAuthority,ae_homeMemberState,ae_lei_name,ae_lei,ae_lei_cou_code,ae_commercial_name,ae_address,ae_website,ae_website_platform,ac_authorisationNotificationDate,ac_authorisationEndDate,ac_serviceCode,ac_serviceCode_cou,ac_comments,ac_lastupdate\nCNMV,ES,Example Legal,123,ES,Example,"Madrid, España",https://example.com,,01/07/2026,,a. providing custody | c. exchange of crypto-assets for funds,ES|PT,,21/08/2026\n';
  const nonCompliant = 'ae_competentAuthority,ae_homeMemberState,ae_lei_name,ae_lei,ae_lei_cou_code,ae_commercial_name,ae_website,ae_infrigment,ae_reason,ae_decision_date,ae_comments,ae_lastupdate\nCNMV,ES,Bad Example,,,Bad,https://bad.example,Yes,Warning,02/07/2026,,03/07/2026\n';
  const registry = buildProviderRegistry({ caspsCsv: casps, nonCompliantCsv: nonCompliant, receivedAt: '2026-08-24T12:00:00.000Z' });
  assert.equal(registry.providers.length, 1);
  assert.deepEqual(registry.providers[0].service_codes, ['a', 'c']);
  assert.deepEqual(registry.providers[0].jurisdictions, ['ES', 'PT']);
  assert.equal(registry.providers[0].authorisation_date, '2026-07-01');
  assert.equal(registry.data_quality.records_covering_spain, 1);
  assert.equal(registry.non_compliant_entities[0].decision_date, '2026-07-02');
});

test('una autorización futura no se cuenta como activa', () => {
  const casps = 'ae_competentAuthority,ae_homeMemberState,ae_lei_name,ae_lei,ae_lei_cou_code,ae_commercial_name,ae_address,ae_website,ae_website_platform,ac_authorisationNotificationDate,ac_authorisationEndDate,ac_serviceCode,ac_serviceCode_cou,ac_comments,ac_lastupdate\nCNMV,ES,Future Legal,123,ES,Future,Madrid,https://future.example,,25/08/2026,,a. providing custody,ES,,21/08/2026\n';
  const registry = buildProviderRegistry({ caspsCsv: casps, nonCompliantCsv: '', receivedAt: '2026-08-24T12:00:00.000Z' });
  assert.equal(registry.data_quality.provider_records, 1);
  assert.equal(registry.data_quality.active_records, 0);
  assert.equal(registry.data_quality.records_covering_spain, 0);
});
