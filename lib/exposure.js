const HOP_WEIGHTS = [1.0, 0.50, 0.33, 0.20, 0.13, 0.08, 0.05];

/**
 * Layer 1 — Indirect Exposure Model
 * Applies Fibonacci-derived hop-distance decay to a raw vendor risk score.
 *
 * @param {number} rawScore   - Vendor-supplied risk score (0–100)
 * @param {number} hopDistance - Number of hops from the flagged counterparty (0 = direct)
 * @returns {{ normalisedScore: number, weight: number, exposureType: string, hopDistance: number }}
 */
export function applyHopDecay(rawScore, hopDistance) {
  if (typeof rawScore !== 'number' || rawScore < 0 || rawScore > 100) {
    throw new Error(`rawScore must be a number between 0 and 100. Got: ${rawScore}`);
  }
  if (typeof hopDistance !== 'number' || hopDistance < 0) {
    throw new Error(`hopDistance must be a non-negative integer. Got: ${hopDistance}`);
  }
  const weight = HOP_WEIGHTS[Math.min(hopDistance, HOP_WEIGHTS.length - 1)];
  const normalisedScore = Math.round(rawScore * weight * 10) / 10;
  const exposureType = hopDistance === 0 ? 'direct' : 'indirect';
  return { normalisedScore, weight, exposureType, hopDistance };
}

/**
 * Enriches an exposure object with normalised score, decay weight, and exposure type.
 *
 * @param {{ risk_score_raw: number, hop_distance: number }} exposure
 * @returns {object} enriched exposure with risk_score_normalised, decay_weight, exposure_type
 */
export function scoreExposure(exposure) {
  const { normalisedScore, weight, exposureType } = applyHopDecay(
    exposure.risk_score_raw,
    exposure.hop_distance
  );
  return {
    ...exposure,
    exposure_type: exposureType,
    risk_score_normalised: normalisedScore,
    decay_weight: weight,
  };
}

export { HOP_WEIGHTS };
