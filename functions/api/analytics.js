const ALLOWED_EVENTS = new Set([
  "analysis_started",
  "analysis_completed",
  "feedback_helpful",
  "feedback_not_helpful",
  "avoided_sending_money",
  "avoided_sharing_information",
  "verified_official_channel"
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanString(value, maxLength = 80) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;

  return cleaned.slice(0, maxLength);
}

export async function onRequestGet() {
  return json({
    ok: true,
    service: "ScamCall Shield Analytics"
  });
}

export async function onRequestPost(context) {
  try {
    const request = context.request;

    const contentType =
      request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return json(
        { ok: false, error: "json_required" },
        415
      );
    }

    const raw = await request.text();

    // Prevent unexpectedly large analytics payloads.
    if (raw.length > 8192) {
      return json(
        { ok: false, error: "payload_too_large" },
        413
      );
    }

    let body;

    try {
      body = JSON.parse(raw);
    } catch {
      return json(
        { ok: false, error: "invalid_json" },
        400
      );
    }

    // Safety guard:
    // ScamCall Shield analytics must never receive raw user content.
    const forbiddenKeys = [
      "message",
      "text",
      "raw_message",
      "raw_text",
      "content",
      "otp",
      "password",
      "phone_number",
      "email"
    ];

    for (const key of forbiddenKeys) {
      if (
        Object.prototype.hasOwnProperty.call(body, key)
      ) {
        return json(
          {
            ok: false,
            error: "raw_content_not_allowed"
          },
          400
        );
      }
    }

    const eventType =
      cleanString(body.event_type, 64);

    if (!ALLOWED_EVENTS.has(eventType)) {
      return json(
        { ok: false, error: "invalid_event" },
        400
      );
    }

    const analysisId =
      cleanString(body.analysis_id, 80);

    const anonymousId =
      cleanString(body.anonymous_id, 80);

    const inputType =
      cleanString(body.input_type, 30);

    const language =
      cleanString(body.language, 20);

    const riskLevel =
      cleanString(body.risk_level, 20);

    const scamType =
      cleanString(body.scam_type, 60);

    const feedbackValue =
      cleanString(body.feedback_value, 30);

    const outcome =
      cleanString(body.outcome, 60);

    let riskScore = null;

    if (
      body.risk_score !== null &&
      body.risk_score !== undefined
    ) {
      const n = Number(body.risk_score);

      if (Number.isFinite(n)) {
        riskScore = Math.max(
          0,
          Math.min(100, Math.round(n))
        );
      }
    }

    const transformerUsed =
      body.transformer_used ? 1 : 0;

    let transformerBoost =
      Number(body.transformer_boost);

    if (!Number.isFinite(transformerBoost)) {
      transformerBoost = 0;
    }

    transformerBoost = Math.max(
      0,
      Math.min(10, Math.round(transformerBoost))
    );

    const db = context.env.ANALYTICS_DB;

    if (!db) {
      return json(
        { ok: false, error: "database_not_configured" },
        500
      );
    }

    const result = await db
      .prepare(`
        INSERT INTO analytics_events (
          event_type,
          analysis_id,
          anonymous_id,
          input_type,
          language,
          risk_level,
          risk_score,
          scam_type,
          transformer_used,
          transformer_boost,
          feedback_value,
          outcome,
          source
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public_web')
      `)
      .bind(
        eventType,
        analysisId,
        anonymousId,
        inputType,
        language,
        riskLevel,
        riskScore,
        scamType,
        transformerUsed,
        transformerBoost,
        feedbackValue,
        outcome
      )
      .run();

    return json(
      {
        ok: true,
        id: result.meta?.last_row_id || null
      },
      201
    );

  } catch (error) {
    console.error(
      "[ScamCall Shield Analytics]",
      error
    );

    return json(
      { ok: false, error: "server_error" },
      500
    );
  }
}