'use client';
import { useState } from 'react';
import { hubs, releases, initialCompany, STARTING_CASH, type Hub, type Release } from '@/lib/simulation';

type Draft = { step: 'hub' | 'release'; hub: Hub | null; release: Release | null };
function restore(key: string): Draft {
  const empty: Draft = { step: 'hub', hub: null, release: null };
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (!value) return empty;
    const hub = hubs.some(h => h.id === value.hub) ? value.hub as Hub : null;
    const release = releases.some(r => r.id === value.release) ? value.release as Release : null;
    return { hub, release, step: hub && value.step === 'release' ? 'release' : 'hub' };
  } catch { return empty; }
}
export default function CompanySetup({ name, storageKey, busy, onConfirm }: {
  name: string; storageKey: string; busy: boolean; onConfirm: (hub: Hub, release: Release) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => restore(storageKey));
  function edit(next: Draft) {
    setDraft(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep choices in memory. */ }
  }
  const options = draft.step === 'hub' ? hubs : releases;
  const selected = draft.step === 'hub' ? draft.hub : draft.release;
  const selectedHub = hubs.find(h => h.id === draft.hub);
  const selectedRelease = releases.find(r => r.id === draft.release);
  const preview = draft.hub && draft.release ? initialCompany({ id: 'preview', name, hub: draft.hub, release: draft.release }) : null;
  return <section className="panel setup-panel">
    <ol className="setup-progress" aria-label="Company setup steps"><li className="complete">1 · Name</li><li className={draft.step === 'hub' ? 'current' : 'complete'}>2 · Ecosystem</li><li className={draft.step === 'release' ? 'current' : ''}>3 · Release</li></ol>
    <p className="eyebrow">{name} · COMPANY SETUP</p>
    <h1>{draft.step === 'hub' ? 'Choose your starting ecosystem.' : 'Choose how you release your model.'}</h1>
    <p className="lead">{draft.step === 'hub' ? 'Where will your company get its early advantage? Every ecosystem can serve developers and enterprises. These are fictional business environments.' : 'What will customers pay for? Your release model changes how easily people adopt your offer—and how much adoption turns into revenue.'}</p>
    <div className="setup-options">{options.map(option => <button type="button" key={option.id} className={'setup-option ' + (selected === option.id ? 'selected' : '')} aria-pressed={selected === option.id} disabled={busy}
      onClick={() => edit(draft.step === 'hub' ? { ...draft, hub: option.id as Hub } : { ...draft, release: option.id as Release })}>
      <h2>{option.title}</h2><p>{option.description}</p><div className="setup-advantage"><b>Your advantage</b><p>{option.advantage}</p></div><div className="setup-tradeoff"><b>The trade-off</b><p>{option.tradeoff}</p></div><span className="optionaction">{selected === option.id ? 'Selected' : 'Choose this ' + (draft.step === 'hub' ? 'ecosystem' : 'release')}</span>
    </button>)}</div>
    {draft.step === 'hub' ? <div className="setup-next"><p className="small">Everyone starts with {STARTING_CASH} cash. Your choice changes capabilities and operating costs.</p><button className="primary" disabled={busy || !draft.hub} onClick={() => edit({ ...draft, step: 'release' })}>Continue to release model</button></div>
      : <><section className="setup-summary"><h3>Your starting company</h3><p>{name} · {selectedHub?.title}{selectedRelease ? ' · ' + selectedRelease.title : ''}</p>{preview && <><div className="budget"><span>Cash <b>{STARTING_CASH}</b></span><span>Quality <b>{preview.quality}/10</b></span><span>Ecosystem <b>{preview.ecosystem}/10</b></span><span>Trust <b>{preview.trust}/100</b></span><span>Operations / round <b>{selectedHub!.operatingCost + (draft.release === 'core' ? 3 : 0)}</b></span></div><p className="small">Reliability starts at 2/10. Service costs are additional. Ecosystem and release stay fixed for all four rounds; you can change your round-by-round plan.</p></>}</section>
      <div className="actions"><button className="secondary" disabled={busy} onClick={() => edit({ ...draft, step: 'hub' })}>Back to ecosystems</button><button className="primary" disabled={busy || !draft.hub || !draft.release} onClick={() => { if (draft.hub && draft.release) onConfirm(draft.hub, draft.release); }}>{busy ? 'Saving setup…' : 'Confirm setup & get ready'}</button></div></>}
  </section>;
}
