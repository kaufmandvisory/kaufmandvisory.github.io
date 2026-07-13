import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEthereumFeeSnapshot } from './auxiliary.js';

test('builds EIP-1559 gas tiers from chain observations', () => {
  const history = {
    baseFeePerGas: ['0x3b9aca00', '0x77359400'],
    reward: [
      ['0x5f5e100', '0xbebc200', '0x11e1a300'],
      ['0x5f5e100', '0x11e1a300', '0x1dcd6500']
    ],
    gasUsedRatio: [0.4, 0.8]
  };
  const block = { number: '0x10', timestamp: '0x6693b580' };
  const result = buildEthereumFeeSnapshot(history, block, '2026-07-13T10:00:00.000Z');
  assert.equal(result.base_fee_gwei, 2);
  assert.equal(result.tiers.safe.priority_fee_gwei, 0.1);
  assert.equal(result.tiers.standard.priority_fee_gwei, 0.25);
  assert.equal(result.tiers.fast.priority_fee_gwei, 0.4);
  assert.equal(result.tiers.standard.max_fee_gwei, 2.25);
  assert.equal(result.gas_used_ratio, 0.6);
  assert.equal(result.block_number, 16);
  assert.equal(result.verification_status, 'CHAIN_OBSERVED');
});

test('rejects incomplete fee history rather than estimating silently', () => {
  assert.throws(() => buildEthereumFeeSnapshot({}, {}), /Incomplete/);
});
