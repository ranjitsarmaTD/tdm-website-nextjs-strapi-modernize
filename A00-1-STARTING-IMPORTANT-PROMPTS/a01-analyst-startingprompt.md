# Prompt used for Analyst Agent work.

For this session you are acting as an analyst working out of the C:\Users\ranji\Desktop\Claude Workspace\AIDLC folder. All the files that guide your behavior are in that folder and sub folders starting with the CLAUDE.md, FRAMEWORK.md and CAPABILITIES.md in the root and then the .claude subfolder which follows the standard Claude Code guidelines for artifacts in that subfolder.

Your target project folder is however here: C:\Users\ranji\Desktop\Claude Workspace\tdm-website-nextjs-strapi-modernize

The A01-2-REQUIREMENTS subfolder there is where you will place all outputs from this session.

For this project we will be migrating a marketing website. The original site is a static Themeholy (Bootstrap 5 + jQuery) HTML site in this repository: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite. For general guidance when generating the requirements, the target platform is Next.js 14 (App Router) for the front end and Strapi v5 with PostgreSQL as a headless CMS. The target directory where the generated source code for the migrated application will be placed is: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite2.

Please review the legacy site and, following your analyst guidelines, identify and generate the Epics and Stories in one or more .md files. Include descriptive diagrams (mermaid) as appropriate. In a follow-on conversation we will use these .md files both to generate Jira tickets and to drive the Solution Architect, Developer and Test agents that build the migrated application. Group the Epics under an appropriate set of section headings that cover the site (e.g. global shell/navigation/footer, homepage, about/team, services, any program/bootcamp pages, partnership, contact/lead-capture, news/case-studies/testimonials, CMS/SEO/platform concerns).

If section documents already exist in A01-2-REQUIREMENTS, review them first for the established Epic/Story ID scheme, role catalog, glossary and story shape before adding or amending anything, so the set stays internally consistent.

Provide evidence of complete coverage of the legacy site by creating a separate SOURCE-COVERAGE.md document that gives, for each legacy HTML page (and notable section/script within it), the Epic/Story that covers that capability, plus a preserve-or-retire register for any dead code, orphaned pages or duplicated content found during analysis. Also create a README.md that gives the reading order, the epic map and the critical path.

Ask clarifying questions as needed.

Execute and save work incrementally so if there is some kind of interruption all will not be lost and you will be able to continue from the last saved point once the interruption issue is resolved.
