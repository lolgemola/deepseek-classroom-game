import { ArrowDownRight, ArrowUpRight, Boxes, Cloud, FlaskConical, Gauge, Handshake, Network, Server, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import type { Market } from "@/lib/simulation";

type Story = { title: string; story: string; icon: LucideIcon; direction: "up" | "down" | "network"; labels: [string, string, string] };
const stories: Record<string, Story> = {
  "price-war": { title: "AI providers launch a price war", story: "Low-cost offers spread across the market. Buyers expect cheaper access and become harder to convince to pay premium prices.", icon: Cloud, direction: "down", labels: ["Prices", "Margins", "Premium demand"] },
  "free-alternatives": { title: "Free models challenge paid packages", story: "With so many companies selling licences, buyers turn to free alternatives. Paid packages need a stronger reason to earn their business.", icon: Boxes, direction: "down", labels: ["Paid packages", "Free alternatives", "Buyer choice"] },
  "platform-power": { title: "Cloud platforms demand a bigger cut", story: "More AI companies depend on the same distribution partners. Platforms use their stronger bargaining position to claim more revenue.", icon: Handshake, direction: "up", labels: ["Platform reach", "Dependence", "Platform cut"] },
  "hosting-crowding": { title: "Hosting providers crowd the market", story: "Similar hosting offers are everywhere. Buyers push prices down, while useful tools and deeper integrations help providers stand out.", icon: Server, direction: "down", labels: ["Providers", "Price pressure", "Differentiation"] },
  "benchmark-race": { title: "Stronger models raise buyer expectations", story: "A wave of research investment puts model quality in the spotlight. Buyers compare performance more closely before choosing a provider.", icon: FlaskConical, direction: "up", labels: ["Research", "Model quality", "Buyer expectations"] },
  "integration-boom": { title: "Businesses want AI that fits their workflow", story: "Developer tools and integrations are gaining momentum. Buyers increasingly value models that work smoothly with their existing systems.", icon: Network, direction: "network", labels: ["Open model", "Developer tools", "Business workflows"] },
  "capacity-squeeze": { title: "AI infrastructure comes under strain", story: "Infrastructure investment has lagged behind growth. Providers face higher delivery costs, including those using partner infrastructure.", icon: Gauge, direction: "up", labels: ["Demand", "Capacity strain", "Delivery costs"] },
  "affordability-gap": { title: "Smaller teams look for affordable AI", story: "Premium offers dominate the market. More buyers start looking for accessible alternatives, creating an opening for lower-priced providers.", icon: Sparkles, direction: "network", labels: ["Premium offers", "Unmet needs", "Affordable access"] },
  "outside-rival": { title: "An outside rival unveils a stronger model", story: "While much of the industry holds onto cash, an outside competitor advances. Buyers pay closer attention to quality when comparing offers.", icon: FlaskConical, direction: "up", labels: ["Cash held back", "Rival progress", "Quality pressure"] },
  steady: { title: "Different business models find their footing", story: "No single approach dominates the industry. Buyers continue exploring a mix of paid packages, partner platforms and supporting services.", icon: ShieldCheck, direction: "network", labels: ["Licensing", "Partnerships", "Services"] },
};

// Concept diagrams: illustrative relationships, not measured market data.
function MarketDiagram({ story }: { story: Story }) {
  const Icon = story.icon;
  const Direction = story.direction === "down" ? ArrowDownRight : story.direction === "up" ? ArrowUpRight : Network;
  return (
    <div className={`market-diagram market-diagram-${story.direction}`} aria-hidden="true">
      <div className="market-diagram-symbol"><Icon size={38} strokeWidth={1.5} /><Direction size={28} strokeWidth={1.8} /></div>
      <div className="market-diagram-bars">
        {story.labels.map((label) => <div className="market-diagram-node" key={label}>{label}</div>)}
      </div>
    </div>
  );
}
export default function MarketNews({ signal }: { signal: Market["signals"][number] }) {
  const story = stories[signal.id];
  return (
    <article className="market-story">
      {story && <MarketDiagram story={story} />}
      <div className="market-story-copy">
        <h3>{story?.title ?? signal.title}</h3>
        {story && <p>{story.story}</p>}
        <p className="market-story-effect"><strong>This round</strong>{signal.effect}</p>
        <details className="market-story-cause"><summary>Why this happened</summary><p>{signal.cause}</p></details>
      </div>
    </article>
  );
}
