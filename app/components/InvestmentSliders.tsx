"use client";
import {
  INVESTMENT_COST,
  OPERATING_RESERVE,
  investments,
  investmentAllocation,
  investmentEffects,
  projectedCapabilities,
  transitionCost,
  type Company,
  type Investment,
  type InvestmentAllocation,
  type Path,
} from "@/lib/simulation";

export default function InvestmentSliders({
  company,
  investment,
  path,
  disabled,
  onChange,
}: {
  company: Company;
  investment: Investment;
  path: Path;
  disabled: boolean;
  onChange: (allocation: InvestmentAllocation) => void;
}) {
  const allocation = investmentAllocation(investment);
  const spent = investmentEffects(investment).cost;
  const projected = projectedCapabilities(company, investment);
  const available = Math.min(
    INVESTMENT_COST,
    Math.max(
      0,
      Math.floor(
        company.cash - transitionCost(company, path) - OPERATING_RESERVE,
      ),
    ),
  );
  function change(key: keyof InvestmentAllocation, value: number) {
    if (!Number.isFinite(value)) return;
    const remaining = INVESTMENT_COST - spent + allocation[key];
    onChange({
      ...allocation,
      [key]: Math.min(remaining, Math.max(0, Math.round(value))),
    });
  }
  return (
    <fieldset className="choice-group investment-sliders" disabled={disabled}>
      <legend>3. Where will you invest?</legend>
      <p className="choice-description">
        Divide up to 24 cash. Anything unspent stays with your company.
      </p>
      <div className="allocation-summary" aria-live="polite">
        <span>
          <b>{spent}</b> invested
        </span>
        <span>
          <b>{INVESTMENT_COST - spent}</b> kept
        </span>
      </div>
      {investments
        .filter((i) => i.id !== "save")
        .map((i, index) => {
          const key = i.id as keyof InvestmentAllocation;
          const current = [
            company.quality,
            company.reliability,
            company.ecosystem,
          ][index];
          const capability = ["Quality", "Reliability", "Ecosystem"][index];
          return (
            <div className="allocation-row" key={key}>
              <div className="allocation-heading">
                <label htmlFor={"invest-" + key}>{i.title}</label>
                <div className="allocation-number">
                  <input
                    type="number"
                    aria-label={i.title + " cash"}
                    min={0}
                    max={24}
                    step={1}
                    value={allocation[key]}
                    onChange={(e) => change(key, Number(e.target.value))}
                  />
                  <span>cash</span>
                </div>
              </div>
              <input
                id={"invest-" + key}
                type="range"
                min={0}
                max={24}
                step={1}
                value={allocation[key]}
                aria-valuetext={allocation[key] + " cash"}
                onChange={(e) => change(key, Number(e.target.value))}
              />
              <p>{i.description}</p>
              <small>
                {capability}: {current}/10 → <b>{projected[index]}/10</b>
              </small>
            </div>
          );
        })}
      <p className="small">
        Lower one slider to free budget for another. Projections include gains
        from all three investments.
      </p>
      {available < INVESTMENT_COST && (
        <p className="small">
          Your cash and transition costs allow up to {available} cash of
          investment while keeping the 20-cash reserve.
        </p>
      )}
      <button
        type="button"
        className="textbutton"
        disabled={disabled || spent === 0}
        onClick={() => onChange({ research: 0, reliability: 0, ecosystem: 0 })}
      >
        Keep all cash
      </button>
    </fieldset>
  );
}
