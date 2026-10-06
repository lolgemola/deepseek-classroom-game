"use client";
import { useState } from "react";
import { STARTING_CASH, paths, type Company } from "@/lib/simulation";
import CompanyMap from "./CompanyMap";
export default function CompanyProfile({ company: c }: { company: Company }) {
  const values = [STARTING_CASH, ...c.history.map((r) => r.closingCash)],
    min = Math.min(0, ...values),
    max = Math.max(STARTING_CASH, ...values),
    y = (v: number) => 110 - ((v - min) / (max - min || 1)) * 90;
  const last = c.history.at(-1);
  return (
    <article className="panel company-profile">
      <p className="eyebrow">{c.failed ? "Out of cash" : "Financial result"}</p>
      <h2>{c.name}</h2>
      <p>{paths.find((p) => p.id === c.path)?.title ?? "No path yet"}</p>
      <figure className="cash-chart">
        <figcaption>Cash history · fictional units</figcaption>
        <svg
          viewBox="0 -10 320 150"
          role="img"
          aria-label={values
            .map((v, i) => `${i ? "Round " + i : "Start"}: ${v.toFixed(1)}`)
            .join(", ")}
        >
          <line x1="15" y1={y(0)} x2="305" y2={y(0)} stroke="var(--line)" />
          <polyline
            points={values.map((v, i) => `${20 + i * 70},${y(v)}`).join(" ")}
            fill="none"
            stroke="var(--blue)"
            strokeWidth="3"
          />
          {values.map((v, i) => (
            <g key={i}>
              <circle cx={20 + i * 70} cy={y(v)} r="4" fill="var(--blue)" />
              <text x={20 + i * 70} y={y(v) - 9} textAnchor="middle">
                {Math.round(v)}
              </text>
              <text x={20 + i * 70} y="134" textAnchor="middle">
                {i ? "R" + i : "Start"}
              </text>
            </g>
          ))}
        </svg>
      </figure>
      <div className="profile-metrics">
        {[
          ["Ending cash", c.cash.toFixed(1)],
          ["Open adoption", c.adoption],
          ["Paying accounts", c.developers + c.enterprise],
          ["Community trust", c.trust + "/100"],
          ["Partner dependence", c.dependence + "/100"],
          ["Operating surplus", last?.operatingSurplus.toFixed(1) ?? "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <span>{k}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <p className="small">
        Operating surplus is retained revenue minus operations and delivery,
        before investment and transition. Last round: investment{" "}
        {last?.investmentCost ?? 0}, transition {last?.transitionCost ?? 0}.
        Dependence is an index.
      </p>
      <details className="business-map">
        <summary>Company connections</summary>
        <CompanyMap company={c} />
      </details>
      <p className="small">
        Four rounds do not establish long-term sustainability.
      </p>
    </article>
  );
}
export function CompanyComparison({ companies }: { companies: Company[] }) {
  const [first, setFirst] = useState(companies[0]?.id ?? ""),
    [second, setSecond] = useState(companies[1]?.id ?? "");
  return (
    <section className="comparison">
      <h2>Compare the businesses you built</h2>
      <div className="comparison-selects">
        {[
          [first, setFirst, "Company A"],
          [second, setSecond, "Company B"],
        ].map(([v, set, label]) => (
          <label key={String(label)}>
            {String(label)}
            <select
              value={String(v)}
              onChange={(e) => (set as (s: string) => void)(e.target.value)}
            >
              <option value="">Choose company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="profile-grid">
        {[first, second].map((id, i) => {
          const c = companies.find((x) => x.id === id);
          return c ? <CompanyProfile key={i + id} company={c} /> : null;
        })}
      </div>
    </section>
  );
}
