'use client';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import CompanySetup from './CompanySetup';
import {
  hubs, releases, focuses, prices, investments, rounds, STARTING_CASH, ROUND_SECONDS,
  INVESTMENT_COST, OPERATING_RESERVE, canAfford, fallbackPlan, isPlan,
  type GameView, type Plan, type Market, type Company, type RoundResult, type Mix,
} from '@/lib/simulation';

type Session = { room: string; host?: string; player?: string };
const cash = (n: number) => n.toFixed(1).replace(/\.0$/, '');
const label = (items: readonly { id: string; title: string }[], id: string) => items.find(x => x.id === id)?.title ?? id;
const SESSION_KEY = 'deepseek-session-v2';
const defaultPlan: Plan = { focus: 'balanced', price: 'standard', investment: 'save' };

function Rules() {
  return <details className="rules"><summary>Game rules & market mechanics</summary>
    <p>Four rounds, three decisions each: customer focus, price and investment. Start with {STARTING_CASH} fictional cash, 6 developer customers and 2 enterprise customers. Choose a starting hub and release model; both remain fixed.</p>
    <p>Investments cost {INVESTMENT_COST} and improve research, reliability or ecosystem strength with smaller gains near 10. Keep at least {OPERATING_RESERVE} cash after investment. Capabilities carry forward. Customers generate revenue; operations and service cost cash. Each enterprise uses 3 capacity units; developers use 1.</p>
    <p>Collective choices change the next round’s market. Conditions are published before you decide: low prices squeeze revenue, crowded segments reduce new acquisition, investment patterns change what customers value, and open releases affect adoption.</p>
    <p>Highest ending cash among solvent companies wins; equal cash shares a rank. Cash at zero or below means bankruptcy. Missed plans carry forward the last focus and price with no investment (round one: both markets, standard price). The presenter closes manually; the 75-second timer is a guide. No AI or random event generation is used.</p>
  </details>;
}
function MarketBrief({ market, preview = false, compact = false }: { market: Market; preview?: boolean; compact?: boolean }) {
  if (compact) return <details className="market-review"><summary>Review market conditions ({market.signals.length || 'starting market'})</summary><MarketBrief market={market} /></details>;
  return <section className="panel market"><p className="eyebrow">{preview ? 'NEXT ROUND · YOUR CLASS SHAPED THIS' : 'MARKET BULLETIN'}</p>
    <h2>{rounds[market.round].title}: the market you face</h2><p className="lead">{rounds[market.round].briefing}</p>
    {market.signals.length ? <div className="signals">{market.signals.map(s => <article key={s.id}><h3>{s.title}</h3><p>{s.effect}</p><span className="small">{s.cause}</span></article>)}</div> : <p className="notice">A level starting market. Your first plans will shape the next round.</p>}
    <p className="small">These conditions are fixed for this round. Your current choices influence the next one.</p>
  </section>;
}
function Capabilities({ company }: { company: Company }) {
  return <div className="capabilities">{[['Quality', company.quality], ['Reliability', company.reliability], ['Ecosystem', company.ecosystem]].map(([title, value]) => <div key={String(title)}><span>{title}</span><strong>{value}/10</strong><progress aria-label={String(title)} max={10} value={Number(value)} /></div>)}</div>;
}
function PlanSummary({ plan }: { plan: Plan }) {
  return <div className="plan-summary"><span>{label(focuses, plan.focus)}</span><span>{label(prices, plan.price)} pricing</span><span>{label(investments, plan.investment)}</span>{plan.rationale && <p>“{plan.rationale}”</p>}</div>;
}
function Result({ result }: { result: RoundResult }) {
  const rows: [string, number][] = [['Opening cash', result.openingCash], ['Investment', -result.investmentCost], ['Revenue', result.revenue], ['Operations', -result.operatingCost], ['Service costs', -result.serviceCost], ['Closing cash', result.closingCash]];
  return <div className="result-content"><PlanSummary plan={result.plan} />{result.missed && <p className="small">Missed plan · previous strategy carried forward</p>}
    <div className="result-grid"><dl className="cash-breakdown">{rows.map(([title, value], i) => <div key={title} className={i === 5 ? 'total' : ''}><dt>{title}</dt><dd className={value < 0 ? 'negative' : 'positive'}>{i > 0 && i < 5 && value > 0 ? '+' : ''}{cash(value)}</dd></div>)}</dl>
      <div><h3>Why this happened</h3><ul className="explanations">{result.explanations.map((text, i) => <li key={i}>{text}</li>)}</ul></div></div>
  </div>;
}
function ClassMix({ mix }: { mix: Mix }) {
  return <details className="panel class-mix"><summary>What the class chose ({mix.count} active companies)</summary><div className="mix-grid">
    <p><b>Customer focus</b><br />Developers {mix.developers} · Enterprises {mix.enterprise} · Both {mix.count - mix.developers - mix.enterprise}</p>
    <p><b>Pricing</b><br />Low {mix.low} · Standard {mix.count - mix.low - mix.premium} · Premium {mix.premium}</p>
    <p><b>Investment</b><br />Research {mix.research} · Reliability {mix.reliability} · Ecosystem {mix.ecosystem} · Cash {mix.save}</p>
  </div><p className="small">{mix.missed} missed plans used carry-forward defaults.</p></details>;
}
function ChoiceGroup({ title, items, value, onChange, disabled, unaffordable }: {
  title: string; items: readonly { id: string; title: string; description: string; cost?: number }[];
  value: string; onChange: (id: string) => void; disabled: boolean; unaffordable?: (id: string) => boolean;
}) {
  const selected = items.find(x => x.id === value)!;
  return <fieldset className="choice-group"><legend>{title}</legend><div className={'choice-buttons ' + (items.length === 4 ? 'four' : '')}>
    {items.map(item => <button key={item.id} type="button" aria-pressed={value === item.id} className={value === item.id ? 'selected' : ''}
      disabled={disabled || unaffordable?.(item.id)} onClick={() => onChange(item.id)}>{item.title}{item.cost !== undefined && <small>{item.cost ? `${item.cost} cash` : '0 cash'}</small>}</button>)}
    </div><p className="choice-description">{selected.description}</p>
  </fieldset>;
}

