export const RULES_VERSION = 2;
export const STARTING_CASH = 150;
export const INVESTMENT_COST = 24;
export const OPERATING_RESERVE = 20;
export const ROUND_SECONDS = 75;

export const hubs = [
  { id: 'research', title: 'Research hub', description: 'Build near researchers and specialist talent.', advantage: 'Quality starts at 4/10 instead of 2/10. A stronger model can support premium offers.', tradeoff: 'Talent is expensive: operations cost 18 cash each round, before service costs.', operatingCost: 18 },
  { id: 'enterprise', title: 'Enterprise hub', description: 'Build near business customers and trusted networks.', advantage: 'Trust starts at 65/100 instead of 55/100. Introductions bring 15% more new enterprise customers.', tradeoff: 'Operations cost 14 cash each round. Quality and ecosystem strength still start at 2/10.', operatingCost: 14 },
  { id: 'developer', title: 'Developer hub', description: 'Build near app creators and an active developer community.', advantage: 'Ecosystem starts at 4/10 instead of 2/10. Introductions bring 10% more new developers.', tradeoff: 'Quality starts at 2/10 and trust at 55/100. You need to build credibility for premium enterprise offers. Operations cost 10 cash per round.', operatingCost: 10 },
] as const;
export const releases = [
  { id: 'open', title: 'Open release', description: 'Let people use and adapt the model. Sell convenient hosting and dependable service.', advantage: '25% more new developer adoption than the baseline. An open market gives a further adoption boost.', tradeoff: 'Paid conversion earns 72% of developer list revenue and 88% of enterprise list revenue. Adoption does not guarantee revenue.' },
  { id: 'closed', title: 'Closed model', description: 'Keep the model controlled and sell access to it.', advantage: 'Earn the full list revenue from your served customer base.', tradeoff: '20% less new developer adoption than baseline. If open releases become standard, acquisition and revenue face further pressure.' },
  { id: 'core', title: 'Open core', description: 'Offer an open base, then charge for advanced features and services.', advantage: '5% more new developer adoption than baseline. Earn 88% of developer and 94% of enterprise list revenue.', tradeoff: 'Supporting two offerings adds 3 cash to operations every round. Paid conversion is lower than a closed offer.' },
] as const;
export const focuses = [
  { id: 'developers', title: 'Developers', description: 'More adoption, smaller bills. Ecosystem and affordability matter.' },
  { id: 'enterprise', title: 'Enterprises', description: 'Fewer, larger contracts. Quality, reliability and trust matter.' },
  { id: 'balanced', title: 'Both markets', description: 'Diversify customers, with less acquisition in either segment.' },
] as const;
export const prices = [
  { id: 'low', title: 'Low', description: '1.2 per developer · 3 per enterprise. Easier adoption, thinner margins.' },
  { id: 'standard', title: 'Standard', description: '2 per developer · 5 per enterprise. Balance demand and margin.' },
  { id: 'premium', title: 'Premium', description: '2.8 per developer · 8 per enterprise. Buyers expect stronger capabilities.' },
] as const;
export const investments = [
  { id: 'research', title: 'Research', description: 'Improve the model. Best when buyers compare performance.', gains: [2.4, 0.6, 0.5], cost: INVESTMENT_COST },
  { id: 'reliability', title: 'Reliability', description: 'Serve more customers and protect retention.', gains: [0.6, 2.4, 0.5], cost: INVESTMENT_COST },
  { id: 'ecosystem', title: 'Ecosystem', description: 'Build tools and integrations that attract developers.', gains: [0.5, 0.6, 2.4], cost: INVESTMENT_COST },
  { id: 'save', title: 'Keep cash', description: 'Spend nothing now. Existing capabilities carry forward.', gains: [0, 0, 0], cost: 0 },
] as const;
export const rounds = [
  { title: 'Launch', briefing: 'Developers seek useful, affordable tools. Enterprises will pay for quality and dependable service. Establish a customer base.' },
  { title: 'Monetize', briefing: 'Buyers compare paid offers with free alternatives. Yesterday’s collective decisions have changed competition.' },
  { title: 'Scale', briefing: 'Demand is growing. Winning customers only helps if you can serve them. Earlier investments now matter.' },
  { title: 'Defend', briefing: 'Buyers know their options. Use your capabilities and the market signals to finish with a solvent business.' },
] as const;

