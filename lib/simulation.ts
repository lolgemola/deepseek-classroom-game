export const RULES_VERSION = 4,
  STARTING_CASH = 150,
  INVESTMENT_COST = 24,
  SWITCH_COST = 12,
  OPERATING_RESERVE = 20;
export const roundSeconds = (round: number): number => round === 0 ? 90 : 60;
export const hubs = [
  {
    id: "research",
    title: "Research hub",
    description: "Build near specialist talent.",
    advantage: "Quality starts at 4/10. Differentiate premium offers.",
    tradeoff:
      "Operations cost 18 per round. Distribution and tools need investment.",
    operatingCost: 18,
  },
  {
    id: "enterprise",
    title: "Enterprise hub",
    description: "Build near business customers.",
    advantage: "Trust starts at 65/100; enterprise acquisition is 15% higher.",
    tradeoff: "Operations cost 14. Quality and ecosystem start at 2/10.",
    operatingCost: 14,
  },
  {
    id: "developer",
    title: "Developer hub",
    description: "Build near an active creator community.",
    advantage:
      "Ecosystem starts at 4/10; adoption grows 10% faster. Operations cost 10.",
    tradeoff: "Quality starts at 2/10. Enterprise credibility needs work.",
    operatingCost: 10,
  },
] as const;
export const paths = [
  {
    id: "licensing",
    title: "Commercial licensing",
    description:
      "Sell a new premium edition and supported commercial package. The existing open model stays free.",
    offering: "Premium edition + support",
    advantage: "Earlier direct revenue; own the customer relationship.",
    tradeoff:
      "Narrower adoption. Premium terms can reduce trust; ecosystem investment cushions the loss.",
    fit: "Quality + reliability",
    rates: [1.5, 4, 7],
    operation: 4,
  },
  {
    id: "partnerships",
    title: "Strategic partnerships",
    description:
      "A cloud platform distributes and delivers your model services.",
    offering: "Partner-distributed access",
    advantage: "More reach and 35 extra capacity units.",
    tradeoff:
      "The platform takes 28% of billings initially. Dependence can weaken bargaining power.",
    fit: "Quality + reliability",
    rates: [1.6, 4, 7],
    operation: 2,
  },
  {
    id: "services",
    title: "Value-added services",
    description:
      "Keep the model open; sell hosting, tools, integrations and support.",
    offering: "Hosting + tools + support",
    advantage: "Strong open adoption and retention as the ecosystem matures.",
    tradeoff:
      "Slower paid conversion and 8 extra operating costs. Deliver services yourself.",
    fit: "Ecosystem + reliability",
    rates: [1.3, 3.2, 5.5],
    operation: 8,
  },
] as const;
export const prices = [
  {
    id: "low",
    title: "Accessible",
    description: "Lower fees, easier adoption, thinner margins.",
  },
  {
    id: "standard",
    title: "Standard",
    description: "Balance fees and adoption.",
  },
  {
    id: "premium",
    title: "Premium",
    description: "Higher fees; customers expect mature, reliable capabilities.",
  },
] as const;
export const investments = [
  {
    id: "research",
    title: "Research",
    description: "Differentiate the model for licensing and partners.",
    gains: [2.4, 0.6, 0.5],
    cost: 24,
  },
  {
    id: "reliability",
    title: "Reliability",
    description: "Improve capacity and retention; reduce delivery costs.",
    gains: [0.6, 2.4, 0.5],
    cost: 24,
  },
  {
    id: "ecosystem",
    title: "Ecosystem",
    description: "Improve service conversion, adoption and community trust.",
    gains: [0.5, 0.6, 2.4],
    cost: 24,
  },
  {
    id: "save",
    title: "Keep cash",
    description: "Spend nothing now. Existing capabilities carry forward.",
    gains: [0, 0, 0],
    cost: 0,
  },
] as const;
export const rounds = [
  {
    title: "Launch",
    briefing:
      "Your base model is open. Choose what customers will pay for and build supporting capabilities.",
  },
  {
    title: "Monetize",
    briefing:
      "Adoption is not revenue. Convert reach into paying accounts without losing community trust.",
  },
  {
    title: "Scale",
    briefing:
      "Growth has delivery costs. Partners offer capacity but capture part of your revenue.",
  },
  {
    title: "Defend",
    briefing:
      "Free alternatives and platform bargaining test your strategy. What funds continued innovation?",
  },
] as const;
export type Hub = (typeof hubs)[number]["id"];
export type Path = (typeof paths)[number]["id"];
export type Price = (typeof prices)[number]["id"];
export type InvestmentAllocation = {
  research: number;
  reliability: number;
  ecosystem: number;
};
export type Investment =
  (typeof investments)[number]["id"] | InvestmentAllocation;
