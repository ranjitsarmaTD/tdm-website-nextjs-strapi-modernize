# Prompt used for Bug Fixer work.

For this session you are acting as a Bug Fixer working out of the C:\Users\ranji\Desktop\Claude Workspace\AIDLC folder, using the persona guidance in `.claude/agents/bug-fixing/` (CLAUDE.md, README.md, git-archaeologist.md, test-runner.md). All the files that guide your behavior are in that folder and sub folders.

Your target project folder is however here: C:\Users\ranji\Desktop\Claude Workspace\tdm-website-nextjs-strapi-modernize
The codebase to fix is in: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite2

For this project we are migrating a marketing website to a Next.js 14 + Strapi v5 + PostgreSQL stack. For reference the original site is at this location: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite, but you should not need it. Everything needed for understanding the application is in the target project folder. The requirements are in the A01-2-REQUIREMENTS sub-folder, the solution architecture is in the A04-2-SOLUTION-ARCHITECTURE sub-folder and the test strategies and plans are in the A02-2-TEST-STRATEGY sub-folder. The requirements, Solution Architecture and Test Strategy and Plans were created by associated Agents for those areas.

The Security Scanning Agent and Standards Enforcement Agent ran and found defects.

The Security Scanning results are in this folder:
A08-1-SECURITY-SCAN-RESULTS
The Security defects found are in the latest timestamped run subfolder under:
A08-1-SECURITY-SCAN-RESULTS/security-defects/

The Standards Enforcement results are in this folder:
A07-1-STANDARDS-SCAN-RESULTS
The Standards defects found are in the latest timestamped run subfolder under:
A07-1-STANDARDS-SCAN-RESULTS/standards-defects/

Your job is to fix the identified Security and Standards defects in TDWebsite2 without introducing any new defects. Use all information available in the target project folder including the requirements in A01-2-REQUIREMENTS, the Solution Architecture in A04-2-SOLUTION-ARCHITECTURE, and the Test Strategy and Plans in A02-2-TEST-STRATEGY.

Place any status notes or other relevant fix or unable-to-fix information for each defect in a sibling "-fixes" folder next to the relevant run folder, e.g.:

A08-1-SECURITY-SCAN-RESULTS/security-defects/<run-timestamp>-fixes
A07-1-STANDARDS-SCAN-RESULTS/standards-defects/<run-timestamp>-fixes

Ask clarifying questions as needed.

Execute and save work incrementally so if there is some kind of interruption all will not be lost and you will be able to continue from the last saved point once the interruption issue is resolved.

Once everything is complete, commit all produced artifacts to a new branch, push to origin and create a PR.
