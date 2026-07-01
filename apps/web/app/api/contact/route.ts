import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contact — EP-18-S1..S4.
 *
 * Re-validates the payload server-side (never trusting the client-side
 * checks from EP-18-S2 alone), enforces the honeypot, creates a Strapi
 * `contact-submission` record via the Public role's create-only permission
 * (EP-18-S3), then fires a best-effort Resend notification whose failure
 * must never affect the response already promised to the visitor
 * (EP-18-S4). Real bot protection beyond the honeypot (Cloudflare
 * Turnstile) is intentionally deferred — see EP-18-S5.
 */

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  honeypot?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(payload: ContactPayload): string | null {
  if (!payload.name?.trim()) return "name is required";
  if (!payload.email?.trim() || !EMAIL_RE.test(payload.email)) return "email is invalid";
  if (!payload.message?.trim()) return "message is required";
  return null;
}

export async function POST(request: NextRequest) {
  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // EP-18-S2/S3, honeypot scenario: respond success-shaped so the mechanism
  // isn't revealed to the bot, but perform no Strapi write.
  if (payload.honeypot) {
    console.warn("contact route: honeypot triggered, submission dropped");
    return NextResponse.json({ ok: true });
  }

  const validationError = validate(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const strapiUrl = process.env.STRAPI_URL ?? "http://localhost:1337";
  const created = await fetch(`${strapiUrl}/api/contact-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company, // target-side rename of legacy `subject`
        message: payload.message,
      },
    }),
  });

  if (!created.ok) {
    return NextResponse.json({ error: "failed to store submission" }, { status: 502 });
  }

  try {
    await notifyTeam(payload);
  } catch (err) {
    // EP-18-S4: logged, but the durable Strapi record is already written —
    // the visitor still gets a success response.
    console.error("contact route: Resend notification failed", err);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

async function notifyTeam(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // provisioned-but-unconfigured is a no-op, not an error

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      to: "contact@triedatum.com",
      subject: `New contact form submission from ${payload.name}`,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\nCompany: ${payload.company ?? ""}\nPhone: ${payload.phone ?? ""}\nMessage: ${payload.message}`,
    }),
  });
}
