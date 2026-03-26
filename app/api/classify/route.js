import { NextResponse } from 'next/server';
import { scoreExposure } from '../../../lib/exposure';
import { classifyAlert, DEFAULT_CONFIG } from '../../../lib/severity';

/**
 * POST /api/classify
 *
 * Two-layer VASP transaction classification pipeline:
 *   Layer 1 (exposure.js) — normalises raw vendor risk score by hop distance
 *   Layer 2 (severity.js) — classifies normalised exposure into Low/Medium/High/Severe
 *
 * Request body:
 * {
 *   "hop_distance":        number,   // 0 = direct, 1+ = indirect
 *   "direction":           string,   // "inbound" | "outbound"
 *   "exposure_value_usd":  number,   // transaction value in USD
 *   "risk_score_raw":      number,   // vendor-supplied score 0–100
 *   "vasp_config":         object    // optional — override default thresholds
 * }
 *
 * Response:
 * {
 *   "input":                 object,  // echoed request body
 *   "layer1_exposure":       object,  // normalised score + decay metadata
 *   "layer2_classification": object,  // severity, rule ID, confidence
 *   "result":                string   // final severity: Low | Medium | High | Severe
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['hop_distance', 'direction', 'exposure_value_usd', 'risk_score_raw'];
    const missing  = required.filter(k => body[k] === undefined);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Layer 1 — Indirect Exposure Model
    const scoredExposure = scoreExposure(body);

    // Layer 2 — Alert Severity Matrix (VASP-specific config optional)
    const config         = body.vasp_config ?? DEFAULT_CONFIG;
    const classification = classifyAlert(scoredExposure, config);

    return NextResponse.json({
      input: body,
      layer1_exposure: {
        exposure_type:         scoredExposure.exposure_type,
        risk_score_raw:        body.risk_score_raw,
        decay_weight:          scoredExposure.decay_weight,
        risk_score_normalised: scoredExposure.risk_score_normalised,
      },
      layer2_classification: classification,
      result: classification.severity,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
