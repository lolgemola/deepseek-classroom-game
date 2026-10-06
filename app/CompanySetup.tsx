"use client";
import { useState } from "react";
import { FlaskConical, Building2, Code2 } from "lucide-react";
import { hubs, initialCompany, type Hub } from "@/lib/simulation";
export default function CompanySetup({
  name,
  storageKey,
  busy,
  onConfirm,
}: {
  name: string;
  storageKey: string;
  busy: boolean;
  onConfirm: (hub: Hub) => void;
}) {
  const [hub, setHub] = useState<Hub | null>(() => {
    try {
      const h = localStorage.getItem(storageKey);
      return hubs.some((x) => x.id === h) ? (h as Hub) : null;
    } catch {
      return null;
    }
  });
  const [review, setReview] = useState(false);
  const icons = [FlaskConical, Building2, Code2];
  const concise = [
    ["Quality starts at 4/10", "Higher costs; distribution needs work"],
    [
      "Trust 65/100 · 15% more enterprise acquisition",
      "Quality and ecosystem start at 2/10",
    ],
    [
      "Ecosystem 4/10 · 10% faster adoption",
      "Quality 2/10; weaker enterprise credibility",
    ],
  ];
  const preview = hub ? initialCompany({ id: "preview", name, hub }) : null;
  return (
    <section className="panel setup-panel">
      <ol className="setup-progress">
        <li className="complete">1 · Name</li>
        <li className={review ? "complete" : "current"}>2 · Ecosystem</li>
        <li className={review ? "current" : ""}>3 · Review</li>
      </ol>
      <p className="eyebrow">{name} · Company setup</p>
      <h1>
        {review
          ? "Your company starts here."
          : "Choose your starting ecosystem."}
      </h1>
      <p className="lead">Your ecosystem stays fixed for the game.</p>
      {!review ? (
        <>
          <div className="setup-options">
            {hubs.map((h, i) => {
              const Icon = icons[i];
              return (
                <button
                  type="button"
                  key={h.id}
                  className={"setup-option " + (hub === h.id ? "selected" : "")}
                  aria-pressed={hub === h.id}
                  disabled={busy}
                  onClick={() => {
                    setHub(h.id);
                    try {
                      localStorage.setItem(storageKey, h.id);
                    } catch {}
                  }}
                >
                  <Icon size={32} aria-hidden="true" />
                  <h2>{h.title}</h2>
                  <div className="setup-advantage">
                    <b>Advantage</b>
                    <p>{concise[i][0]}</p>
                  </div>
                  <div className="setup-tradeoff">
                    <b>Trade-off</b>
                    <p>{concise[i][1]}</p>
                  </div>
                  <p className="setup-cost">{h.operatingCost} cash / round</p>
                  <span className="optionaction">
                    {hub === h.id ? "Selected" : "Choose ecosystem"}
                  </span>
                </button>
              );
            })}
          </div>
          <details className="decision-help setup-help">
            <summary>More about the ecosystems</summary>
            {hubs.map((h) => (
              <article key={h.id}>
                <h3>{h.title}</h3>
                <p>{h.description}</p>
                <p>{h.advantage}</p>
                <p>{h.tradeoff}</p>
              </article>
            ))}
          </details>
          <button
            className="primary"
            disabled={!hub || busy}
            onClick={() => setReview(true)}
          >
            Review starting company
          </button>
        </>
      ) : (
        preview && (
          <>
            <section className="setup-summary">
              <h2>{name}</h2>
              <p>{hubs.find((h) => h.id === hub)?.title} · Open base model</p>
              <div className="budget">
                {[
                  ["Cash", 150],
                  ["Open adoption", 20],
                  ["Paying accounts", 0],
                  ["Community trust", preview.trust + "/100"],
                ].map(([k, v]) => (
                  <span key={k}>
                    {k}
                    <b>{v}</b>
                  </span>
                ))}
              </div>
              <div className="capabilities">
                {[
                  ["Quality", preview.quality],
                  ["Reliability", preview.reliability],
                  ["Ecosystem", preview.ecosystem],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>
                      {k} · {v}/10
                    </span>
                    <progress
                      aria-label={String(k)}
                      max={10}
                      value={Number(v)}
                    />
                  </div>
                ))}
              </div>
              <p className="small">
                Base operations: {hubs.find((h) => h.id === hub)?.operatingCost}{" "}
                cash per round, plus path and delivery costs.
              </p>
            </section>
            <div className="actions">
              <button
                className="secondary"
                disabled={busy}
                onClick={() => setReview(false)}
              >
                Back to ecosystems
              </button>
              <button
                className="primary"
                disabled={busy}
                onClick={() => onConfirm(hub!)}
              >
                {busy ? "Saving…" : "Confirm setup & get ready"}
              </button>
            </div>
          </>
        )
      )}
    </section>
  );
}
