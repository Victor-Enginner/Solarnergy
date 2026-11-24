export const SINK = 240;
export const RISE = 820;
export const DEPTH = 0.27;

export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));

export const smooth = (a: number, b: number, x: number): number => {
  const norm = clamp((x - a) / (b - a));
  return norm * norm * (3 - 2 * norm);
};

export const computeSinkY = (d: number, depth = DEPTH, sinkDuration = SINK): number => {
  const x = d / sinkDuration;
  return x * x * (3 - 2 * x) * depth;
};

export const computeRiseY = (d: number, depth = DEPTH, sinkDuration = SINK, riseDuration = RISE): number => {
  const x = clamp((d - sinkDuration) / riseDuration);
  return Math.pow(1 - x, 3.4) * depth;
};

export const computeSurge = (d: number, sinkDuration = SINK, riseDuration = RISE): number => {
  return smooth(0, sinkDuration * 0.92, d) * (1 - smooth(sinkDuration + 70, sinkDuration + riseDuration * 0.92, d));
};

export const computeDip = (d: number): number => {
  return smooth(30, 190, d) * (1 - smooth(330, 720, d));
};

export const computeK = (d: number, from: number, target: number): number => {
  return from + (target - from) * smooth(120, 520, d);
};

export const computeK2 = (d: number, from: number, target: number): number => {
  return from + (target - from) * smooth(340, 760, d);
};

// Scroll-driven motion formulas
export const computeScrollSinkY = (p: number, depth = DEPTH): number => {
  const norm = clamp(p, 0, 1);
  if (norm < 0.5) {
    const x = norm / 0.5;
    return x * x * (3 - 2 * x) * depth;
  } else {
    const x = (norm - 0.5) / 0.5;
    const inv = 1 - x;
    return inv * inv * (3 - 2 * inv) * depth;
  }
};

export const computeScrollSurge = (p: number): number => {
  const norm = clamp(p, 0, 1);
  return smooth(0.08, 0.46, norm) * (1 - smooth(0.54, 0.92, norm));
};

export const computeScrollDip = (p: number): number => {
  const norm = clamp(p, 0, 1);
  return smooth(0.15, 0.45, norm) * (1 - smooth(0.55, 0.85, norm));
};

export const computeScrollK = (p: number): number => {
  return smooth(0.32, 0.68, clamp(p, 0, 1));
};

export const computeScrollK2 = (p: number): number => {
  return smooth(0.38, 0.75, clamp(p, 0, 1));
};

