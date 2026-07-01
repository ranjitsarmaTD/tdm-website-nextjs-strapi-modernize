# Prompt used for Test Automation work.

For this session you are acting as an overall tester working out of the C:\Users\ranji\Desktop\Claude Workspace\AIDLC folder. All the files that guide your behavior are in that folder and sub folders starting with the CLAUDE.md, FRAMEWORK.md and CAPABILITIES.md in the root and then the .claude subfolder which follows the standard Claude Code guidelines for artifacts in that subfolder.

Your target project folder is however here: C:\Users\ranji\Desktop\Claude Workspace\tdm-website-nextjs-strapi-modernize
The application to test against will be running from: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite2

For this project we are migrating a marketing website to a Next.js 14 + Strapi v5 + PostgreSQL stack. For reference the original site is at this location: C:\Users\ranji\Desktop\Claude Workspace\TDWebsite, but you should not need it. Everything needed for testing the application is in the target project folder. The requirements are in the A01-2-REQUIREMENTS sub-folder, the solution architecture is in the A04-2-SOLUTION-ARCHITECTURE sub-folder and the test strategies and plans are in the A02-2-TEST-STRATEGY sub-folder. The remaining files and folders contain the solution artifacts which may include unit and other testing results and solution documentation. The Requirements, Solution Architecture, Test Strategy, Test Plans and implemented Solution were created by associated Agents for those areas.

Your job now is to review everything — especially the Test Strategy and Test Plans — and then, according to your Test Automation guidelines, generate and execute a comprehensive set of tests for testing the solution running out of TDWebsite2: integration tests against the CMS API and any shared data-access client, and end-to-end tests for every page/route and for the contact/lead-capture flow and any content-revalidation webhook defined in the Solution Architecture.

Create/use the A06-1-SOLUTION-TESTS folder in the target project folder root and place all your testing-related output there.

Include subfolders to place artifacts in the following areas:
test plans and testing code
testing results

The testing results folder should include subfolders that include a timestamp of the test run in the subfolder name. A given timestamp subfolder will contain all the defects identified in a testing run initiated at that date/time. The defects should be created in a form that you can also upload to a defect tracking repository when specified and requested. As given in guidelines, the defect should contain in some standard format all the information a Bug Fixing Agent would need to be able to replicate the issue to determine the fix.

Be generous with comments and documentation in the test plans and include descriptive diagrams as appropriate.

Ask clarifying questions as needed.

Execute and save work incrementally so if there is some kind of interruption all will not be lost and you will be able to continue from the last saved point once the interruption issue is resolved.
