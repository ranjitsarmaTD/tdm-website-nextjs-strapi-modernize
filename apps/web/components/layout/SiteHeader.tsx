"use client";

import { useEffect, useState } from "react";

/**
 * Desktop main navigation — EP-01-S1/S3/S4.
 *
 * The nav link set and the Case Studies dropdown are hard-coded (not
 * CMS-driven), matching the legacy site's own hard-coded markup (EP-01
 * out-of-scope note). `siteName`/logo text comes from the Strapi `global`
 * single type via the `global` prop, so the one CMS-backed field the header
 * needs is passed in rather than fetched here.
 */

export interface SiteHeaderProps {
  global: {
    siteName: string;
  };
  activePath?: string;
}

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Bootcamp", href: "/bootcamp" },
  { label: "Partnership", href: "/partnership" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

// EP-01-S3: shared verbatim between this dropdown and MobileMenu.tsx so the
// two surfaces can never list different case studies. `case8` is
// intentionally absent — a preserve-or-retire decision tracked separately
// (see requirements overview §3 item 6 and EP-21-S4), not an oversight.
export const CASE_STUDY_LINKS: NavLink[] = Array.from({ length: 9 }, (_, i) => ({
  label: `Case Study ${i + 1}`,
  href: `/case-studies/case${i + 1}`,
}));

// EP-01-S1 Scenario 3: the legacy Bootstrap desktop/mobile breakpoint.
const DESKTOP_BREAKPOINT_PX = 992;

// EP-01-S4: transparent-overlay header becomes opaque/sticky past this
// scroll threshold.
const STICKY_SCROLL_THRESHOLD_PX = 80;

export default function SiteHeader({ global, activePath }: SiteHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setIsSticky(window.scrollY > STICKY_SCROLL_THRESHOLD_PX);
        frame = 0;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={`th-header header-layout18 header-absolute${isSticky ? " sticky" : ""}`}
      data-desktop-breakpoint={DESKTOP_BREAKPOINT_PX}
    >
      <a href="/" className="site-logo">
        {global.siteName}
      </a>
      <nav className="main-menu" aria-label="Primary">
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.href} className={activePath === link.href ? "active" : undefined}>
              <a href={link.href}>{link.label}</a>
              {link.href === "/case-studies" && (
                <ul className="sub-menu">
                  {CASE_STUDY_LINKS.map((cs) => (
                    <li key={cs.href}>
                      <a href={cs.href}>{cs.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
