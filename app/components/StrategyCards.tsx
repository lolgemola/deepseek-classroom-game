"use client";
import { KeyRound, Network, Wrench } from "lucide-react";
import { paths, type Path } from "@/lib/simulation";
export default function StrategyCards({
  value,
  onChange,
  disabled,
}: {
  value: Path;
  onChange: (p: Path) => void;
  disabled: boolean;
}) {
  const icons = [KeyRound, Network, Wrench];
  return (
    <fieldset className="choice-group">
      <legend>1. How will you monetize?</legend>
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
              <p>{p.description}</p>
              <p className="advantage">{p.advantage}</p>
              <p className="tradeoff">{p.tradeoff}</p>
              <small>Build: {p.fit}</small>
              <span className="optionaction">
                {value === p.id ? "Selected" : "Choose path"}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
