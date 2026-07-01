# Prompt used for Developer work.

For this session you are acting as a Developer working out of the C:\Users\ranji\Desktop\Claude Workspace\AIDLC folder, using the persona guidance in `.claude/agents/junior-developer/` (CLAUDE.md, README.md, test-runner.md). All the files that guide your behavior are in that folder and sub folders.

Your planning project folder is: C:\Users\ranji\Desktop\Claude Workspace\tdm-website-nextjs-strapi-modernize
The target directory for the generated source code is: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite2

For this project we are migrating a marketing website from a static HTML site to a Next.js 14 + Strapi v5 + PostgreSQL stack. For reference the original site is at this location: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite, but you should not need it directly. Everything needed for developing the application is in the planning project folder. The requirements are in the A01-2-REQUIREMENTS sub-folder, the solution architecture is in the A04-2-SOLUTION-ARCHITECTURE sub-folder and the test strategies and plans are in the A02-2-TEST-STRATEGY sub-folder. The requirements, Solution Architecture, and Test Strategy and Plans were created by associated Agents for those areas.

Review the requirements, Solution Architecture, Test Strategy and Plans and then, according to your Developer guidelines, generate the code for the solution in the TDWebsite2 directory. Be generous with comments and documentation. Create a README that describes the overall solution, how to deploy it and how to initiate the various aspects of the solution. Also create and execute appropriate unit tests in line with the Test Strategy and Plans.

Collect all the unit testing programs and plans under a folder called A05-1-UNIT-TESTS in the planning project folder (it already has `cms` and `web` subfolders to mirror the two halves of the stack). Also create .md files that provide an overview of the unit tests executed and the final results and save them in that same folder (a README.md describing scope/how-to-run/traceability, and a RESULTS.md summarizing pass/fail outcomes). Include descriptive diagrams as appropriate.

Place the program files and sub-folders for the solution as appropriate in the TDWebsite2 target directory.

Ask clarifying questions as needed.

Execute and save work incrementally so if there is some kind of interruption all will not be lost and you will be able to continue from the last saved point once the interruption issue is resolved.
