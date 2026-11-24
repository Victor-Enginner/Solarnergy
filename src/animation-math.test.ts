import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SINK,
  RISE,
  DEPTH,
  clamp,
  smooth,
  computeSinkY,
  computeRiseY,
  computeSurge,
  computeDip,
  computeK,
  computeK2,
  computeScrollSinkY,
  computeScrollSurge,
  computeScrollDip,
  computeScrollK,
  computeScrollK2,
} from './animation-math.ts';

test('clamp clamps values within range', () => {
  assert.equal(clamp(-0.5, 0, 1), 0);
  assert.equal(clamp(1.5, 0, 1), 1);
  assert.equal(clamp(0.4, 0, 1), 0.4);
});

test('smooth produces cubic Hermite interpolation between 0 and 1', () => {
  assert.equal(smooth(0, 100, 0), 0);
  assert.equal(smooth(0, 100, 100), 1);
  assert.equal(smooth(0, 100, 50), 0.5);
  assert.equal(smooth(0, 100, -10), 0);
  assert.equal(smooth(0, 100, 120), 1);
});

test('sink reaches exact DEPTH at SINK', () => {
  const yStart = computeSinkY(0);
  const yEnd = computeSinkY(SINK);
  assert.equal(yStart, 0);
  assert.equal(Math.round(yEnd * 1000) / 1000, DEPTH);
});

test('rise starts at DEPTH and returns to 0 at SINK + RISE', () => {
  const yPeak = computeRiseY(SINK);
  const yEnd = computeRiseY(SINK + RISE);
  assert.equal(Math.round(yPeak * 1000) / 1000, DEPTH);
  assert.equal(yEnd, 0);
});

test('fog surge is 0 at rest and peaks near SINK', () => {
  const sRest = computeSurge(0);
  const sMid = computeSurge(SINK);
  const sAfter = computeSurge(SINK + RISE);
  assert.equal(sRest, 0);
  assert.ok(sMid > 0.8, `Surge at sink point should be strong (got ${sMid})`);
  assert.equal(sAfter, 0);
});

test('dip starts at 0 and fades out before rise finishes', () => {
  const dipStart = computeDip(0);
  const dipPeak = computeDip(200);
  const dipEnd = computeDip(750);
  assert.equal(dipStart, 0);
  assert.ok(dipPeak > 0.9, `Dip around 200ms should be high (got ${dipPeak})`);
  assert.equal(dipEnd, 0);
});

test('color transitions move from 1 to 0 or 0 to 1', () => {
  // Night to morning (1 -> 0)
  assert.equal(computeK(0, 1, 0), 1);
  assert.equal(computeK(600, 1, 0), 0);
  assert.ok(computeK(320, 1, 0) < 1 && computeK(320, 1, 0) > 0);

  // K2 has delayed timing (340 to 760ms)
  assert.equal(computeK2(300, 1, 0), 1);
  assert.equal(computeK2(800, 1, 0), 0);
});

test('scroll motion curves start at 0, peak at mid-scroll, and return smoothly', () => {
  // At p = 0 (top / Morning)
  assert.equal(computeScrollSinkY(0), 0);
  assert.equal(computeScrollSurge(0), 0);
  assert.equal(computeScrollDip(0), 0);
  assert.equal(computeScrollK(0), 0);

  // At p = 0.5 (dense fog midpoint)
  assert.equal(Math.round(computeScrollSinkY(0.5) * 1000) / 1000, DEPTH);
  assert.ok(computeScrollSurge(0.5) > 0.95, `Surge at midpoint must be peak fog (got ${computeScrollSurge(0.5)})`);
  assert.ok(computeScrollDip(0.5) > 0.9, `Dip at midpoint must be active`);
  assert.ok(Math.abs(computeScrollK(0.5) - 0.5) < 1e-6);

  // At p = 1.0 (bottom / Night)
  assert.equal(computeScrollSinkY(1.0), 0);
  assert.equal(computeScrollSurge(1.0), 0);
  assert.equal(computeScrollDip(1.0), 0);
  assert.equal(computeScrollK(1.0), 1);
});

