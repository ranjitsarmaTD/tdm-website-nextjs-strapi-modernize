/**
 * Typed REST client for reading Strapi content — the seam every apps/web
 * Server Component reads through (overview §4: WEB --read via--> SHARED
 * --REST + read-only token--> CMS). Written to satisfy EP-02-S1 (`global`)
 * and the case-study read path referenced by EP-24-S1's generateMetadata
 * wiring; not every content type in the ER model (requirements §5) has a
 * getter here yet — this is a lean, representative slice of the client, not
 * the full surface.
 */

export interface Link {
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface GlobalData {
  siteName: string;
  usAddress: string;
  indiaAddress: string;
  email: string;
  phone: string;
  phoneClean: string;
  copyrightYear: number;
  footerLinks: Link[];
  social: SocialLink[];
}

export interface Seo {
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
}

export interface CaseStudy {
  title: string;
  slug: string;
  summary: string;
  client: string;
  industry: string;
  body: string;
  image?: string;
  order: number;
  featured: boolean;
  seo?: Seo;
}

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const STRAPI_READ_TOKEN = process.env.STRAPI_READ_TOKEN;

function authHeaders(): HeadersInit {
  return STRAPI_READ_TOKEN ? { Authorization: `Bearer ${STRAPI_READ_TOKEN}` } : {};
}

async function strapiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error(`Strapi GET ${path} failed with ${res.status}`);
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

/** EP-02-S1: the single `global` entry that feeds SiteHeader/SiteFooter. */
export async function getGlobal(): Promise<GlobalData> {
  return strapiGet<GlobalData>("/global?populate=deep");
}

/** Backs the /case-studies/<slug> route's generateMetadata (EP-24-S1). */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const results = await strapiGet<CaseStudy[]>(
    `/case-studies?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=seo`
  );
  return results?.[0] ?? null;
}
