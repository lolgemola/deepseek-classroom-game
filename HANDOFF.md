# DeepSeek classroom game — current handoff

Working checkout: C:\github repo\deepseek-classroom-game. Public source: https://github.com/lolgemola/deepseek-classroom-game. The user approved a rule-driven adaptive simulation and explicitly excluded AI services and event generation. The user subsequently requested hosting here. The registered public Sites project is now published at https://deepseek-market-game.lukas727.chatgpt.site; publish subsequent game edits to that same project.

Current version 4 closes the DeepSeek presentation: fictional starting ecosystems, open base model, licensing/partnerships/services plus price and investment, persistent capabilities, explicit adoption versus paid accounts, partner revenue sharing, service maturation, nine adaptive conditions, visual maps/results/profiles and presenter comparison. Existing rooms need no compatibility. No new migration is required for version 4; state lives in JSON snapshots. Sessions/drafts use v4 namespaces. See README.md for setup and RULES.md for all rules.

Core files: app/Game.tsx, app/CompanySetup.tsx, app/components/, app/globals.css, app/api/game/route.ts, lib/simulation.ts. Version 2 stores simulation_rooms, founders and plans in new D1 tables; original version 1 tables remain intact. Apply drizzle/0001_daily_kang.sql once after the original migration. Old version 1 rooms and tokens are not reused by version 2. The name-first onboarding adds drizzle/0002_sturdy_invisible_woman.sql; existing configured founders retain ready status.

Use Node >=22.13; on Windows ARM use an x64 runtime. A per-user Node 22.22.0 x64 and npm installation is available at C:\Users\lukav\AppData\Local\Programs\node22-x64. PowerShell profiles select it, and scripts/run-framework.mjs reports old Node versions clearly.

Run npm test, npm run check:balance, npx tsc --noEmit and npm run build. With local development running, npm run test:api creates disposable rooms and checks 30 founders through four rounds, authorization, private plans, duplicate protection, missed plans and closure races.

All outcomes are calculated by server rules. Plan closure freezes submissions atomically and can resume interrupted resolution. Class behavior only affects the next published market, never secretly changes the current round. No AI keys, calls or generated assets are used.

The local database migration does not deploy production. Sites now hosts the Worker and D1 database. A rehearsal on two physical phones plus a presenter laptop remains necessary before class. The .openai/hosting.json retains the published Sites registration and logical DB binding, with no credentials. GitHub Pages cannot host the multiplayer backend.

Sites publishing on this Windows machine: run the native source workflow first. Local packaging fails because the bundled Bash packager receives a Windows path. After its verified source push, save a source-only version and deploy it with Sites' hosted build fallback. Preserve public access and project ID appgprj_6ac42638b1f88191aede06a4bf113374. GitHub origin is separate; push updates there too.

## Visual refresh
Apple-inspired light theme with system typography, white cards, blue actions and responsive layouts. Planning keeps the three decisions and trade-offs visible; company maps, cash reconciliation and intermediate presenter comparisons expand on demand. Removed optional rationale entry, repeated rules, duplicate result metrics and planning leaderboards. Economics unchanged. Validated desktop and 390 x 844 phone layout, local join/setup/lock/result flow, TypeScript and production build.


## Presenter and founder views
QR joins go straight to the company name. Founder phones show compact planning resources, three decisions, locked-plan waiting and a cash-change takeaway with expandable detailed results. Shared market previews, class choices, leaderboards and discussion stay on the presenter screen. The logo is static; leave actions are guarded and hidden throughout active rounds, including transient error screens. Leave returns in the lobby and after final results; invalid or obsolete room recovery remains available. Refresh preserves session access. Game economics unchanged.


## Split investment and timing
Research, reliability and ecosystem sliders allocate integer cash totaling at most 24. Unspent budget stays as cash. Weighted capability gains, proportional ecosystem trust support and budget-share adaptive triggers are server-authoritative. Paid path and pricing remain single choices. The presenter reads conditions before opening a 90-second manual timer. Version 4 requires fresh rooms; no new database migration.

## Readability pass
Player planning uses distinct revenue, pricing, investment and confirmation cards. Revenue and ecosystem choices show concise benefits/trade-offs; full explanations and the business map expand on demand. Slider descriptions, pricing mechanics and financial details are collapsed. Review shows the summary rather than disabled decision controls. Phone and desktop layout, expanded help and review/back persistence verified. Economics and 90-second timing unchanged.

