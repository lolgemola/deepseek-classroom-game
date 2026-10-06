# DeepSeek classroom game — current handoff

Working checkout: C:\github repo\deepseek-classroom-game. Public source: https://github.com/lolgemola/deepseek-classroom-game. The user approved a rule-driven adaptive simulation and explicitly excluded AI services and event generation. The user subsequently requested hosting here. The registered public Sites project is now published at https://deepseek-market-game.lukas727.chatgpt.site; publish subsequent game edits to that same project.

Current version is a 10–15 minute strategy simulation with fictional starting hubs, fixed release models, three connected decisions per round, persistent capabilities, nine collective-choice market conditions, financial result explanations and cash ranking. See README.md for setup and RULES.md for all rules.

Core files: app/Game.tsx, app/globals.css, app/api/game/route.ts, lib/simulation.ts. Version 2 stores simulation_rooms, founders and plans in new D1 tables; original version 1 tables remain intact. Apply drizzle/0001_daily_kang.sql once after the original migration. Old version 1 rooms and tokens are not reused by version 2. The name-first onboarding adds drizzle/0002_sturdy_invisible_woman.sql; existing configured founders retain ready status.

Use Node >=22.13; on Windows ARM use an x64 runtime. A per-user Node 22.22.0 x64 and npm installation is available at C:\Users\lukav\AppData\Local\Programs\node22-x64. PowerShell profiles select it, and scripts/run-framework.mjs reports old Node versions clearly.

Run npm test, npm run check:balance, npx tsc --noEmit and npm run build. With local development running, npm run test:api creates disposable rooms and checks 30 founders through four rounds, authorization, private plans, duplicate protection, missed plans and closure races.

All outcomes are calculated by server rules. Plan closure freezes submissions atomically and can resume interrupted resolution. Class behavior only affects the next published market, never secretly changes the current round. No AI keys, calls or generated assets are used.

The local database migration does not deploy production. Sites now hosts the Worker and D1 database. A rehearsal on two physical phones plus a presenter laptop remains necessary before class. The .openai/hosting.json retains the published Sites registration and logical DB binding, with no credentials. GitHub Pages cannot host the multiplayer backend.

Sites publishing on this Windows machine: run the native source workflow first. Local packaging fails because the bundled Bash packager receives a Windows path. After its verified source push, save a source-only version and deploy it with Sites' hosted build fallback. Preserve public access and project ID appgprj_6ac42638b1f88191aede06a4bf113374. GitHub origin is separate; push updates there too.
