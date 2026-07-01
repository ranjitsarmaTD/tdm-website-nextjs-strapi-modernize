/**
 * Global footer — EP-02-S1..S4.
 *
 * Fully data-driven from the Strapi `global` single type, replacing
 * footer_content.json + load-footer.js. The prop shape mirrors
 * packages/shared's `GlobalData` structurally (kept local/inline here so
 * this presentational component has no build-time dependency on the shared
 * package's resolution — the Server Component that fetches via
 * packages/shared and passes the result down is out of scope for this
 * skeleton).
 */

export interface FooterLink {
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface FooterSocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface SiteFooterGlobal {
  siteName: string;
  usAddress?: string;
  indiaAddress?: string;
  email?: string;
  phone?: string;
  copyrightYear?: number;
  footerLinks: FooterLink[];
  social: FooterSocialLink[];
}

export interface SiteFooterProps {
  global: SiteFooterGlobal;
}

// EP-02-S1: schema default when a `global` entry omits copyrightYear.
const DEFAULT_COPYRIGHT_YEAR = 2026;

export default function SiteFooter({ global }: SiteFooterProps) {
  const year = global.copyrightYear ?? DEFAULT_COPYRIGHT_YEAR;

  return (
    <footer className="footer-widget-area">
      <div className="footer-addresses">
        {/* EP-02-S2: literal \n line breaks preserved via pre-line, one
            address block per field, each independent of its sibling. */}
        {global.usAddress && (
          <address className="address-block" style={{ whiteSpace: "pre-line" }}>
            {global.usAddress}
          </address>
        )}
        {global.indiaAddress && (
          <address className="address-block" style={{ whiteSpace: "pre-line" }}>
            {global.indiaAddress}
          </address>
        )}
      </div>

      <nav aria-label="Footer">
        <ul className="footer-links">
          {global.footerLinks
            // EP-02-S3 Scenario 2: a link with an empty href is skipped
            // rather than rendering a broken <a href="">.
            .filter((link) => Boolean(link.url))
            .map((link) => (
              <li key={link.label}>
                <a
                  href={link.url}
                  target={link.isExternal ? "_blank" : undefined}
                  rel={link.isExternal ? "noreferrer" : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
        </ul>
      </nav>

      <ul className="footer-social">
        {global.social.map((s) => (
          <li key={s.platform}>
            <a href={s.url} aria-label={s.platform}>
              {s.platform}
            </a>
          </li>
        ))}
      </ul>

      {/* EP-02-S4: only year/site-name are editor-owned fields; the
          surrounding icon/homepage-link markup is template-owned to avoid
          the legacy raw-HTML-injection pattern. */}
      <p className="footer-copyright">
        <a href="/">{global.siteName}</a> &copy; {year}
      </p>
    </footer>
  );
}
