"use client";
import { KeyRound, Network, Wrench } from "lucide-react";
import { paths, type Path, type Company } from "@/lib/simulation";
import CompanyMap from "./CompanyMap";
export default function StrategyCards({
  value,
  onChange,
  disabled,
  company,
}: {
  value: Path;
  onChange: (p: Path) => void;
  disabled: boolean;
  company?: Company;
}) {
  const icons = [KeyRound, Network, Wrench];
  const concise = [
    ["Direct customer revenue", "Narrower reach; premium terms risk trust"],
    ["More reach and capacity", "Share revenue; depend on a platform"],
    ["Grow an open ecosystem", "Slower conversion; higher running costs"],
  ];
  return (
    <fieldset className="choice-group">
      <legend>1. Revenue model</legend>
      <div className="strategy-cards">
        {paths.map((p, i) => {
          const Icon = icons[i];
          return (
            <button
              type="button"
              key={p.id}
              disabled={disabled}
              aria-pressed={value === p.id}
              className={"strategy-card " + (value === p.id ? "selected" : "")}
              onClick={() => onChange(p.id)}
            >
              <Icon size={28} aria-hidden="true" />
              <strong>{p.title}</strong>
              <span className="offering">{p.offering}</span>
              <p className="advantage">{concise[i][0]}</p>
              <p className="tradeoff">{concise[i][1]}</p>
            </button>
          );
        })}
      </div>
      <details className="decision-help">
        <summary>Compare the trade-offs</summary>
        {paths.map((p) => (
          <article key={p.id}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p>{p.advantage}</p>
            <p>{p.tradeoff}</p>
            <p className="small">Build: {p.fit}</p>
          </article>
        ))}
        {company && <CompanyMap company={company} path={value} />}
      </details>
    </fieldset>
  );
}
