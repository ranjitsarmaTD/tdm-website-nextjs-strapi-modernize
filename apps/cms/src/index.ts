/**
 * Strapi bootstrap — EP-26-S2.
 *
 * Registers a lifecycle subscription covering every editorial content type
 * (`global`, `case-study`, `news-article`, `service`, `team-member`,
 * `partner`, `testimonial`). On afterCreate/afterUpdate/afterDelete it
 * best-effort POSTs to apps/web's `/api/revalidate` (EP-26-S1) so the
 * affected route refreshes immediately instead of waiting for the timed ISR
 * fallback (EP-26-S3). `contact-submission` is deliberately excluded — it
 * has no rendered page to revalidate and no publish lifecycle event
 * (EP-26 out-of-scope note). A failed webhook call is logged and swallowed;
 * it never blocks or fails the underlying Strapi write.
 */

interface LifecycleEvent {
  model: { uid: string };
  action: string;
  result?: { slug?: string };
}

interface StrapiLike {
  db: {
    lifecycles: {
      subscribe: (handler: (event: LifecycleEvent) => void) => void;
    };
  };
}

const EDITORIAL_UIDS = [
  "api::global.global",
  "api::case-study.case-study",
  "api::news-article.news-article",
  "api::service.service",
  "api::team-member.team-member",
  "api::partner.partner",
  "api::testimonial.testimonial",
];

const LIFECYCLE_ACTIONS = ["afterCreate", "afterUpdate", "afterDelete"];

function contentTypeFromUid(uid: string): string {
  // "api::case-study.case-study" -> "case-study"
  return uid.split(".")[1] ?? uid;
}

async function notifyRevalidate(uid: string, slug: string | undefined): Promise<void> {
  const secret = process.env.STRAPI_REVALIDATE_SECRET;
  if (!secret) return; // provisioned-but-unconfigured is a no-op, not an error

  const webUrl = process.env.NEXT_WEB_URL ?? "http://localhost:3000";
  try {
    await fetch(`${webUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ contentType: contentTypeFromUid(uid), slug }),
    });
  } catch (err) {
    // Best-effort: the Strapi write already succeeded by the time this
    // fires. The timed ISR fallback (EP-26-S3) covers the rest.
    console.warn(`revalidate webhook failed for ${uid}:`, err);
  }
}

export default {
  register() {},

  bootstrap({ strapi }: { strapi: StrapiLike }) {
    strapi.db.lifecycles.subscribe((event: LifecycleEvent) => {
      const { model, action, result } = event;
      if (!EDITORIAL_UIDS.includes(model.uid)) return;
      if (!LIFECYCLE_ACTIONS.includes(action)) return;

      void notifyRevalidate(model.uid, result?.slug);
    });
  },
};
