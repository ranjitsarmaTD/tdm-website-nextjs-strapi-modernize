# ADR-004 — Lift-and-shift CSS strategy

**Status:** Accepted

---

## Context

The legacy site is a Themeholy theme built on Bootstrap 5 with a hand-authored SASS source tree; every visual element (hero, cards, carousels, the Bootcamp page's own ~1,000-line inline design system) is styled through compiled, already-battle-tested CSS class names. The migration's stated bar for "done" is **parity**: a ported page/section must visually and functionally match the legacy page at desktop and mobile (glossary, `A01-2-REQUIREMENTS/00-overview-and-architecture.md` §3). Rewriting styling into a different system while simultaneously porting markup into React and content into a CMS multiplies the surface area for visual regression across all 23 legacy pages at once.

## Decision

`TDWebsite2` reuses the **legacy compiled Themeholy/Bootstrap 5 CSS class names verbatim** for v1 — this is a **lift-and-shift**, not a Tailwind or CSS-Modules rewrite (glossary; architecture principle P6, overview §2). Ported React components render the same class-name structure the legacy HTML used, so the existing compiled stylesheet(s) continue to apply without modification. `PAGE-BOOTCAMP` in particular — a structural outlier with its own large inline design system, distinct from the shared Themeholy chrome (glossary) — is treated as its own page template carrying its own styling forward intact, not force-fit into the generic page pattern.

## Consequences

- **Positive:** Visual parity is achieved by construction — reusing the exact class names that already render the intended design removes an entire class of "does this look right" regression risk that a styling-system rewrite would introduce simultaneously with every other change in this migration.
- **Positive:** The Front-End Engineer persona can focus port effort on markup structure → React components and static data → CMS content, without also re-deriving a design system from scratch — a meaningfully smaller surface area for a single migration pass.
- **Negative:** The codebase carries forward Bootstrap 5/Themeholy's class-name conventions and specificity model rather than adopting a more modern utility-first (Tailwind) or scoped (CSS Modules) approach — a stated, deliberate technical-debt trade, not an oversight; a future visual redesign would need its own dedicated initiative rather than incremental Tailwind adoption.
- **Negative:** Global CSS class names are inherently less locally scoped than CSS Modules — a new component styled without care could collide with an existing legacy class name; this risk is mitigated by the fact that the class-name vocabulary is fixed and already fully enumerated by what's being ported, not open-ended.
- **Neutral:** This decision is scoped explicitly to **v1** — the requirements don't preclude a future Tailwind/CSS-Modules rewrite once the CMS-driven content model and functional parity are stable; it is simply not bundled into this migration.

## Alternatives considered

| Alternative | Why not chosen |
|---|---|
| Rewrite styling in Tailwind CSS | Would require re-deriving every visual detail (spacing, breakpoints, animation timings) from the compiled legacy CSS by inspection, multiplying the chance of subtle visual drift across 23 pages migrated in one pass — directly works against the stated parity bar. |
| Rewrite styling in CSS Modules per component | Better scoping than global class names, but still requires the same from-scratch visual re-derivation risk as the Tailwind option, for a benefit (scoping) not called for by any Story in the requirements. |
| Keep legacy pages as static HTML, only add the CMS/API layer around them | Doesn't satisfy the stated target architecture (Next.js 14 App Router across every route, EP-01 through EP-22) — the requirements call for a full port to React/Next.js components, not a hybrid static+API patch. |
| A component-library adapter (e.g. MUI, Chakra) styling approach | Would replace the visual system entirely with a third-party design language, guaranteed to diverge from the legacy site's actual look — incompatible with the parity requirement by definition. |
