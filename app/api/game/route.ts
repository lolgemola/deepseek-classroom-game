import { database } from "@/lib/raw-db";
import {
  RULES_VERSION,
  investmentAllocation,
  canAfford,
  closeRound,
  initialCompany,
  initialMarket,
  isPlan,
  isSetup,
  rankCompanies,
  rounds,
  type Snapshot,
  type Plan,
  type Phase,
  type Hub,
  type GameView,
} from "@/lib/simulation";

type Room = {
  code: string;
  host: string;
  phase: Phase;
  round: number;
  version: number;
  rules_version: number;
  snapshot: string;
};
type Founder = {
  id: string;
  room: string;
  name: string;
  token: string;
  hub: Hub;
  release: string;
  ready: number;
};
type StoredPlan = { player: string; round: number; plan: string };
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
const fail = (message: string, status = 400) =>
  json({ error: message }, status);
const codeOf = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";
const secretOf = (value: unknown) => (typeof value === "string" ? value : "");

async function load(code: string) {
  const db = database();
  const room = await db
    .prepare("SELECT * FROM simulation_rooms WHERE code=?")
    .bind(code)
    .first<Room>();
  if (!room) return null;
  if (room.rules_version !== RULES_VERSION) throw new Error("OLD_ROOM");
  const founders = (
    await db
      .prepare("SELECT * FROM founders WHERE room=?")
      .bind(code)
      .all<Founder>()
  ).results;
  const snapshot: Snapshot = JSON.parse(room.snapshot);
  if (!snapshot.companies.length)
    snapshot.companies = founders.map(initialCompany);
  return { room, founders, snapshot };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const state = await load(codeOf(url.searchParams.get("room")));
    if (!state)
      return fail(
        "Room not found. Older game rooms cannot use these rules; ask for a new room.",
        404,
      );
    const { room, founders, snapshot } = state;
    const own = founders.find(
      (p) => p.token === url.searchParams.get("player"),
    );
    const current = (
      await database()
        .prepare("SELECT player,round,plan FROM plans WHERE room=? AND round=?")
        .bind(room.code, room.round)
        .all<StoredPlan>()
    ).results;
    const company = snapshot.companies.find((c) => c.id === own?.id);
    const active = snapshot.companies.filter((c) => !c.failed);
    const mine = current.find((p) => p.player === own?.id);
    const view: GameView = {
      room: room.code,
      phase: room.phase,
      round: room.round,
      version: room.version,
      rulesVersion: room.rules_version,
      host: url.searchParams.get("host") === room.host,
      players: rankCompanies(snapshot.companies).map((c) => ({
        ...c,
        history:
          room.phase === "results" || room.phase === "finished"
            ? c.history
            : [],
        setupComplete: Boolean(founders.find((f) => f.id === c.id)?.ready),
      })),
      me: company
        ? {
            ...company,
            plan: mine ? JSON.parse(mine.plan) : null,
            setupComplete: Boolean(own?.ready),
          }
        : null,
      ready: founders.filter((f) => f.ready).length,
      active: active.length,
      submitted: current.filter((p) => active.some((c) => c.id === p.player))
        .length,
      market: snapshot.markets[room.round],
      nextMarket:
        room.phase === "results" && room.round < 3
          ? snapshot.markets[room.round + 1]
          : null,
      mix:
        room.phase === "results" || room.phase === "finished"
          ? (snapshot.lastMix ?? null)
          : null,
    };
    return json(view);
  } catch (error) {
    if (error instanceof Error && error.message === "OLD_ROOM")
      return fail(
        "This room uses older rules. Return to join and ask the presenter to create a fresh game.",
        410,
      );
    console.error(error);
    return fail("Game connection unavailable. Please retry.", 503);
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const value = await req.json();
    if (!value || typeof value !== "object" || Array.isArray(value))
      return fail("Invalid request.");
    body = value as Record<string, unknown>;
  } catch {
    return fail("Invalid JSON.");
  }
  try {
    const db = database();
    if (body.action === "create") {
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = crypto
          .randomUUID()
          .replaceAll("-", "")
          .slice(0, 6)
          .toUpperCase();
        const host = crypto.randomUUID();
        const snapshot: Snapshot = {
          companies: [],
          markets: [initialMarket()],
        };
        const result = await db
          .prepare(
            "INSERT OR IGNORE INTO simulation_rooms (code,host,phase,round,version,rules_version,snapshot,created) VALUES (?,?,?,?,?,?,?,?)",
          )
          .bind(
            code,
            host,
            "lobby",
            0,
            0,
            RULES_VERSION,
            JSON.stringify(snapshot),
            Date.now(),
          )
          .run();
        if (result.meta.changes) return json({ room: code, host });
      }
      return fail("Could not create a room. Retry.", 503);
    }
    const state = await load(codeOf(body.room));
    if (!state)
      return fail("Room not found. Ask your presenter for a new room.", 404);
    const { room, founders, snapshot } = state;
    if (body.action === "join") {
      if (room.phase !== "lobby")
        return fail("This game has started. Join the next room.");
      const name =
        typeof body.name === "string" ? body.name.trim().slice(0, 24) : "";
      if (!name) return fail("Enter a company name.");
      const id = crypto.randomUUID(),
        token = crypto.randomUUID();
      const [result] = await db.batch([
        db
          .prepare(
            "INSERT INTO founders (id,room,name,token,hub,release,ready) SELECT ?,?,?,?,?,?,0 WHERE EXISTS (SELECT 1 FROM simulation_rooms WHERE code=? AND phase='lobby')",
          )
          .bind(id, room.code, name, token, "developer", "open", room.code),
        db
          .prepare(
            "UPDATE simulation_rooms SET version=version+1 WHERE code=? AND phase='lobby'",
          )
          .bind(room.code),
      ]);
      if (!result.meta.changes) return fail("The game just started.");
      return json({ player: token });
    }
    if (body.action === "setup") {
      const founder = founders.find((f) => f.token === secretOf(body.player));
      if (!founder) return fail("Founder access required.", 403);
      if (room.phase !== "lobby")
        return fail("The game has started. Your setup is now fixed.", 409);
      if (!isSetup(body.hub)) return fail("Choose a valid starting ecosystem.");
      const [result] = await db.batch([
        db
          .prepare(
            "UPDATE founders SET hub=?,release=?,ready=1 WHERE id=? AND room=? AND EXISTS (SELECT 1 FROM simulation_rooms WHERE code=? AND phase='lobby')",
          )
          .bind(body.hub, "open", founder.id, room.code, room.code),
        db
          .prepare(
            "UPDATE simulation_rooms SET version=version+1 WHERE code=? AND phase='lobby'",
          )
          .bind(room.code),
      ]);
      if (!result.meta.changes)
        return fail("The game just started. Your setup is fixed.", 409);
      return json({ ok: true });
    }
    if (body.action === "choose") {
      const founder = founders.find((f) => f.token === secretOf(body.player));
      if (!founder)
        return fail("Founder access required. Rejoin the room.", 403);
      if (room.phase !== "planning" || body.round !== room.round)
        return fail("Plans are closed for this round.");
      if (!isPlan(body.plan))
        return fail("Choose a valid monetization path, price and investment.");
      const company = snapshot.companies.find((c) => c.id === founder.id)!;
      if (company.failed) return fail("Your company is out of cash.");
      if (!canAfford(company, body.plan.investment, body.plan.path))
        return fail(
          "Keep 20 cash after investment and transition costs. Reduce spending or keep your existing path.",
        );
      const plan: Plan = {
        path: body.plan.path,
        price: body.plan.price,
        investment: investmentAllocation(body.plan.investment),
        ...(body.plan.rationale?.trim()
          ? { rationale: body.plan.rationale.trim() }
          : {}),
      };
      const result = await db
        .prepare(
          "INSERT OR IGNORE INTO plans (room,player,round,plan) SELECT ?,?,?,? WHERE EXISTS (SELECT 1 FROM simulation_rooms WHERE code=? AND phase='planning' AND round=?)",
        )
        .bind(
          room.code,
          founder.id,
          room.round,
          JSON.stringify(plan),
          room.code,
          room.round,
        )
        .run();
      if (!result.meta.changes)
        return fail("Your plan is locked, or the round has closed.", 409);
      return json({ ok: true });
    }
    if (body.action === "advance") {
      if (secretOf(body.host) !== room.host)
        return fail("Presenter access required.", 403);
      if (!Number.isInteger(body.version) || body.version !== room.version)
        return fail("The room changed. Refresh and retry.", 409);
      if (room.phase === "finished") return fail("This game is finished.");
      if (room.phase === "lobby" && !founders.length)
        return fail("Wait for at least one founder.");
      if (room.phase === "lobby" && founders.some((f) => !f.ready))
        return fail("Wait for every founder to confirm their company setup.");
      if (room.phase === "planning" || room.phase === "resolving") {
        let resolvingVersion = room.version;
        if (room.phase === "planning") {
          // This atomic write freezes submissions. Every insert before it is counted;
          // inserts after it fail their phase condition. Resolution can be retried.
          const frozen = await db
            .prepare(
              "UPDATE simulation_rooms SET phase='resolving',version=version+1 WHERE code=? AND version=? AND phase='planning'",
            )
            .bind(room.code, room.version)
            .run();
          if (!frozen.meta.changes)
            return fail("The room changed. Refresh and retry.", 409);
          resolvingVersion++;
        }
        const rows = (
          await db
            .prepare("SELECT player,plan FROM plans WHERE room=? AND round=?")
            .bind(room.code, room.round)
            .all<StoredPlan>()
        ).results;
        const submitted = Object.fromEntries(
          rows.map((p) => [p.player, JSON.parse(p.plan) as Plan]),
        );
        const closed = closeRound(snapshot, submitted, room.round);
        const saved = await db
          .prepare(
            "UPDATE simulation_rooms SET phase='results',snapshot=?,version=version+1 WHERE code=? AND version=? AND phase='resolving'",
          )
          .bind(JSON.stringify(closed), room.code, resolvingVersion)
          .run();
        if (!saved.meta.changes)
          return fail("Results were already published. Refresh.", 409);
        return json({ ok: true });
      }
      let nextPhase: Phase,
        nextRound = room.round;
      if (room.phase === "lobby") nextPhase = "briefing";
      else if (room.phase === "briefing") nextPhase = "planning";
      else if (room.phase === "results" && room.round === rounds.length - 1)
        nextPhase = "finished";
      else {
        nextPhase = "briefing";
        nextRound++;
      }
      const result = await db
        .prepare(
          "UPDATE simulation_rooms SET phase=?,round=?,version=version+1 WHERE code=? AND version=? AND phase=? AND (? != 'lobby' OR NOT EXISTS (SELECT 1 FROM founders WHERE room=simulation_rooms.code AND ready=0))",
        )
        .bind(
          nextPhase,
          nextRound,
          room.code,
          room.version,
          room.phase,
          room.phase,
        )
        .run();
      if (!result.meta.changes)
        return fail("The room changed. Refresh and retry.", 409);
      return json({ ok: true });
    }
    return fail("Unknown action.");
  } catch (error) {
    if (error instanceof Error && error.message === "OLD_ROOM")
      return fail(
        "This room uses older rules. Return to join and ask the presenter to create a fresh game.",
        410,
      );
    console.error(error);
    return fail(
      "Could not save. Retry; the presenter can resume interrupted results.",
      503,
    );
  }
}
