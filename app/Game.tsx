"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import CompanySetup from "./CompanySetup";
import StrategyCards from "./components/StrategyCards";
import CompanyMap from "./components/CompanyMap";
import RoundResults from "./components/RoundResults";
import CompanyProfile, { CompanyComparison } from "./components/CompanyProfile";
import {
  hubs,
  paths,
  prices,
  investments,
  rounds,
  ROUND_SECONDS,
  OPERATING_RESERVE,
  canAfford,
  transitionCost,
  fallbackPlan,
  isPlan,
  type GameView,
  type Plan,
  type Market,
  type Company,
  type Mix,
} from "@/lib/simulation";

type Session = { room: string; host?: string; player?: string };
const cash = (n: number) => n.toFixed(1).replace(/\.0$/, "");
const label = (items: readonly { id: string; title: string }[], id: string) =>
  items.find((x) => x.id === id)?.title ?? id;
const SESSION_KEY = "deepseek-session-v3";
const defaultPlan: Plan = {
  path: "services",
  price: "standard",
  investment: "save",
};

function Rules() {
  return (
    <details className="rules">
      <summary>Game rules & market mechanics</summary>
      <p>
        Four rounds, three decisions: monetization path, price and investment.
        Your base model stays open. Everyone starts with 150 fictional cash, 20
        open-model adopters and no paying accounts.
      </p>
      <p>
        Licensing sells a new premium package. Partnerships expand reach and
        capacity but share revenue and create dependence. Services sell hosting,
        tools and support; conversion improves with ecosystem strength and time.
      </p>
      <p>
        Investments cost 24, with diminishing capability gains near 10.
        Switching paths costs 12, reduces new acquisition and existing-account
        retention by 20% for that round, and restarts path tenure. Keep 20 cash
        after these costs. Capabilities persist.
      </p>
      <p>
        Community adopters are not automatically paying accounts. Enterprise
        accounts use three capacity units. Delivery failures, premium offers
        without sufficient capabilities, and restrictive premium licensing terms
        can reduce community trust. Ecosystem investment supports trust.
      </p>
      <p>
        Class decisions change the next market, announced before you decide.
        Highest ending cash among solvent companies wins; cash ties share rank.
        Bankruptcy is permanent. Missed plans repeat path and price without
        investment; first-round fallback is standard-price services. The
        75-second timer is a manual guide.
      </p>
      <p>
        This rule-driven teaching model compresses economic timing. A cash
        winner after four rounds is not proof of the best long-term strategy. No
        AI or random events.
      </p>
    </details>
  );
}
function MarketBrief({
  market,
  preview = false,
  compact = false,
}: {
  market: Market;
  preview?: boolean;
  compact?: boolean;
}) {
  if (compact)
    return (
      <details className="market-review">
        <summary>
          Review market conditions ({market.signals.length || "starting market"}
          )
        </summary>
        <MarketBrief market={market} />
      </details>
    );
  return (
    <section className="panel market">
      <p className="eyebrow">
        {preview ? "Next round · Shaped by your class" : "Market conditions"}
      </p>
      <h2>{rounds[market.round].title}: the market you face</h2>
      <p className="lead">{rounds[market.round].briefing}</p>
      {market.signals.length ? (
        <div className="signals">
          {market.signals.slice(0, 3).map((s) => (
            <article key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.effect}</p>
              <span className="small">{s.cause}</span>
            </article>
          ))}
        </div>
      ) : (
        <p className="notice">
          A level starting market. Your first plans will shape the next round.
        </p>
      )}
      {market.signals.length > 3 && (
        <details>
          <summary>{market.signals.length - 3} more market conditions</summary>
          {market.signals.slice(3).map((s) => (
            <article key={s.id}>
              <h3>{s.title}</h3>
              <p>
                {s.cause} → {s.effect}
              </p>
            </article>
          ))}
        </details>
      )}
      <p className="small">
        These conditions are fixed for this round. Your current choices
        influence the next one.
      </p>
    </section>
  );
}
function Capabilities({ company }: { company: Company }) {
  return (
    <div className="capabilities">
      {[
        ["Quality", company.quality],
        ["Reliability", company.reliability],
        ["Ecosystem", company.ecosystem],
      ].map(([title, value]) => (
        <div key={String(title)}>
          <span>{title}</span>
          <strong>{value}/10</strong>
          <progress aria-label={String(title)} max={10} value={Number(value)} />
        </div>
      ))}
    </div>
  );
}
function PlanSummary({ plan }: { plan: Plan }) {
  return (
    <div className="plan-summary">
      <span>{label(paths, plan.path)}</span>
      <span>{label(prices, plan.price)} pricing</span>
      <span>{label(investments, plan.investment)}</span>
      {plan.rationale && <p>“{plan.rationale}”</p>}
    </div>
  );
}
function ClassMix({ mix }: { mix: Mix }) {
  return (
    <details className="panel class-mix">
      <summary>What the class chose ({mix.count} active companies)</summary>
      <div className="class-bars">
        {paths.map((p) => (
          <div key={p.id}>
            <span>{p.title}</span>
            <progress aria-label={p.title} max={mix.count} value={mix[p.id]} />
            <b>
              {mix[p.id]} · {Math.round((mix[p.id] / mix.count) * 100)}%
            </b>
          </div>
        ))}
      </div>
      <div className="mix-grid">
        <p>
          Pricing: accessible {mix.low} · standard{" "}
          {mix.count - mix.low - mix.premium} · premium {mix.premium}
        </p>
        <p>
          Investment: research {mix.research} · reliability {mix.reliability} ·
          ecosystem {mix.ecosystem} · keep cash {mix.save}
        </p>
      </div>
      <p className="small">
        {mix.missed} missed plans used carry-forward defaults.
      </p>
    </details>
  );
}
function ChoiceGroup({
  title,
  items,
  value,
  onChange,
  disabled,
  unaffordable,
}: {
  title: string;
  items: readonly {
    id: string;
    title: string;
    description: string;
    cost?: number;
  }[];
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
  unaffordable?: (id: string) => boolean;
}) {
  const selected = items.find((x) => x.id === value)!;
  return (
    <fieldset className="choice-group">
      <legend>{title}</legend>
      <div className={"choice-buttons " + (items.length === 4 ? "four" : "")}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={value === item.id}
            className={value === item.id ? "selected" : ""}
            disabled={disabled || unaffordable?.(item.id)}
            onClick={() => onChange(item.id)}
          >
            {item.title}
            {item.cost !== undefined && (
              <small>{item.cost ? `${item.cost} cash` : "0 cash"}</small>
            )}
          </button>
        ))}
      </div>
      <p className="choice-description">{selected.description}</p>
    </fieldset>
  );
}

