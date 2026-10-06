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
      <p className="lead">
        Your base model stays open. In each round, decide how to build a
        sustainable business around it.
      </p>
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
                  <p>{h.description}</p>
                  <div className="setup-advantage">
                    <b>Your advantage</b>
                    <p>{h.advantage}</p>
                  </div>
                  <div className="setup-tradeoff">
                    <b>The trade-off</b>
                    <p>{h.tradeoff}</p>
                  </div>
                  <span className="optionaction">
                    {hub === h.id ? "Selected" : "Choose ecosystem"}
                  </span>
                </button>
              );
            })}
          </div>
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
                cash per round. Your monetization path and delivery add costs.
                The ecosystem stays fixed; your path can change.
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