export default function Game() {
  const [session, setSession] = useState<Session | null>(null), [data, setData] = useState<GameView | null>(null);
  const [code, setCode] = useState(''), [name, setName] = useState(''), [linkedRoom, setLinkedRoom] = useState(false);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [qr, setQr] = useState(''), [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<Plan>(defaultPlan), [review, setReview] = useState(false);
  const [seconds, setSeconds] = useState(ROUND_SECONDS), [running, setRunning] = useState(false);
  const saving = useRef(false), currentSession = useRef(session);
  useEffect(() => { currentSession.current = session; }, [session]);
  const me = data?.me, phase = data?.phase;
  const isHost = data?.host ?? Boolean(session?.host);
  const draftKey = session?.player && data ? `deepseek-draft:${session.room}:${session.player}:${data.round}` : '';

  useEffect(() => {
    const room = new URLSearchParams(location.search).get('room')?.toUpperCase() ?? '';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser-only state after server hydration.
    setCode(room); setLinkedRoom(Boolean(room));
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (saved && typeof saved.room === 'string' && (saved.host || saved.player) && (!room || saved.room === room)) setSession(saved);
    } catch { /* Storage can be unavailable; in-memory play still works. */ }
  }, []);
  function keep(next: Session) {
    setSession(next); setData(null); setCopied(false); setReview(false);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* Keep session in memory. */ }
  }
  async function refresh(s: Session) {
    const response = await fetch('/api/game?' + new URLSearchParams({ room: s.room, ...(s.host ? { host: s.host } : {}), ...(s.player ? { player: s.player } : {}) }), { cache: 'no-store' });
    const value = await response.json() as GameView & { error?: string };
    if (!response.ok) throw Error(value.error ?? 'Could not load the room.');
    return value as GameView;
  }
  useEffect(() => {
    if (!session) return;
    let active = true, timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try { const value = await refresh(session!); if (active) {
        setData(old => {
          if (old?.room === value.room && old.version > value.version) return old;
          if (old?.room === value.room && old.round === value.round && value.phase === 'planning' && old.me?.id === value.me?.id && old.me?.plan && value.me && !value.me.plan) return { ...value, me: { ...value.me, plan: old.me.plan } };
          return value;
        }); setError('');
      } }
      catch (e) { if (active) setError((e as Error).message); }
      if (active) timer = setTimeout(poll, 2000);
    }
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [session]);
  useEffect(() => {
    if (!session?.host) return;
    let active = true;
    QRCode.toDataURL(location.origin + '/?room=' + session.room, { width: 320, margin: 2, errorCorrectionLevel: 'M' })
      .then(value => { if (active) setQr(value); }).catch(() => setError('QR unavailable. Share the room code or join link.'));
    return () => { active = false; };
  }, [session]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronize the local guide timer with a server-controlled phase transition.
  useEffect(() => { setSeconds(ROUND_SECONDS); setRunning(phase === 'planning' && isHost); }, [data?.round, phase, isHost]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds(s => { if (s <= 1) { setRunning(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!draftKey || !me) return;
    let next = fallbackPlan(me);
    try { const stored = JSON.parse(localStorage.getItem(draftKey) || 'null'); if (isPlan(stored)) next = stored; } catch { /* Use carried plan. */ }
    if (!canAfford(me, next.investment)) next = { ...next, investment: 'save' };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore a browser-stored draft only when its room/round identity changes.
    setDraft(next); setReview(false);
    // Polling must not overwrite a founder's in-progress draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, me?.id]);
  function edit(next: Plan) {
    setDraft(next); setReview(false);
    try { if (draftKey) localStorage.setItem(draftKey, JSON.stringify(next)); } catch { /* Keep draft in memory. */ }
  }
  async function act(action: string, extra: Record<string, unknown> = {}) {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError('');
    const actingSession = session;
    try {
      const response = await fetch('/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...session, action, ...extra }) });
      const value = await response.json() as { error?: string; room: string; host: string; player: string };
      if (!response.ok) throw Error(value.error ?? 'Could not save.');
      if (action === 'create') keep({ room: value.room, host: value.host });
      else if (action === 'join') keep({ room: code.trim().toUpperCase(), player: value.player });
      else if (actingSession && currentSession.current === actingSession) setData(await refresh(actingSession));
    } catch (e) { setError((e as Error).message); }
    finally { saving.current = false; setBusy(false); }
  }
  function leave() { setSession(null); setData(null); setError(''); try { localStorage.removeItem(SESSION_KEY); } catch {} }
  const joinLink = typeof window !== 'undefined' && session ? location.origin + '/?room=' + session.room : '';
  const planCost = investments.find(i => i.id === draft.investment)!.cost;
  const lastResult = me?.history.at(-1);
  const rank = (company: Company) => company.failed ? '—' : 1 + (data?.players.filter(p => !p.failed && p.cash > company.cash).length ?? 0);

  return <main className={isHost ? 'presenter' : ''}>
    <header><button type="button" className="brand" disabled={busy} onClick={leave}><span className="brandmark">D</span><span>DEEPSEEK<span className="subbrand">THE MARKET GAME</span></span></button><span className="badge">{isHost ? 'PRESENTER' : session ? 'FOUNDER' : 'CLASSROOM SIMULATION'}</span></header>
    {error && <div role="alert" className="error">{error}<button onClick={() => session ? refresh(session).then(setData).catch(e => setError(e.message)) : setError('')}>Retry</button></div>}
    {!session ? <div className="start"><section className="intro"><p className="eyebrow">YOUR STRATEGY. EVERYONE’S MARKET.</p><h1>Build a company.<br /><span>Shape the market.</span></h1><p className="lead">Choose where to start. Set your prices. Invest in what matters. Your class changes the conditions everyone faces next.</p><div className="initial"><div><strong>150</strong><span>Starting cash</span></div><div><strong>4</strong><span>Market rounds</span></div><div><strong>3</strong><span>Decisions each</span></div></div><Rules /></section>
      <section className="panel join"><p className="eyebrow">STEP 1 · TAKE YOUR SEAT</p><h2>Name your company</h2><form onSubmit={e => { e.preventDefault(); void act('join', { room: code.trim().toUpperCase(), name }); }}>
        {linkedRoom ? <p className="room-link">Joining room <b>{code}</b> <button type="button" className="textbutton" onClick={() => setLinkedRoom(false)}>Change room</button></p> : <><label htmlFor="room">Room code</label><input id="room" placeholder="e.g. A3F912" value={code} maxLength={6} autoCapitalize="characters" onChange={e => setCode(e.target.value.toUpperCase())} required /></>}
        <label htmlFor="company">Company name</label><input id="company" placeholder="Your fictional company" value={name} maxLength={24} onChange={e => setName(e.target.value)} required />
        <p className="small">Next, explore your starting ecosystem and release model. Each choice comes with explanations and trade-offs.</p><button className="primary" disabled={busy}>{busy ? 'Joining…' : 'Join & set up company'}</button>
      </form><div className="separator" /><button className="secondary" disabled={busy} onClick={() => void act('create')}>Host a new game</button><p className="small">10–15 minutes · fictional business environments</p></section></div>
      : !data ? <section className="panel connecting"><h2>Connecting to room {session.room}…</h2></section> : <>
        <div className="roomline"><span>ROOM <b>{session.room}</b></span><span>{data.players.length} founders</span><button disabled={busy} className="textbutton" onClick={leave}>Leave view</button></div>
        {(isHost || phase !== 'lobby' || me?.setupComplete) && <div className="progress">{rounds.map((r, i) => <div key={r.title} className={phase !== 'lobby' && i === data.round ? 'current' : i < data.round || phase === 'finished' ? 'complete' : ''}><span>0{i + 1}</span>{r.title}</div>)}</div>}
        {me?.setupComplete && <><div className="company-context">{me.name} · {label(hubs, me.hub)} · {label(releases, me.release)}</div><section className="stats">{[['Cash', cash(me.cash)], ['Developers', me.developers], ['Enterprises', me.enterprise], ['Trust', me.trust + '/100']].map(([title, value]) => <div key={title}><span>{title}</span><strong>{value}</strong></div>)}</section><Capabilities company={me} /></>}
        {phase === 'lobby' ? <div className={'lobby ' + (!isHost ? 'founder-lobby' : '')}>{me && !me.setupComplete ? <CompanySetup key={me.id} name={me.name} storageKey={'deepseek-setup:' + session.room + ':' + session.player} busy={busy} onConfirm={(hub, release) => void act('setup', { hub, release })} /> : <section className="panel lobbyintro"><p className="eyebrow">THE MARKET OPENS SOON</p><h1>{isHost ? 'Your founders are arriving.' : "You're ready."}</h1><p className="lead">{isHost ? 'Founders join with a name, then explore ecosystems and release models. Wait for everyone to confirm their setup.' : 'Your presenter will introduce the first market. Your setup is fixed; your plan can change each round.'}</p><div className="names">{data.players.map(p => <span key={p.id}>{p.name} · {p.setupComplete ? label(hubs, p.hub) + ' · Ready' : 'Choosing setup…'}</span>)}</div><Rules />{isHost && <p role="status" className="notice">{data.ready} / {data.players.length} founders ready</p>}{isHost && <button className="primary" disabled={busy || !data.players.length || data.ready !== data.players.length} onClick={() => void act('advance', { version: data.version })}>Introduce round 1</button>}</section>}
          {isHost && <section className="panel qrpanel">{qr && <img src={qr} alt="Scan to join this game" width={280} height={280} />}<h2>{session.room}</h2><p>Scan to join on your phone</p><button className="secondary" onClick={async () => { try { await navigator.clipboard.writeText(joinLink); setCopied(true); } catch { setError('Copy this join link: ' + joinLink); } }}>{copied ? 'Join link copied' : 'Copy join link'}</button><p className="small break">{joinLink}</p><p className="small">Use a deployed URL for phones. A localhost QR code works only on this computer.</p></section>}</div>
          : phase === 'finished' ? <section className="final"><p className="eyebrow">THE MARKET HAS CLOSED</p><h1>{data.players.every(p => p.failed) ? 'A tough market for everyone.' : 'The final company results.'}</h1><p className="lead">Highest ending cash among solvent companies wins. Equal cash shares the rank.</p><div className="panel debrief"><h2>What would customers pay for if the model were free?</h2><p>Who created value—and who captured it? Which early investment paid off? How did classmates change your strategy? Would the winner change over a longer horizon?</p></div>{isHost && <button className="primary" disabled={busy} onClick={() => void act('create')}>Create a fresh game</button>}</section>
          : <>
            <div className="roundheading"><div><p className="eyebrow">ROUND {data.round + 1} / 4 · {phase === 'briefing' ? 'READ THE MARKET' : phase === 'planning' ? 'BUILD YOUR PLAN' : 'RESULTS'}</p><h1>{rounds[data.round].title}</h1></div>{isHost && phase === 'planning' && <div className="timer"><strong>{seconds}s</strong><button onClick={() => setRunning(!running)}>{running ? 'Pause timer' : 'Resume timer'}</button><span>Guide only · close manually</span></div>}</div>
            {(phase === 'briefing' || phase === 'planning') && <MarketBrief market={data.market} compact={phase === 'planning' && !isHost} />}
            {phase === 'briefing' && <div className="controlbar"><p>{isHost ? 'Read the bulletin, then give founders 75 seconds to plan.' : 'Read the conditions. Your presenter will open decisions.'}</p>{isHost && <button className="primary" disabled={busy} onClick={() => void act('advance', { version: data.version })}>Open decisions</button>}</div>}
            {phase === 'planning' && (me?.failed ? <section className="panel"><h2>Out of cash</h2><p>Follow the market and use your company history in the final discussion.</p></section> : me?.plan ? <section className="panel locked"><p className="eyebrow">PLAN LOCKED</p><PlanSummary plan={me.plan} /><p role="status">Waiting for the presenter to close the round.</p></section> : me ? <section className="panel planning"><h2>Your company plan</h2>
              <ChoiceGroup title="1. Who will you serve?" items={focuses} value={draft.focus} disabled={busy || review} onChange={id => edit({ ...draft, focus: id as Plan['focus'] })} />
              <ChoiceGroup title="2. What will you charge?" items={prices} value={draft.price} disabled={busy || review} onChange={id => edit({ ...draft, price: id as Plan['price'] })} />
              <ChoiceGroup title="3. Where will you invest?" items={investments} value={draft.investment} disabled={busy || review} unaffordable={id => !canAfford(me, id as Plan['investment'])} onChange={id => edit({ ...draft, investment: id as Plan['investment'] })} />
              {draft.investment !== 'save' && <p className="small">Capability gains before diminishing returns: {investments.find(i => i.id === draft.investment)!.gains.map((v, i) => `${['quality', 'reliability', 'ecosystem'][i]} +${v}`).join(' · ')}</p>}
              <details className="rationale"><summary>Add a reason (optional)</summary><label htmlFor="rationale">We chose this because…</label><textarea id="rationale" maxLength={160} value={draft.rationale ?? ''} disabled={busy || review} onChange={e => edit({ ...draft, rationale: e.target.value })} /></details>
              <div className="budget"><span>Investment <b>{planCost}</b></span><span>Cash after investment <b>{cash(me.cash - planCost)}</b></span><span>Minimum reserve <b>{OPERATING_RESERVE}</b></span></div><p className="small">Operations will cost {hubs.find(h => h.id === me.hub)!.operatingCost + (me.release === 'core' ? 3 : 0)} cash, plus service costs. Revenue and customer gains depend on your plan and the market.</p>
              {review ? <div className="review"><h3>Ready to commit?</h3><PlanSummary plan={draft} /><p>Your plan locks when confirmed.</p><div className="actions"><button className="secondary" disabled={busy} onClick={() => setReview(false)}>Back to edit</button><button className="primary" disabled={busy || !canAfford(me, draft.investment)} onClick={() => void act('choose', { round: data.round, plan: draft })}>{busy ? 'Saving…' : 'Confirm & lock plan'}</button></div></div> : <button className="primary" disabled={busy || !canAfford(me, draft.investment)} onClick={() => setReview(true)}>Review my plan</button>}
            </section> : <section className="panel"><h2>Founders are planning</h2><p>They choose a customer focus, a price and an investment. Strong strategies connect all three to the market conditions.</p><p className="small">Missing plans repeat the previous focus and price, without new investment.</p></section>)}
            {phase === 'planning' && isHost && <div className="controlbar"><p><b>{data.submitted} / {data.active}</b> active founders have confirmed</p><button className="primary" disabled={busy} onClick={() => { if (data.submitted < data.active && !confirm('Close with missing plans? Previous focus and price will continue with no new investment.')) return; void act('advance', { version: data.version }); }}>Close round & show results</button></div>}
            {phase === 'resolving' && <section className="panel"><h2>Resolving the market…</h2><p>Submissions are closed. Results are calculated from the same published rules for everyone.</p>{isHost && <button className="primary" disabled={busy} onClick={() => void act('advance', { version: data.version })}>Resume results</button>}</section>}
            {phase === 'results' && <><section className="panel personal"><h2>{me ? me.failed ? 'Your company is out of cash' : 'Your round result' : 'The round is closed'}</h2>{lastResult && lastResult.round === data.round ? <Result result={lastResult} /> : <p>Compare the companies below. Capabilities and previous customer relationships carry forward.</p>}</section>
              {data.nextMarket && <MarketBrief market={data.nextMarket} preview />}
              <div className="controlbar"><p>{data.round === 3 ? 'Compare financial results and discuss the longer-term trade-offs.' : 'Explain how this round’s choices changed the next market.'}</p>{isHost && <button className="primary" disabled={busy} onClick={() => void act('advance', { version: data.version })}>{data.round === 3 ? 'Show final results' : 'Introduce round ' + (data.round + 2)}</button>}</div></>}
          </>}
        {phase !== 'lobby' && <section className="panel leaderboard"><div className="boardheading"><h2>{phase === 'finished' ? 'Final leaderboard' : 'Company results'}</h2><span className="small">Ranked by cash · failed companies unranked</span></div><div className="tablewrap"><table><thead><tr><th>Rank</th><th>Company</th><th>Cash</th><th>Dev.</th><th>Enterprise</th><th>Trust</th></tr></thead><tbody>{data.players.map(p => <tr key={p.id} className={p.id === me?.id ? 'you' : ''}><td>{rank(p)}</td><td>{p.name}{p.id === me?.id && <span className="youtag">YOU</span>}{p.failed && <span className="outtag">OUT OF CASH</span>}</td><td><strong>{cash(p.cash)}</strong></td><td>{p.developers}</td><td>{p.enterprise}</td><td>{p.trust}</td></tr>)}</tbody></table></div></section>}
        {!!me?.history.length && <details className="panel history-panel"><summary>Your company history</summary>{me.history.map(result => <section className="history" key={result.round}><h3>Round {result.round + 1}: {rounds[result.round].title}</h3><Result result={result} /></section>)}</details>}
        {data.mix && <ClassMix mix={data.mix} />}
        {phase !== 'lobby' && <Rules />}
      </>}
    <footer>Inspired by the DeepSeek case · Fictional markets and financial units · Your decisions shape the next round</footer>
  </main>;
}
