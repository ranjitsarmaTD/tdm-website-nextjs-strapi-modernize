import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/revalidate — EP-26-S1.
 *
 * Secret-gated endpoint the Strapi lifecycle hook (apps/cms/src/index.ts,
 * EP-26-S2) POSTs to on every editorial create/update/delete. Maps a
 * {contentType, slug} body to the Next.js path(s) that need invalidating —
 * an entry's own detail page plus any index/listing page that surfaces it —
 * and calls revalidatePath on each. The timed `revalidate: 3600` ISR window
 * declared on each content-backed route (EP-26-S3) is the always-on
 * fallback if this endpoint is ever unreachable; this route is a speed
 * optimization, not a correctness dependency.
 */

interface RevalidateBody {
  contentType?: string;
  slug?: string;
}

const PATH_BUILDERS: Record<string, (slug: string) => string[]> = {
  global: () => ["/", "/contact"],
  "case-study": (slug) => [`/case-studies/${slug}`, "/", "/case-studies"],
  "news-article": (slug) => [`/news/${slug}`, "/news"],
  service: (slug) => [`/services/${slug}`, "/services"],
  "team-member": () => ["/about"],
  partner: () => ["/partnership"],
  testimonial: () => ["/"],
};

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.STRAPI_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { contentType, slug } = body;
  const buildPaths = contentType ? PATH_BUILDERS[contentType] : undefined;
  if (!buildPaths) {
    return NextResponse.json(
      { error: `unrecognized contentType "${contentType}"` },
      { status: 400 }
    );
  }

  const paths = buildPaths(slug ?? "");
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}
