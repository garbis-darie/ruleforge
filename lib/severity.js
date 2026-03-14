export const SEVERITY = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
  SEVERE: 'Severe',
};

/**
 * Default classification thresholds.
 * These can be overridden per-VASP via the vasp_config field in API requests.
 */
export const DEFAULT_CONFIG = {
  thresholds: {
    value_usd: { low: 10_000,  medium: 50_000,  high: 200_000 },
    score:     { low: 25,      medium: 50,       high: 75      },
  },
};

/**
 * Layer 2 — Alert Severity Matrix
 *
 * Classifies a scored exposure into Low / Medium / High / Severe using
 * deterministic rules ordered from most to least specific.
 *
 * Rule IDs follow the convention:
 *   D  = direct exposure  (hop_distance === 0)
 *   I  = indirect exposure
 *   IB = inbound direction
 *
 * @param {{ exposure_type: string, direction: string, risk_score_normalised: number, exposure_value_usd: number }} exposure
 * @param {object} config - Threshold config (defaults to DEFAULT_CONFIG)
 * @returns {{ severity: string, rule: string, confidence: string }}
 */
export function classifyAlert(exposure, config = DEFAULT_CONFIG) {
  const score    = exposure.normalisedScore ?? exposure.risk_score_normalised;
  const value    = exposure.exposure_value_usd ?? 0;
  const t        = config.thresholds;
  const isDirect = exposure.exposure_type === 'direct';
  const isInbound = exposure.direction === 'inbound';

  // D-IB-1: Direct + inbound + high score + high value → Severe
  if (isDirect && isInbound && score >= t.score.high && value >= t.value_usd.high)
    return { severity: SEVERITY.SEVERE, rule: 'D-IB-1', confidence: 'high' };

  // D-2: Direct + high score → High
  if (isDirect && score >= t.score.high)
    return { severity: SEVERITY.HIGH, rule: 'D-2', confidence: 'high' };

  // D-3: Direct + medium score → High (direct exposure is inherently riskier)
  if (isDirect && score >= t.score.medium)
    return { severity: SEVERITY.HIGH, rule: 'D-3', confidence: 'medium' };

  // D-4: Direct + low score + meaningful value → Medium
  if (isDirect && score >= t.score.low && value >= t.value_usd.medium)
    return { severity: SEVERITY.MEDIUM, rule: 'D-4', confidence: 'medium' };

  // I-1: Indirect + medium score + high value → High
  if (!isDirect && score >= t.score.medium && value >= t.value_usd.high)
    return { severity: SEVERITY.HIGH, rule: 'I-1', confidence: 'medium' };

  // I-2: Indirect + medium score → Medium
  if (!isDirect && score >= t.score.medium)
    return { severity: SEVERITY.MEDIUM, rule: 'I-2', confidence: 'low' };

  // I-3: Indirect + low score → Low
  if (!isDirect && score >= t.score.low)
    return { severity: SEVERITY.LOW, rule: 'I-3', confidence: 'low' };

  // DEFAULT: score below all thresholds
  return { severity: SEVERITY.LOW, rule: 'DEFAULT', confidence: 'low' };
}