export default function Game() {
  const [session, setSession] = useState<Session | null>(null),
    [data, setData] = useState<GameView | null>(null);
  const [code, setCode] = useState(""),
    [name, setName] = useState(""),
    [linkedRoom, setLinkedRoom] = useState(false);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [qr, setQr] = useState(""),
    [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<Plan>(defaultPlan),
    [review, setReview] = useState(false);
  const [seconds, setSeconds] = useState(ROUND_SECONDS),
    [running, setRunning] = useState(false);
  const saving = useRef(false),
    currentSession = useRef(session);
  useEffect(() => {
    currentSession.current = session;
  }, [session]);
  const me = data?.me,
    phase = data?.phase;
  const isHost = data?.host ?? Boolean(session?.host);
  const draftKey =
    session?.player && data
      ? `deepseek-draft-v3:${session.room}:${session.player}:${data.round}`
      : "";

  useEffect(() => {
    const room =
      new URLSearchParams(location.search).get("room")?.toUpperCase() ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser-only state after server hydration.
    setCode(room);
    setLinkedRoom(Boolean(room));
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (
        saved &&
        typeof saved.room === "string" &&
        (saved.host || saved.player) &&
        (!room || saved.room === room)
      )
        setSession(saved);
    } catch {
      /* Storage can be unavailable; in-memory play still works. */
    }
  }, []);
  function keep(next: Session) {
    setSession(next);
    setData(null);
    setCopied(false);
    setReview(false);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      /* Keep session in memory. */
    }
  }
  async function refresh(s: Session) {
    const response = await fetch(
      "/api/game?" +
        new URLSearchParams({
          room: s.room,
          ...(s.host ? { host: s.host } : {}),
          ...(s.player ? { player: s.player } : {}),
        }),
      { cache: "no-store" },
    );
    const value = (await response.json()) as GameView & { error?: string };
    if (!response.ok) throw Error(value.error ?? "Could not load the room.");
    return value as GameView;
  }
  useEffect(() => {
    if (!session) return;
    let active = true,
      timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const value = await refresh(session!);
        if (active) {
          setData((old) => {
            if (old?.room === value.room && old.version > value.version)
              return old;
            if (
              old?.room === value.room &&
              old.round === value.round &&
              value.phase === "planning" &&
              old.me?.id === value.me?.id &&
              old.me?.plan &&
              value.me &&
              !value.me.plan
            )
              return { ...value, me: { ...value.me, plan: old.me.plan } };
            return value;
          });
          setError("");
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
      if (active) timer = setTimeout(poll, 2000);
    }
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [session]);
  useEffect(() => {
    if (!session?.host) return;
    let active = true;
    QRCode.toDataURL(location.origin + "/?room=" + session.room, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() =>
        setError("QR unavailable. Share the room code or join link."),
      );
    return () => {
      active = false;
    };
  }, [session]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronize the local guide timer with a server-controlled phase transition.
    setSeconds(ROUND_SECONDS);
    setRunning(phase === "planning" && isHost);
  }, [data?.round, phase, isHost]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!draftKey || !me) return;
    let next = fallbackPlan(me);
    try {
      const stored = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (isPlan(stored)) next = stored;
    } catch {
      /* Use carried plan. */
    }
    if (!canAfford(me, next.investment, next.path))
      next = { ...next, investment: "save" };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore a browser-stored draft only when its room/round identity changes.
    setDraft(next);
    setReview(false);
    // Polling must not overwrite a founder's in-progress draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, me?.id]);
  function edit(next: Plan) {
    setDraft(next);
    setReview(false);
    try {
      if (draftKey) localStorage.setItem(draftKey, JSON.stringify(next));
    } catch {
      /* Keep draft in memory. */
    }
  }
  async function act(action: string, extra: Record<string, unknown> = {}) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    const actingSession = session;
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...session, action, ...extra }),
      });
      const value = (await response.json()) as {
        error?: string;
        room: string;
        host: string;
        player: string;
      };
      if (!response.ok) throw Error(value.error ?? "Could not save.");
      if (action === "create") keep({ room: value.room, host: value.host });
      else if (action === "join")
        keep({ room: code.trim().toUpperCase(), player: value.player });
      else if (actingSession && currentSession.current === actingSession)
        setData(await refresh(actingSession));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  const canLeave =
    !session ||
    phase === "lobby" ||
    phase === "finished" ||
    (!data && /Room not found|Older game rooms/.test(error));
  function leave() {
    if (!canLeave) return;
    setSession(null);
    setData(null);
    setError("");
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }
  const joinLink =
    typeof window !== "undefined" && session
      ? location.origin + "/?room=" + session.room
      : "";
  const investmentCost = investments.find(
    (i) => i.id === draft.investment,
  )!.cost;
  const switchCost = me ? transitionCost(me, draft.path) : 0;
  const planCost = investmentCost + switchCost;
  const selectedPath = paths.find((p) => p.id === draft.path)!;
  const lastResult = me?.history.at(-1);
  const rank = (company: Company) =>
    company.failed
      ? "—"
      : 1 +
        (data?.players.filter((p) => !p.failed && p.cash > company.cash)
          .length ?? 0);

  return (
    <main className={isHost ? "presenter" : session ? "founder" : ""}>
      <header>
        <div className="brand">
          <span className="brandmark">D</span>
          <span>
            DeepSeek<span className="subbrand">The market game</span>
          </span>
        </div>
        <span className="badge">
          {isHost ? "Presenter" : session ? "Founder" : "Classroom game"}
        </span>
      </header>
      {error && (
        <div role="alert" className="error">
          {error}
          {canLeave && (
            <button onClick={leave}>Return to join / new game</button>
          )}
          <button
            onClick={() =>
              session
                ? refresh(session)
                    .then(setData)
                    .catch((e) => setError(e.message))
                : setError("")
            }
          >
            Retry
          </button>
        </div>
      )}
      {!session ? (
        <div className={"start " + (linkedRoom ? "direct-join" : "")}>
          {!linkedRoom && (
            <section className="intro">
              <p className="eyebrow">Your strategy. Everyone’s market.</p>
              <h1>
                Build a company.
                <br />
                <span>Shape the market.</span>
              </h1>
              <p className="lead">
                Your model is open. How will you fund its future? Choose
                licensing, partnerships or services. Your class shapes the
                market everyone faces next.
              </p>
              <p className="initial">4 rounds · 3 decisions · 10–15 minutes</p>
            </section>
          )}
          <section className="panel join">
            <p className="eyebrow">Welcome to the market</p>
            <h2>Name your company</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void act("join", { room: code.trim().toUpperCase(), name });
              }}
            >
              {linkedRoom ? (
                <p className="room-link">
                  Joining room <b>{code}</b>{" "}
                  <button
                    type="button"
                    className="textbutton"
                    onClick={() => setLinkedRoom(false)}
                  >
                    Change room
                  </button>
                </p>
              ) : (
                <>
                  <label htmlFor="room">Room code</label>
                  <input
                    id="room"
                    placeholder="e.g. A3F912"
                    value={code}
                    maxLength={6}
                    autoCapitalize="characters"
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </>
              )}
              <label htmlFor="company">Company name</label>
              <input
                id="company"
                placeholder="Your fictional company"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p className="small">
                Next, choose your starting ecosystem. In each round, decide how
                to earn revenue around an open model.
              </p>
              <button className="primary" disabled={busy}>
                {busy ? "Joining…" : "Join & set up company"}
              </button>
            </form>
            {!linkedRoom && (
              <>
                <div className="separator" />
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => void act("create")}
                >
                  Host a new game
                </button>
              </>
            )}
          </section>
        </div>
      ) : !data ? (
        <section className="panel connecting">
          <h2>Connecting to room {session.room}…</h2>
        </section>
      ) : (
        <>
          <div className="roomline">
            <span>
              Room <b>{session.room}</b>
            </span>
            <span>{isHost ? `${data.players.length} founders` : me?.name}</span>
            {canLeave && (
              <button disabled={busy} className="textbutton" onClick={leave}>
                Leave view
              </button>
            )}
          </div>
          {isHost && (
            <div className="progress">
              {rounds.map((r, i) => (
                <div
                  key={r.title}
                  className={
                    phase !== "lobby" &&
                    phase !== "finished" &&
                    i === data.round
                      ? "current"
                      : i < data.round || phase === "finished"
                        ? "complete"
                        : ""
                  }
                >
                  <span>0{i + 1}</span>
                  {r.title}
                </div>
              ))}
            </div>
          )}
          {me?.setupComplete &&
            phase === "planning" &&
            !me.plan &&
            !me.failed && (
              <section
                className="founder-status"
                aria-label="Your company resources"
              >
                <div className="cash-resource">
                  <span>Available cash</span>
                  <strong>{cash(me.cash)}</strong>
                </div>
                <Capabilities company={me} />
                <details>
                  <summary>More company metrics</summary>
                  <p className="small">
                    Open adoption {me.adoption} · Paying accounts{" "}
                    {me.developers + me.enterprise} · Community trust {me.trust}
                    /100
                  </p>
                </details>
              </section>
            )}
          {phase === "lobby" ? (
            <div className={"lobby " + (!isHost ? "founder-lobby" : "")}>
              {me && !me.setupComplete ? (
                <CompanySetup
                  key={me.id}
                  name={me.name}
                  storageKey={
                    "deepseek-setup-v3:" + session.room + ":" + session.player
                  }
                  busy={busy}
                  onConfirm={(hub) => void act("setup", { hub })}
                />
              ) : (
                <section className="panel lobbyintro">
                  <p className="eyebrow">Getting started</p>
                  <h1>
                    {isHost ? "Your founders are arriving." : "You're ready."}
                  </h1>
                  <p className="lead">
                    {isHost
                      ? "Founders join with a name, then explore starting ecosystems. Wait for everyone to confirm their setup."
                      : "Look at the main screen. Your presenter will start the game."}
                  </p>
                  {isHost && (
                    <div className="names">
                      {data.players.map((p) => (
                        <span key={p.id}>
                          {p.name} ·{" "}
                          {p.setupComplete
                            ? label(hubs, p.hub) + " · Ready"
                            : "Choosing setup…"}
                        </span>
                      ))}
                    </div>
                  )}
                  {isHost && (
                    <p role="status" className="notice">
                      {data.ready} / {data.players.length} founders ready
                    </p>
                  )}
                  {isHost && (
                    <button
                      className="primary"
                      disabled={
                        busy ||
                        !data.players.length ||
                        data.ready !== data.players.length
                      }
                      onClick={() =>
                        void act("advance", { version: data.version })
                      }
                    >
                      Introduce round 1
                    </button>
                  )}
                </section>
              )}
              {isHost && (
                <section className="panel qrpanel">
                  {qr && (
                    <img
                      src={qr}
                      alt="Scan to join this game"
                      width={280}
                      height={280}
                    />
                  )}
                  <h2>{session.room}</h2>
                  <p>Scan to join on your phone</p>
                  <button
                    className="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(joinLink);
                        setCopied(true);
                      } catch {
                        setError("Copy this join link: " + joinLink);
                      }
                    }}
                  >
                    {copied ? "Join link copied" : "Copy join link"}
                  </button>
                  <p className="small break">{joinLink}</p>
                </section>
              )}
            </div>
          ) : phase === "finished" ? (
            <section className="final">
              <p className="eyebrow">Market closed</p>
              <h1>
                {!isHost
                  ? "Your company results."
                  : data.players.every((p) => p.failed)
                    ? "A tough market for everyone."
                    : "The final company results."}
              </h1>
              {isHost && (
                <p className="lead">
                  Highest ending cash among solvent companies wins. Equal cash
                  shares the rank.
                </p>
              )}
              {isHost && (
                <div className="panel debrief">
                  <h2>
                    Which path would you recommend to DeepSeek—and what would it
                    have to sacrifice?
                  </h2>
                  <p>
                    Who captured the value? What funded continued research? Did
                    adoption become revenue? Would the cash winner remain
                    strongest over a longer horizon?
                  </p>
                </div>
              )}
              {me && (
                <p className="small">
                  Look at the main screen for the final discussion.
                </p>
              )}
              {me && <CompanyProfile company={me} />}
              {isHost && <CompanyComparison companies={data.players} />}
              <p className="small">
                Cash measures four-round financial performance. Trust, adoption,
                ongoing surplus and dependence reveal different strategic
                trade-offs.
              </p>
              {isHost && (
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => void act("create")}
                >
                  Create a fresh game
                </button>
              )}
            </section>
          ) : (
            <>
              <div className="roundheading">
                <div>
                  <p className="eyebrow">
                    Round {data.round + 1} / 4 ·{" "}
                    {phase === "briefing"
                      ? "Read the market"
                      : phase === "planning"
                        ? "Build your plan"
                        : "Results"}
                  </p>
                  <h1>{rounds[data.round].title}</h1>
                </div>
                {isHost && phase === "planning" && (
                  <div className="timer">
                    <strong>{seconds}s</strong>
                    <button onClick={() => setRunning(!running)}>
                      {running ? "Pause timer" : "Resume timer"}
                    </button>
                    <span>Guide only · close manually</span>
                  </div>
                )}
              </div>
              {(phase === "briefing" || phase === "planning") &&
                (isHost || !me?.plan) && (
                  <MarketBrief market={data.market} compact={!isHost} />
                )}
              {phase === "briefing" && (
                <div className="controlbar">
                  <p>
                    {isHost
                      ? "Read the bulletin, then give founders 75 seconds to plan."
                      : "Look at the main screen. Decisions will open shortly."}
                  </p>
                  {isHost && (
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() =>
                        void act("advance", { version: data.version })
                      }
                    >
                      Open decisions
                    </button>
                  )}
                </div>
              )}
              {phase === "planning" &&
                (me?.failed ? (
                  <section className="panel">
                    <h2>Out of cash</h2>
                    <p>
                      Follow the market and use your company history in the
                      final discussion.
                    </p>
                  </section>
                ) : me?.plan ? (
                  <section className="panel locked">
                    <p className="eyebrow">Plan locked</p>
                    <details>
                      <summary>Review submitted plan</summary>
                      <PlanSummary plan={me.plan} />
                    </details>
                    <p role="status">
                      Look at the main screen. Results are on their way.
                    </p>
                  </section>
                ) : me ? (
                  <section className="panel planning">
                    <h2>Your company plan</h2>
                    <StrategyCards
                      value={draft.path}
                      disabled={busy || review}
                      onChange={(path) => edit({ ...draft, path })}
                    />
                    <details className="business-map">
                      <summary>How your business works</summary>
                      <CompanyMap company={me} path={draft.path} />
                    </details>
                    <ChoiceGroup
                      title="2. What will you charge?"
                      items={prices}
                      value={draft.price}
                      disabled={busy || review}
                      onChange={(id) =>
                        edit({ ...draft, price: id as Plan["price"] })
                      }
                    />
                    <p className="small">
                      Paid offering: {selectedPath.offering}. Fee per account
                      unit:{" "}
                      {
                        selectedPath.rates[
                          draft.price === "low"
                            ? 0
                            : draft.price === "standard"
                              ? 1
                              : 2
                        ]
                      }
                      . Enterprises count as three units; open adopters are not
                      billed.
                    </p>
                    <ChoiceGroup
                      title="3. Where will you invest?"
                      items={investments}
                      value={draft.investment}
                      disabled={busy || review}
                      unaffordable={(id) =>
                        !canAfford(me, id as Plan["investment"], draft.path)
                      }
                      onChange={(id) =>
                        edit({ ...draft, investment: id as Plan["investment"] })
                      }
                    />
                    {!canAfford(me, draft.investment, draft.path) && (
                      <p role="status" className="notice">
                        This plan cannot leave the 20-cash reserve. Reduce
                        investment or keep your existing path.
                      </p>
                    )}
                    <div className="budget">
                      <span>
                        Investment <b>{investmentCost}</b>
                      </span>
                      <span>
                        Transition <b>{switchCost}</b>
                      </span>
                      <span>
                        Cash after decisions <b>{cash(me.cash - planCost)}</b>
                      </span>
                      <span>
                        Minimum reserve <b>{OPERATING_RESERVE}</b>
                      </span>
                    </div>
                    <p className="small">
                      Operations will cost{" "}
                      {hubs.find((h) => h.id === me.hub)!.operatingCost +
                        selectedPath.operation}{" "}
                      cash, plus service costs. Revenue and customer gains
                      depend on your plan and the market.
                    </p>
                    {review ? (
                      <div className="review">
                        <h3>Ready to commit?</h3>
                        <PlanSummary plan={draft} />
                        <p>
                          You sell: <b>{selectedPath.offering}</b>. Account fee:{" "}
                          <b>
                            {
                              selectedPath.rates[
                                draft.price === "low"
                                  ? 0
                                  : draft.price === "standard"
                                    ? 1
                                    : 2
                              ]
                            }
                          </b>
                          ; enterprise accounts count as three units.{" "}
                          {draft.path === "partnerships"
                            ? `Platform share: ${Math.round(Math.min(0.5, data.market.partnerShare + me.dependence * 0.001) * 100)}% of gross billings.`
                            : "Revenue comes directly to your company."}
                        </p>
                        {switchCost > 0 && (
                          <p className="notice">
                            Switching costs 12 cash; new acquisition and
                            existing-account retention are reduced 20% this
                            round. Capabilities persist, but path tenure
                            restarts.
                          </p>
                        )}
                        <p>Your plan locks when confirmed.</p>
                        <div className="actions">
                          <button
                            className="secondary"
                            disabled={busy}
                            onClick={() => setReview(false)}
                          >
                            Back to edit
                          </button>
                          <button
                            className="primary"
                            disabled={
                              busy ||
                              !canAfford(me, draft.investment, draft.path)
                            }
                            onClick={() =>
                              void act("choose", {
                                round: data.round,
                                plan: draft,
                              })
                            }
                          >
                            {busy ? "Saving…" : "Confirm & lock plan"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="primary"
                        disabled={
                          busy || !canAfford(me, draft.investment, draft.path)
                        }
                        onClick={() => setReview(true)}
                      >
                        Review my plan
                      </button>
                    )}
                  </section>
                ) : (
                  <section className="panel">
                    <h2>Founders are planning</h2>
                    <p>
                      They choose licensing, partnerships or services, a price
                      and an investment. Strong strategies connect all three to
                      the market conditions.
                    </p>
                    <p className="small">
                      Missing plans repeat the previous path and price, without
                      new investment.
                    </p>
                  </section>
                ))}
              {phase === "planning" && isHost && (
                <div className="controlbar">
                  <p>
                    <b>
                      {data.submitted} / {data.active}
                    </b>{" "}
                    active founders have confirmed
                  </p>
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => {
                      if (
                        data.submitted < data.active &&
                        !confirm(
                          "Close with missing plans? Previous path and price will continue with no new investment.",
                        )
                      )
                        return;
                      void act("advance", { version: data.version });
                    }}
                  >
                    Close round & show results
                  </button>
                </div>
              )}
              {phase === "resolving" && (
                <section className="panel">
                  <h2>Resolving the market…</h2>
                  <p>
                    Submissions are closed. Results are calculated from the same
                    published rules for everyone.
                  </p>
                  {isHost && (
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() =>
                        void act("advance", { version: data.version })
                      }
                    >
                      Resume results
                    </button>
                  )}
                </section>
              )}
              {phase === "results" && (
                <>
                  <section className="panel personal">
                    <h2>
                      {me
                        ? me.failed
                          ? "Your company is out of cash"
                          : "Your round result"
                        : "The round is closed"}
                    </h2>
                    {lastResult && lastResult.round === data.round ? (
                      <RoundResults
                        result={lastResult}
                        identity={session.room + ":" + me?.id}
                        compact={!isHost}
                      />
                    ) : (
                      <p>
                        {isHost
                          ? "Compare the companies below. Capabilities and previous customer relationships carry forward."
                          : "Look at the main screen for the class results. Your company summary will be available at the end."}
                      </p>
                    )}
                  </section>
                  {isHost && <CompanyComparison companies={data.players} />}
                  {isHost && data.nextMarket && (
                    <MarketBrief market={data.nextMarket} preview />
                  )}
                  {isHost && (
                    <div className="controlbar">
                      <p>
                        {data.round === 3
                          ? "Compare financial results and discuss the longer-term trade-offs."
                          : "Explain how this round’s choices changed the next market."}
                      </p>
                      {isHost && (
                        <button
                          className="primary"
                          disabled={busy}
                          onClick={() =>
                            void act("advance", { version: data.version })
                          }
                        >
                          {data.round === 3
                            ? "Show final results"
                            : "Introduce round " + (data.round + 2)}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {isHost && (phase === "results" || phase === "finished") && (
            <section className="panel leaderboard">
              <div className="boardheading">
                <h2>
                  {phase === "finished"
                    ? "Final leaderboard"
                    : "Company results"}
                </h2>
                <span className="small">
                  Ranked by cash · failed companies unranked
                </span>
              </div>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Company</th>
                      <th>Cash</th>
                      <th>Adoption</th>
                      <th>Paid accounts</th>
                      <th>Trust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.players.map((p) => (
                      <tr key={p.id} className={p.id === me?.id ? "you" : ""}>
                        <td>{rank(p)}</td>
                        <td>
                          {p.name}
                          {p.id === me?.id && (
                            <span className="youtag">YOU</span>
                          )}
                          {p.failed && (
                            <span className="outtag">OUT OF CASH</span>
                          )}
                        </td>
                        <td>
                          <strong>{cash(p.cash)}</strong>
                        </td>
                        <td>{p.adoption}</td>
                        <td>{p.developers + p.enterprise}</td>
                        <td>{p.trust}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {phase === "finished" && !!me?.history.length && (
            <details className="panel history-panel">
              <summary>Your company history</summary>
              {me.history.map((result) => (
                <section className="history" key={result.round}>
                  <h3>
                    Round {result.round + 1}: {rounds[result.round].title}
                  </h3>
                  <RoundResults result={result} />
                </section>
              ))}
            </details>
          )}
          {isHost && data.mix && <ClassMix mix={data.mix} />}
        </>
      )}
      {((!session && !linkedRoom) || isHost) && <Rules />}
      {(!session || isHost || phase === "finished") && (
        <footer>
          Classroom strategy simulation · Fictional financial units
        </footer>
      )}
    </main>
  );
}
