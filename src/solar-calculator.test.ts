import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSolarSpecs, MIN_PANELS, MAX_PANELS } from './solar-calculator.ts';

test('solar calculator clamps between MIN_PANELS and MAX_PANELS', () => {
  const under = calculateSolarSpecs(2);
  assert.equal(under.panelCount, MIN_PANELS);
  assert.equal(under.powerKwp, 3.3);

  const over = calculateSolarSpecs(50);
  assert.equal(over.panelCount, MAX_PANELS);
  assert.equal(over.powerKwp, 17.6);
});

test('solar calculator computes power, generation, and 7-year savings', () => {
  const standard = calculateSolarSpecs(16);
  assert.equal(standard.panelCount, 16);
  assert.equal(standard.powerKwp, 8.8);
  assert.equal(standard.monthlyGenerationKwh, 1100);
  assert.ok(standard.sevenYearSavingsBrl > 0);
  assert.equal(standard.complexityId, 'standard');
  assert.ok(standard.complexityTier.includes('Residencial Padrão'));
  assert.ok(standard.batteryRecommended.includes('13.5 kWh'));
});

test('solar calculator classifies tiers correctly', () => {
  const compact = calculateSolarSpecs(8);
  assert.equal(compact.complexityId, 'compact');

  const standard = calculateSolarSpecs(18);
  assert.equal(standard.complexityId, 'standard');

  const villa = calculateSolarSpecs(28);
  assert.equal(villa.complexityId, 'villa');
  assert.ok(villa.batteryRecommended.includes('27.0 kWh'));
});

test('solar calculator generates valid whatsapp URL with encoded specs', () => {
  const res = calculateSolarSpecs(20, '5511999999999');
  assert.ok(res.whatsappUrl.startsWith('https://wa.me/5511999999999?text='));
  assert.ok(res.whatsappUrl.includes('20%20placas'));
  assert.ok(res.whatsappUrl.includes('11%20kWp'));
});
