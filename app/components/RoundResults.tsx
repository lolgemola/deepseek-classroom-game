"use client";
import { useEffect, useState } from "react";
import { paths, prices, investments, type RoundResult } from "@/lib/simulation";
import CashFlow from "./CashFlow";
export default function RoundResults({
  result: r,
  identity,
}: {
  result: RoundResult;
  identity?: string;
}) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (!identity || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    try {
      const key = "deepseek-result-v3:" + identity + ":" + r.round;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "seen");
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore a once-only animation flag from browser storage after hydration.
        setAnimate(true);
      }
    } catch {
      /* Results remain immediate if storage is unavailable. */
    }
    const timer = setTimeout(() => setAnimate(false), 1800);
    return () => clearTimeout(timer);
  }, [identity, r.round]);
  return (
    <div className={"result-content " + (animate ? "animate-result" : "")}>
      <div className="plan-summary">
        <span>{paths.find((p) => p.id === r.plan.path)?.title}</span>
        <span>{prices.find((p) => p.id === r.plan.price)?.title} pricing</span>
        <span>
          {investments.find((p) => p.id === r.plan.investment)?.title}
        </span>
      </div>
      {r.missed && (
        <p className="small">
          Missed plan · carried forward with no investment
        </p>
      )}
      {animate && (
        <button className="textbutton" onClick={() => setAnimate(false)}>
          Skip animation
        </button>
      )}
      <div className="result-stages">
        <div>
          <span>Open adoption</span>
          <strong>{r.adoption}</strong>
          <small>open-model adopters</small>
        </div>
        <div>
          <span>Paying accounts</span>
          <strong>{r.developers + r.enterprise}</strong>
          <small>
            {r.developers} developer · {r.enterprise} enterprise
          </small>
        </div>
        <div>
          <span>Retained revenue</span>
          <strong>{r.revenue.toFixed(1)}</strong>
          <small>after partner share {r.partnerCut.toFixed(1)}</small>
        </div>
        <div>
          <span>Spending</span>
          <strong>
            {(
              r.operatingCost +
              r.serviceCost +
              r.investmentCost +
              r.transitionCost
            ).toFixed(1)}
          </strong>
          <small>operations, delivery, investment, transition</small>
        </div>
        <div>
          <span>Ending cash</span>
          <strong>{r.closingCash.toFixed(1)}</strong>
          <small>Community trust {r.trust}/100</small>
        </div>
      </div>
      <p className="takeaway">{r.takeaway}</p>
      <div className="result-grid">
        <details>
          <summary>Cash breakdown</summary>
          <CashFlow result={r} />
        </details>
        <div>
          <h3>Why this happened</h3>
          <ul className="explanations">
            {r.explanations.slice(0, 3).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <details>
            <summary>All calculations & trade-offs</summary>
            <ul className="explanations">
              {r.explanations.slice(3).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