export type Hub = typeof hubs[number]['id'];
export type Release = typeof releases[number]['id'];
export type Focus = typeof focuses[number]['id'];
export type Price = typeof prices[number]['id'];
export type Investment = typeof investments[number]['id'];
export type Phase = 'lobby' | 'briefing' | 'planning' | 'resolving' | 'results' | 'finished';
export type Plan = { focus: Focus; price: Price; investment: Investment; rationale?: string };
export type Setup = { id: string; name: string; hub: Hub; release: Release };
export type Signal = { id: string; title: string; cause: string; effect: string };
export type Mix = { count: number; low: number; premium: number; enterprise: number; developers: number; research: number; reliability: number; ecosystem: number; save: number; open: number; missed: number };
export type Market = { round: number; signals: Signal[]; developerDemand: number; enterpriseDemand: number; revenueFactor: number; serviceFactor: number; qualityWeight: number; ecosystemWeight: number; openPressure: boolean; mix: Mix | null };
export type RoundResult = { round: number; openingCash: number; investmentCost: number; revenue: number; operatingCost: number; serviceCost: number; closingCash: number; developers: number; enterprise: number; trust: number; quality: number; reliability: number; ecosystem: number; capacity: number; unserved: number; plan: Plan; missed: boolean; explanations: string[] };
export type Company = Setup & { cash: number; developers: number; enterprise: number; trust: number; quality: number; reliability: number; ecosystem: number; failed: boolean; history: RoundResult[] };
export type Snapshot = { companies: Company[]; markets: Market[]; lastMix?: Mix | null };
export type GameView = { room: string; phase: Phase; round: number; version: number; host: boolean; players: (Company & { setupComplete: boolean })[]; me: (Company & { plan: Plan | null; setupComplete: boolean }) | null; ready: number; submitted: number; active: number; market: Market; nextMarket: Market | null; mix: Mix | null; rulesVersion: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const money = (v: number) => Math.round(v * 10) / 10;
const capability = (v: number) => money(clamp(v, 0, 10));
export function isSetup(hub: unknown, release: unknown): hub is Hub {
  return hubs.some(h => h.id === hub) && releases.some(r => r.id === release);
}
export function isPlan(value: unknown): value is Plan {
  if (!value || typeof value !== 'object') return false;
  const p = value as Plan;
  return focuses.some(f => f.id === p.focus) && prices.some(x => x.id === p.price) && investments.some(i => i.id === p.investment)
    && (p.rationale === undefined || (typeof p.rationale === 'string' && p.rationale.length <= 160));
}
export function initialCompany(setup: Setup): Company {
  return { id: setup.id, name: setup.name, hub: setup.hub, release: setup.release, cash: STARTING_CASH, developers: 6, enterprise: 2, trust: setup.hub === 'enterprise' ? 65 : 55,
    quality: setup.hub === 'research' ? 4 : 2, reliability: 2, ecosystem: setup.hub === 'developer' ? 4 : 2, failed: false, history: [] };
}
export function canAfford(company: Company, investment: Investment) {
  return !company.failed && (investment === 'save' || company.cash >= INVESTMENT_COST + OPERATING_RESERVE);
}
export function fallbackPlan(company: Company): Plan {
  const last = company.history.at(-1)?.plan;
  return { focus: last?.focus ?? 'balanced', price: last?.price ?? 'standard', investment: 'save' };
}
export function initialMarket(round = 0): Market {
  return { round, signals: [], developerDemand: [1, 1.08, 1.2, 1.25][round], enterpriseDemand: [1, 1.1, 1.15, 1.25][round],
    revenueFactor: 1, serviceFactor: 1, qualityWeight: 1, ecosystemWeight: 1, openPressure: false, mix: null };
}

// Every pressure uses the previous closed round, normalized by active company count.
// These conditions are published before the next plan; no language model or randomness.
export function nextMarket(companies: Company[], submitted: Record<string, Plan>, round: number): Market {
  const market = initialMarket(round);
  const active = companies.filter(c => !c.failed);
  if (!active.length) return market;
  const mix: Mix = { count: active.length, low: 0, premium: 0, enterprise: 0, developers: 0, research: 0, reliability: 0, ecosystem: 0, save: 0, open: 0, missed: 0 };
  for (const c of active) {
    const p = submitted[c.id] ?? fallbackPlan(c);
    if (!submitted[c.id]) mix.missed++;
    if (p.price === 'low') mix.low++;
    if (p.price === 'premium') mix.premium++;
    if (p.focus !== 'balanced') mix[p.focus]++;
    mix[p.investment]++;
    if (c.release !== 'closed') mix.open++;
  }
  market.mix = mix;
  const share = (n: number) => n / mix.count;
  const percent = (n: number) => `${Math.round(share(n) * 100)}%`;
  const add = (id: string, title: string, cause: string, effect: string) => market.signals.push({ id, title, cause, effect });
  if (share(mix.low) >= 0.5) {
    market.revenueFactor *= 0.85;
    add('price-war', 'Price competition', `${percent(mix.low)} chose low pricing.`, 'Revenue per customer falls 15%. New acquisition falls 60% for premium offers and 15% for standard offers.');
  }
  if (share(mix.enterprise) >= 0.6) {
    market.enterpriseDemand *= 0.6;
    add('enterprise-crowding', 'Enterprise crowding', `${percent(mix.enterprise)} focused on enterprises.`, 'New enterprise acquisition is 40% lower this round. Existing contracts are not directly reduced.');
  }
  if (share(mix.developers) >= 0.6) {
    market.developerDemand *= 0.6;
    add('developer-crowding', 'Developer crowding', `${percent(mix.developers)} focused on developers.`, 'New developer acquisition is 40% lower this round. Existing customers are not directly reduced.');
  }
  if (share(mix.research) >= 0.5) {
    market.qualityWeight = 2;
    add('benchmark-race', 'A benchmark race', `${percent(mix.research)} invested in research.`, 'Quality contributes 100% more to new-customer attraction. Low-quality offers fall behind.');
  }
  const averageReliability = active.reduce((sum, c) => sum + c.reliability, 0) / active.length;
  if (averageReliability < 4 && share(mix.reliability) < 0.25) {
    market.serviceFactor = 1.2;
    add('capacity-squeeze', 'Capacity squeeze', `Average reliability is ${money(averageReliability)}/10; ${percent(mix.reliability)} invested in reliability.`, 'Service costs rise 20%. Reliability increases capacity and reduces cost per customer.');
  }
  if (share(mix.open) >= 0.6) {
    market.openPressure = true;
    add('open-standard', 'Open becomes standard', `${percent(mix.open)} run open or open-core releases.`, 'Closed models attract 15% fewer new developers and earn 18% less revenue per customer. Open models get a 10% developer adoption boost.');
  }
  if (share(mix.ecosystem) >= 0.5) {
    market.ecosystemWeight = 1.5;
    add('integration-boom', 'An integration boom', `${percent(mix.ecosystem)} invested in ecosystems.`, 'Ecosystem strength contributes 50% more to developer acquisition.');
  }
  if (share(mix.premium) >= 0.6) {
    market.developerDemand *= 1.12;
    add('affordability-gap', 'An affordability gap', `${percent(mix.premium)} chose premium prices.`, 'New developer demand grows 12%. Lower-priced offers are better positioned to win it.');
  }
  if (share(mix.save) >= 0.6) {
    market.qualityWeight = Math.max(market.qualityWeight, 1.25);
    add('outside-rival', 'An outside rival improves', `${percent(mix.save)} preserved cash instead of investing.`, 'Quality contributes 25% more to customer attraction. Existing research can still differentiate an offer.');
  }
  if (!market.signals.length) add('steady', 'A diverse market', 'No strategy crossed a market-pressure threshold.', 'Competition is balanced. Normal demand growth applies.');
  return market;
}

export function resolveCompany(company: Company, submitted: Plan | undefined, market: Market): Company {
  if (company.failed) return company;
  const plan = submitted ?? fallbackPlan(company);
  if (!isPlan(plan) || !canAfford(company, plan.investment)) throw new Error('Invalid or unaffordable plan');
  const investment = investments.find(i => i.id === plan.investment)!;
  const quality = capability(company.quality + investment.gains[0] * (1 - company.quality / 12));
  const reliability = capability(company.reliability + investment.gains[1] * (1 - company.reliability / 12));
  const ecosystem = capability(company.ecosystem + investment.gains[2] * (1 - company.ecosystem / 12));
  const trustFactor = 0.65 + company.trust / 150;
  const focusDev = plan.focus === 'developers' ? 1.4 : plan.focus === 'enterprise' ? 0.35 : 0.85;
  const focusEnt = plan.focus === 'enterprise' ? 1.4 : plan.focus === 'developers' ? 0.35 : 0.85;
  const enterprisePremiumFit = clamp((quality + reliability - 2) / 9, 0.25, 1.1);
  const developerPremiumFit = clamp((quality + ecosystem - 2) / 9, 0.25, 1.1);
  const premiumFit = plan.focus === 'developers' ? developerPremiumFit : plan.focus === 'enterprise' ? enterprisePremiumFit : (developerPremiumFit + enterprisePremiumFit) / 2;
  const priceCompetition = market.revenueFactor < 1 ? (plan.price === 'premium' ? 0.4 : plan.price === 'standard' ? 0.85 : 1) : 1;
  const devPriceDemand = plan.price === 'low' ? 1.4 : plan.price === 'standard' ? 1 : 0.75 * developerPremiumFit;
  const entPriceDemand = plan.price === 'low' ? 1.15 : plan.price === 'standard' ? 1 : 0.8 * enterprisePremiumFit;
  const releaseDev = company.release === 'open' ? 1.25 : company.release === 'closed' ? 0.8 : 1.05;
  const pressure = market.openPressure ? (company.release === 'closed' ? 0.85 : company.release === 'open' ? 1.1 : 1) : 1;
  const devAttraction = clamp(0.55 + ecosystem * 0.1 * market.ecosystemWeight + (quality - 3) * 0.1 * market.qualityWeight, 0.25, 2);
  const entAttraction = clamp(0.45 + (quality - 3) * 0.09 * market.qualityWeight + reliability * 0.09, 0.2, 2);
  const acquiredDev = 18 * market.developerDemand * focusDev * devPriceDemand * priceCompetition * releaseDev * pressure * devAttraction * trustFactor * (company.hub === 'developer' ? 1.1 : 1);
  const acquiredEnt = 6 * market.enterpriseDemand * focusEnt * entPriceDemand * priceCompetition * entAttraction * trustFactor * (company.hub === 'enterprise' ? 1.15 : 1);
  const retention = clamp(0.62 + company.trust / 400 + reliability / 80 - (plan.price === 'premium' && premiumFit < 0.65 ? 0.12 : 0), 0.45, 0.95);
  const wantedDev = Math.round(company.developers * retention + acquiredDev);
  const wantedEnt = Math.round(company.enterprise * retention + acquiredEnt);
  const capacity = Math.round(44 + reliability * 4);
  const load = wantedDev + wantedEnt * 3;
  const served = load > capacity ? capacity / load : 1;
  const developers = Math.floor(wantedDev * served);
  const enterprise = Math.floor(wantedEnt * served);
  const unserved = wantedDev + wantedEnt - developers - enterprise;
  const devRate = plan.price === 'low' ? 1.2 : plan.price === 'standard' ? 2 : 2.8;
  const entRate = plan.price === 'low' ? 3 : plan.price === 'standard' ? 5 : 8;
  const paidDev = company.release === 'open' ? 0.72 : company.release === 'core' ? 0.88 : 1;
  const paidEnt = company.release === 'open' ? 0.88 : company.release === 'core' ? 0.94 : 1;
  const revenue = money((developers * devRate * paidDev + enterprise * entRate * paidEnt) * market.revenueFactor * (market.openPressure && company.release === 'closed' ? 0.82 : 1));
  const operatingCost = hubs.find(h => h.id === company.hub)!.operatingCost + (company.release === 'core' ? 3 : 0);
  const serviceCost = money((developers * 0.32 + enterprise * 1.1) * market.serviceFactor * (1 - reliability * 0.035));
  const cash = money(company.cash - investment.cost + revenue - operatingCost - serviceCost);
  const trust = Math.round(clamp(company.trust + (served >= 0.95 ? 4 : -Math.ceil((1 - served) * 24)) + (reliability >= 5 ? 2 : 0) - (plan.price === 'premium' && premiumFit < 0.65 ? 5 : 0), 0, 100));
  const explanations: string[] = [];
  if (!submitted) explanations.push('No plan submitted: previous focus and price continued, with no new investment. Round one defaults to both markets and standard pricing.');
  if (investment.cost) explanations.push(`${investment.title} investment cost ${investment.cost} cash. Capabilities carry forward, with diminishing gains near 10.`);
  else explanations.push('You preserved cash. Your existing capabilities still determine acquisition and capacity.');
  explanations.push(`${developers} developers and ${enterprise} enterprise customers produced ${revenue} revenue; operations and service cost ${money(operatingCost + serviceCost)}.`);
  if (unserved) explanations.push(`${unserved} potential customers could not be served. Capacity is ${capacity} units; each enterprise uses 3. Lost service reduced trust.`);
  else explanations.push(`Your ${capacity}-unit capacity covered demand. Dependable service improved trust.`);
  if (plan.price === 'premium' && premiumFit < 0.65) explanations.push('Premium pricing exceeded the capabilities your target buyers expect. Acquisition, retention and trust were reduced.');
  if (market.revenueFactor < 1) explanations.push('Last round’s widespread price cuts reduced this round’s revenue per customer by 15%.');
  if (market.openPressure && company.release === 'closed') explanations.push('Open alternatives reduced your new developer acquisition by 15% and revenue per customer by 18%.');
  const result: RoundResult = { round: market.round, openingCash: company.cash, investmentCost: investment.cost, revenue, operatingCost, serviceCost, closingCash: cash,
    developers, enterprise, trust, quality, reliability, ecosystem, capacity, unserved, plan, missed: !submitted, explanations };
  return { ...company, cash, developers, enterprise, trust, quality, reliability, ecosystem, failed: cash <= 0, history: [...company.history, result] };
}

export function closeRound(snapshot: Snapshot, plans: Record<string, Plan>, round: number): Snapshot {
  const companies = snapshot.companies.map(c => resolveCompany(c, plans[c.id], snapshot.markets[round]));
  const markets = [...snapshot.markets];
  const next = nextMarket(snapshot.companies, plans, Math.min(round + 1, 3));
  if (round < rounds.length - 1) {
    // Use the capabilities at the start of the closed round and its actual plans.
    markets.push(next);
  }
  return { companies, markets, lastMix: next.mix };
}
export function rankCompanies(companies: Company[]): Company[] {
  return [...companies].sort((a, b) => Number(a.failed) - Number(b.failed) || b.cash - a.cash || a.name.localeCompare(b.name));
}
