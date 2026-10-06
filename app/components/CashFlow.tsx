import type { RoundResult } from "@/lib/simulation";
export default function CashFlow({ result: r }: { result: RoundResult }) {
  const rows: [string, number][] = [
    ["Opening cash", r.openingCash],
    ["Gross billings", r.grossRevenue],
    ["Partner share", -r.partnerCut],
    ["Operations", -r.operatingCost],
    ["Delivery", -r.serviceCost],
    ["Investment", -r.investmentCost],
    ["Transition", -r.transitionCost],
    ["Closing cash", r.closingCash],
  ];
  const max = Math.max(1, ...rows.map((x) => Math.abs(x[1])));
  return (
    <dl className="cash-flow" aria-label="Cash reconciliation">
      {rows.map(([k, v], i) => (
        <div key={k} className={i === 7 ? "total" : ""}>
          <dt>{k}</dt>
          <dd>
            <span
              className={"flow-bar " + (v < 0 ? "cost" : "income")}
              style={{ width: Math.max(2, (Math.abs(v) / max) * 100) + "%" }}
              aria-hidden="true"
            />
            <b>
              {i > 0 && i < 7 && v > 0 ? "+" : ""}
              {v.toFixed(1)}
            </b>
          </dd>
        </div>
      ))}
    </dl>
  );
}