export type Phase =
  "lobby" | "briefing" | "planning" | "resolving" | "results" | "finished";
export type Plan = {
  path: Path;
  price: Price;
  investment: Investment;
  rationale?: string;
};
export type Setup = { id: string; name: string; hub: Hub };
export type Signal = {
  id: string;
  title: string;
  cause: string;
  effect: string;
};
export type Mix = {
  count: number;
  low: number;
  premium: number;
  licensing: number;
  partnerships: number;
  services: number;
  research: number;
  reliability: number;
  ecosystem: number;
  save: number;
  missed: number;
};
export type Market = {
  round: number;
  signals: Signal[];
  demand: number;
  revenueFactor: number;
  serviceFactor: number;
  qualityWeight: number;
  ecosystemWeight: number;
  licensingFactor: number;
  servicesFactor: number;
  partnerShare: number;
  mix: Mix | null;
};
export type RoundResult = {
  round: number;
  openingCash: number;
  investmentCost: number;
  transitionCost: number;
  grossRevenue: number;
  partnerCut: number;
  revenue: number;
  operatingCost: number;
  serviceCost: number;
  operatingSurplus: number;
  closingCash: number;
  adoption: number;
  developers: number;
  enterprise: number;
  trust: number;
  dependence: number;
  quality: number;
  reliability: number;
  ecosystem: number;
  capacity: number;
  unserved: number;
  conversion: number;
  tenure: number;
  plan: Plan;
  missed: boolean;
  takeaway: string;
  explanations: string[];
};
export type Company = Setup & {
  cash: number;
  adoption: number;
  developers: number;
  enterprise: number;
  trust: number;
  dependence: number;
  quality: number;
  reliability: number;
  ecosystem: number;
  path: Path | null;
  tenure: number;
  failed: boolean;
  history: RoundResult[];
};
export type Snapshot = {
  companies: Company[];
  markets: Market[];
  lastMix?: Mix | null;
};
export type GameView = {
  room: string;
  phase: Phase;
  round: number;
  version: number;
  host: boolean;
  players: (Company & { setupComplete: boolean })[];
  me: (Company & { plan: Plan | null; setupComplete: boolean }) | null;
  ready: number;
  submitted: number;
  active: number;
  market: Market;
  nextMarket: Market | null;
  mix: Mix | null;
  rulesVersion: number;
};
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const money = (v: number) => Math.round(v * 10) / 10;
const cap = (v: number) => money(clamp(v, 0, 10));
export function isSetup(hub: unknown): hub is Hub {
  return hubs.some((h) => h.id === hub);
}
export function isInvestment(value: unknown): value is Investment {
  if (typeof value === "string") return investments.some((i) => i.id === value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const a = value as InvestmentAllocation;
  return (
    Object.keys(a).length === 3 &&
    [a.research, a.reliability, a.ecosystem].every(
      (n) => Number.isInteger(n) && n >= 0 && n <= INVESTMENT_COST,
    ) &&
    a.research + a.reliability + a.ecosystem <= INVESTMENT_COST
  );
}
export function investmentAllocation(
  investment: Investment,
): InvestmentAllocation {
  if (typeof investment !== "string") return { ...investment };
  return {
    research: investment === "research" ? 24 : 0,
    reliability: investment === "reliability" ? 24 : 0,
    ecosystem: investment === "ecosystem" ? 24 : 0,
  };
}
export function investmentEffects(investment: Investment) {
  const allocation = investmentAllocation(investment);
  const gains = [0, 0, 0];
  for (const i of investments) {
    if (i.id === "save") continue;
    i.gains.forEach((gain, index) => {
      gains[index] += (gain * allocation[i.id]) / INVESTMENT_COST;
    });
  }
  return {
    allocation,
    cost: allocation.research + allocation.reliability + allocation.ecosystem,
    gains,
  };
}
export function investmentSummary(investment: Investment) {
  const a = investmentAllocation(investment);
  const parts = investments
    .filter((i) => i.id !== "save" && a[i.id] > 0)
    .map((i) => `${i.title} ${a[i.id as keyof InvestmentAllocation]}`);
  return parts.length ? parts.join(" · ") : "Keep cash";
}
export function projectedCapabilities(c: Company, investment: Investment) {
  const { gains } = investmentEffects(investment);
  return [c.quality, c.reliability, c.ecosystem].map((v, i) =>
    cap(v + gains[i] * (1 - v / 12)),
  );
}
export function isPlan(value: unknown): value is Plan {
  if (!value || typeof value !== "object") return false;
  const p = value as Plan;
  return (
    paths.some((x) => x.id === p.path) &&
    prices.some((x) => x.id === p.price) &&
    isInvestment(p.investment) &&
    (p.rationale === undefined ||
      (typeof p.rationale === "string" && p.rationale.length <= 160))
  );
}
export function initialCompany(s: Setup): Company {
  return {
    id: s.id,
    name: s.name,
    hub: s.hub,
    cash: 150,
    adoption: 20,
    developers: 0,
    enterprise: 0,
    trust: s.hub === "enterprise" ? 65 : 55,
    dependence: 0,
    quality: s.hub === "research" ? 4 : 2,
    reliability: 2,
    ecosystem: s.hub === "developer" ? 4 : 2,
    path: null,
    tenure: 0,
    failed: false,
    history: [],
  };
}
export function transitionCost(c: Company, path: Path) {
  return c.path && c.path !== path ? SWITCH_COST : 0;
}
export function canAfford(
  c: Company,
  investment: Investment,
  path: Path = c.path ?? "services",
) {
  if (!isInvestment(investment)) return false;
  const cost = investmentEffects(investment).cost + transitionCost(c, path);
  return !c.failed && (cost === 0 || c.cash - cost >= 20);
}
export function fallbackPlan(c: Company): Plan {
  const p = c.history.at(-1)?.plan;
  return {
    path: p?.path ?? "services",
    price: p?.price ?? "standard",
    investment: "save",
  };
}
export function initialMarket(round = 0): Market {
  return {
    round,
    signals: [],
    demand: [1, 1.08, 1.2, 1.25][round],
    revenueFactor: 1,
    serviceFactor: 1,
    qualityWeight: 1,
    ecosystemWeight: 1,
    licensingFactor: 1,
    servicesFactor: 1,
    partnerShare: 0.28,
    mix: null,
  };
}
export function nextMarket(
  companies: Company[],
  submitted: Record<string, Plan>,
  round: number,
): Market {
  const m = initialMarket(round),
    active = companies.filter((c) => !c.failed);
  if (!active.length) return m;
  const mix: Mix = {
    count: active.length,
    low: 0,
    premium: 0,
    licensing: 0,
    partnerships: 0,
    services: 0,
    research: 0,
    reliability: 0,
    ecosystem: 0,
    save: 0,
    missed: 0,
  };
  for (const c of active) {
    const p = submitted[c.id] ?? fallbackPlan(c);
    mix[p.path]++;
    const { allocation, cost } = investmentEffects(p.investment);
    mix.research += allocation.research / 24;
    mix.reliability += allocation.reliability / 24;
    mix.ecosystem += allocation.ecosystem / 24;
    mix.save += (24 - cost) / 24;
    if (p.price === "low") mix.low++;
    if (p.price === "premium") mix.premium++;
    if (!submitted[c.id]) mix.missed++;
  }
  m.mix = mix;
  const share = (n: number) => n / mix.count;
  const add = (
    id: string,
    title: string,
    n: number,
    t: number,
    effect: string,
    budget = false,
  ) =>
    m.signals.push({
      id,
      title,
      cause: `${Math.round(share(n) * 100)}% of ${budget ? "the class investment budget" : "active companies"}; threshold ${t}%.`,
      effect,
    });
  if (share(mix.low) >= 0.5) {
    m.revenueFactor = 0.85;
    add(
      "price-war",
      "Price competition",
      mix.low,
      50,
      "Account revenue falls 15%; premium new demand falls 35%, standard 10%.",
    );
  }
  if (share(mix.licensing) >= 0.6) {
    m.licensingFactor = 0.65;
    add(
      "free-alternatives",
      "Free alternatives spread",
      mix.licensing,
      60,
      "New licensing accounts fall 35%. Quality helps differentiate the package.",
    );
  }
  if (share(mix.partnerships) >= 0.6) {
    m.partnerShare = 0.4;
    add(
      "platform-power",
      "Platforms gain bargaining power",
      mix.partnerships,
      60,
      "Partners take 40% of gross billings plus up to 10 percentage points from dependence.",
    );
  }
  if (share(mix.services) >= 0.6) {
    m.servicesFactor = 0.8;
    add(
      "hosting-crowding",
      "Hosting becomes crowded",
      mix.services,
      60,
      "Service revenue falls up to 20%; ecosystem maturity cushions the discount.",
    );
  }
  if (share(mix.research) >= 0.5) {
    m.qualityWeight = 1.5;
    add(
      "benchmark-race",
      "The quality bar rises",
      mix.research,
      50,
      "Quality contributes 50% more to paid-account demand.",
      true,
    );
  }
  if (share(mix.ecosystem) >= 0.5) {
    m.ecosystemWeight = 1.5;
    add(
      "integration-boom",
      "Integration demand grows",
      mix.ecosystem,
      50,
      "Ecosystem contributes 50% more to adoption and service conversion.",
      true,
    );
  }
  const reliability =
    active.reduce((s, c) => s + c.reliability, 0) / active.length;
  if (reliability < 4 && share(mix.reliability) < 0.25) {
    m.serviceFactor = 1.2;
    m.signals.push({
      id: "capacity-squeeze",
      title: "Delivery costs rise",
      cause: `Average reliability ${money(reliability)}/10, below 4; less than 25% of the class investment budget went to reliability.`,
      effect: "Delivery costs rise 20%, including partner-delivered accounts.",
    });
  }
  if (share(mix.premium) >= 0.6) {
    m.demand *= 1.12;
    add(
      "affordability-gap",
      "An affordable-offer opportunity",
      mix.premium,
      60,
      "New demand grows 12%; accessible offers attract more of it.",
    );
  }
  if (share(mix.save) >= 0.6) {
    m.qualityWeight = Math.max(m.qualityWeight, 1.25);
    add(
      "outside-rival",
      "An outside rival improves",
      mix.save,
      60,
      "Quality contributes at least 25% more to paid-account demand.",
      true,
    );
  }
  if (!m.signals.length)
    m.signals.push({
      id: "steady",
      title: "A diverse market",
      cause: "No pressure threshold was crossed.",
      effect: "Normal demand growth applies.",
    });
  return m;
}
export function resolveCompany(
  c: Company,
  submitted: Plan | undefined,
  m: Market,
): Company {
  if (c.failed) return c;
  const p = submitted ?? fallbackPlan(c);
  if (!isPlan(p) || !canAfford(c, p.investment, p.path))
    throw Error("Invalid or unaffordable plan");
  const path = paths.find((x) => x.id === p.path)!,
    invest = investmentEffects(p.investment);
  const switching = transitionCost(c, p.path),
    tenure = c.path === p.path ? c.tenure + 1 : 1;
  const quality = cap(c.quality + invest.gains[0] * (1 - c.quality / 12)),
    reliability = cap(
      c.reliability + invest.gains[1] * (1 - c.reliability / 12),
    ),
    ecosystem = cap(c.ecosystem + invest.gains[2] * (1 - c.ecosystem / 12));
  const fit = clamp(
    ((p.path === "services" ? ecosystem : quality) + reliability) / 10,
    0.3,
    1.25,
  );
  const priceDemand =
    p.price === "low" ? 1.3 : p.price === "premium" ? 0.65 * fit : 1;
  const competition =
    m.revenueFactor < 1
      ? p.price === "premium"
        ? 0.65
        : p.price === "standard"
          ? 0.9
          : 1
      : 1;
  const communityGrowth =
    22 *
    m.demand *
    (p.path === "licensing" ? 0.85 : p.path === "partnerships" ? 1.25 : 1.3) *
    (1 + ecosystem * 0.07 * m.ecosystemWeight) *
    (c.trust / 100 + 0.45) *
    (c.hub === "developer" ? 1.1 : 1);
  const adoption = Math.round(c.adoption * 0.94 + communityGrowth);
  const conversion = clamp(
    p.path === "services"
      ? 0.12 +
          ecosystem * 0.025 * m.ecosystemWeight +
          Math.min(tenure - 1, 3) * 0.045
      : p.path === "licensing"
        ? 0.48
        : 0.42,
    0.1,
    0.8,
  );
  const attraction = clamp(
    0.55 + quality * 0.09 * m.qualityWeight + reliability * 0.035,
    0.4,
    2,
  );
  const newAccounts =
    communityGrowth *
    conversion *
    priceDemand *
    competition *
    attraction *
    (p.path === "licensing" ? m.licensingFactor : 1) *
    (switching ? 0.8 : 1);
  // A path transition migrates existing accounts; it never resets the company.
  const retention =
    clamp(
      0.65 +
        c.trust / 500 +
        reliability / 80 +
        (p.path === "services" ? ecosystem * 0.012 : 0) -
        (p.price === "premium" && fit < 0.7 ? 0.12 : 0),
      0.45,
      0.96,
    ) * (switching ? 0.8 : 1);
  const devFraction =
    p.path === "licensing" ? 0.3 : p.path === "partnerships" ? 0.6 : 0.75;
  const wantDev = Math.round(
      c.developers * retention + newAccounts * devFraction,
    ),
    wantEnt = Math.round(
      c.enterprise * retention +
        ((newAccounts * (1 - devFraction)) / 2) *
          (c.hub === "enterprise" ? 1.15 : 1),
    );
  const capacity = Math.round(
      36 + reliability * 5 + (p.path === "partnerships" ? 35 : 0),
    ),
    ratio = Math.min(1, capacity / Math.max(1, wantDev + wantEnt * 3));
  const developers = Math.floor(wantDev * ratio),
    enterprise = Math.floor(wantEnt * ratio),
    unserved = wantDev + wantEnt - developers - enterprise;
  const dependence = Math.round(
    clamp(c.dependence + (p.path === "partnerships" ? 22 : -18), 0, 100),
  );
  const rate =
    path.rates[p.price === "low" ? 0 : p.price === "standard" ? 1 : 2];
  const servicesDiscount =
    p.path === "services"
      ? 1 - (1 - m.servicesFactor) * (1 - ecosystem / 10)
      : 1;
  const grossRevenue = money(
    (developers + enterprise * 3) * rate * m.revenueFactor * servicesDiscount,
  );
  const partnerRate =
    p.path === "partnerships"
      ? Math.min(0.5, m.partnerShare + c.dependence * 0.001)
      : 0;
  const partnerCut = money(grossRevenue * partnerRate),
    revenue = money(grossRevenue - partnerCut);
  const operatingCost =
    hubs.find((h) => h.id === c.hub)!.operatingCost + path.operation;
  const serviceCost = money(
    (developers * 0.42 + enterprise * 1.25) *
      m.serviceFactor *
      (1 - reliability * 0.035) *
      (p.path === "partnerships" ? 0.75 : 1),
  );
  const operatingSurplus = money(revenue - operatingCost - serviceCost),
    cash = money(c.cash - invest.cost - switching + operatingSurplus);
  const restrictive =
      p.path === "licensing" &&
      p.price === "premium" &&
      invest.allocation.ecosystem < INVESTMENT_COST,
    premiumMismatch = p.price === "premium" && fit < 0.7;
  const serviceTrust = ratio >= 0.95 ? 3 : -Math.ceil((1 - ratio) * 24);
  const trust = Math.round(
    clamp(
      c.trust +
        serviceTrust +
        (4 * invest.allocation.ecosystem) / INVESTMENT_COST -
        (restrictive
          ? 6 * (1 - invest.allocation.ecosystem / INVESTMENT_COST)
          : 0) -
        (premiumMismatch ? 5 : 0),
      0,
      100,
    ),
  );
  const takeaway = unserved
    ? "Demand exceeded capacity. Growth cost community trust."
    : p.path === "partnerships"
      ? `The platform delivered reach, but kept ${partnerCut} of ${grossRevenue} gross billings.`
      : p.path === "services"
        ? `${Math.round(conversion * 100)}% of new adoption entered paid-account demand. Ecosystem and time on this path matter.`
        : "Your premium package captured revenue directly. Open adoption alone did not pay the bills.";
  const explanations = [
    `${adoption} community adopters are not automatically paying accounts. Served: ${developers} developer and ${enterprise} enterprise accounts.`,
    `Paid fee ${rate}; enterprises count as three units. Gross billings ${grossRevenue}, partner share ${partnerCut}, retained revenue ${revenue}.`,
    `Operations ${operatingCost}, delivery ${serviceCost}; surplus ${operatingSurplus}, before investment ${invest.cost} and transition ${switching}.`,
    `Investment: ${investmentSummary(p.investment)}; ${24 - invest.cost} of the 24-cash budget kept. Capability gains scale with spending and diminish near 10.`,
    `Capacity ${capacity} units; enterprise accounts use three. Unserved accounts: ${unserved}.`,
    `Trust ${c.trust} → ${trust}: delivery ${serviceTrust}${invest.allocation.ecosystem ? `, ecosystem +${money((4 * invest.allocation.ecosystem) / INVESTMENT_COST)}` : ""}${restrictive ? `, restrictive premium terms −${money(6 * (1 - invest.allocation.ecosystem / INVESTMENT_COST))}` : ""}${premiumMismatch ? ", capability mismatch −5" : ""}.`,
  ];
  if (switching)
    explanations.push(
      "Path transition: 12 cash, acquisition ×0.8 and account retention ×0.8. Capabilities persist; path tenure restarts.",
    );
  if (!submitted)
    explanations.push(
      "Missed plan: previous path and price, no investment. First-round default: services, standard price.",
    );
  if (p.path === "partnerships")
    explanations.push(
      `Partner share ${Math.round(partnerRate * 100)}%: market base ${Math.round(m.partnerShare * 100)}% plus opening dependence/10 percentage points, capped at 50%. Dependence ${c.dependence} → ${dependence}.`,
    );
  if (p.path === "services")
    explanations.push(
      `Conversion ${Math.round(conversion * 100)}% after ${tenure} round(s) on this path. Hosting discount ${Math.round((1 - servicesDiscount) * 100)}%. Timing is compressed for classroom play.`,
    );
  const result: RoundResult = {
    round: m.round,
    openingCash: c.cash,
    investmentCost: invest.cost,
    transitionCost: switching,
    grossRevenue,
    partnerCut,
    revenue,
    operatingCost,
    serviceCost,
    operatingSurplus,
    closingCash: cash,
    adoption,
    developers,
    enterprise,
    trust,
    dependence,
    quality,
    reliability,
    ecosystem,
    capacity,
    unserved,
    conversion,
    tenure,
    plan: p,
    missed: !submitted,
    takeaway,
    explanations,
  };
  return {
    ...c,
    cash,
    adoption,
    developers,
    enterprise,
    trust,
    dependence,
    quality,
    reliability,
    ecosystem,
    path: p.path,
    tenure,
    failed: cash <= 0,
    history: [...c.history, result],
  };
}
export function closeRound(
  s: Snapshot,
  plans: Record<string, Plan>,
  round: number,
): Snapshot {
  const companies = s.companies.map((c) =>
      resolveCompany(c, plans[c.id], s.markets[round]),
    ),
    markets = [...s.markets],
    next = nextMarket(s.companies, plans, Math.min(round + 1, 3));
  if (round < 3) markets.push(next);
  return { companies, markets, lastMix: next.mix };
}
export function rankCompanies(companies: Company[]) {
  return [...companies].sort(
    (a, b) =>
      Number(a.failed) - Number(b.failed) ||
      b.cash - a.cash ||
      a.name.localeCompare(b.name),
  );
}
