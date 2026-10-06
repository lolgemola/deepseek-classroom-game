import { Code2, Building2, Cloud, Sparkles } from "lucide-react";
import { paths, type Company, type Path } from "@/lib/simulation";
export default function CompanyMap({
  company,
  path = company.path ?? "services",
}: {
  company: Company;
  path?: Path;
}) {
  const partner = path === "partnerships";
  return (
    <figure
      className={"company-map " + (partner ? "partner-route" : "direct-route")}
    >
      <figcaption>
        <span className="eyebrow">YOUR BUSINESS AT A GLANCE</span>
        <h3>{paths.find((p) => p.id === path)?.offering}</h3>
      </figcaption>
      <div className="map-layout">
        <div className="map-node community">
          <Code2 aria-hidden="true" />
          <strong>Open community</strong>
          <span>{company.adoption} adopters</span>
        </div>
        <div className="map-link adoption-link">
          <span>← Open model</span>
        </div>
        <div className="map-node company-node">
          <Sparkles aria-hidden="true" />
          <strong>{company.name}</strong>
          <span>{company.trust}/100 community trust</span>
        </div>
        <div className="map-link payment-link">
          <span>
            {partner ? "Distribution → platform" : "← Direct payments"}
          </span>
        </div>
        <div className="map-node customer-node">
          {partner ? (
            <Cloud aria-hidden="true" />
          ) : (
            <Building2 aria-hidden="true" />
          )}
          <strong>{partner ? "Cloud platform" : "Paying accounts"}</strong>
          <span>
            {partner
              ? `${company.dependence}/100 dependence`
              : `${company.developers} developer · ${company.enterprise} enterprise`}
          </span>
        </div>
      </div>
      <div
        className="map-destinations"
        aria-label="Paying customer relationships"
      >
        <div className="map-node">
          <Code2 aria-hidden="true" />
          <strong>Developer accounts</strong>
          <span>{company.developers} paying accounts</span>
          <small>
            {partner
              ? "Platform delivers; revenue is shared"
              : "Direct paid package or service"}
          </small>
        </div>
        <div className="map-node">
          <Building2 aria-hidden="true" />
          <strong>Enterprise accounts</strong>
          <span>{company.enterprise} paying accounts</span>
          <small>
            {partner
              ? "Platform delivers; revenue is shared"
              : "Direct paid package or service"}
          </small>
        </div>
      </div>
      <p className="map-caption">
        {partner
          ? "Platform → customers: more reach and capacity. Customers → platform → company: revenue is shared."
          : "Company → customers: a paid package or service. Customers → company: direct revenue."}{" "}
        Open adoption is separate from paying accounts.
      </p>
      {partner && (
        <p className="small">
          Served accounts: {company.developers} developer · {company.enterprise}{" "}
          enterprise. Dependence is a classroom index, not a probability.
        </p>
      )}
    </figure>
  );
}
