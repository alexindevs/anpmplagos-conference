import Image from "next/image";
import Link from "next/link";
import { companyLogoImageUrl } from "@/lib/company-branding";
import { getPublicCompanies, type PublicCompany } from "@/lib/api";
import {
  isOurValuedSponsorRow,
  normalizedPublicSponsorTierKey,
  publicSponsorTierBadgeLabel,
  publicSponsorTierSectionTitle,
} from "@/lib/public-sponsor-display";

export const metadata = {
  title: "Our Sponsors - ANPMP Lagos Conference",
  description:
    "Connect with our conference sponsors. Discover cutting-edge solutions and industry leaders supporting the ANPMP Lagos community.",
};

/** Stable slug for links — list items should include `slug`; fall back to id only if needed. */
function companySlug(e: PublicCompany): string {
  const s = e.slug?.trim();
  if (s) return encodeURIComponent(s);
  return encodeURIComponent(e.id);
}

const TIER_ORDER = ["headliner", "platinum", "gold", "silver", "bronze"];

interface TierConfig {
  id: string;
  label: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  headliner: {
    id: "headliner",
    label: "Headliner Partners",
    icon: "campaign",
    colorClass: "text-primary",
    bgClass: "bg-mint-whisper",
    borderClass: "border-l-primary",
    badgeClass: "bg-primary text-white",
  },
  platinum: {
    id: "platinum",
    label: "Platinum Partners",
    icon: "workspace_premium",
    colorClass: "text-medical-green",
    bgClass: "bg-white",
    borderClass: "border-l-medical-green",
    badgeClass: "bg-primary text-white",
  },
  gold: {
    id: "gold",
    label: "Gold Partners",
    icon: "verified",
    colorClass: "text-fresh-green",
    bgClass: "bg-white",
    borderClass: "border-l-fresh-green",
    badgeClass: "bg-primary text-white",
  },
  silver: {
    id: "silver",
    label: "Silver Partners",
    icon: "stars",
    colorClass: "text-charcoal",
    bgClass: "bg-white",
    borderClass: "border-l-charcoal/30",
    badgeClass: "bg-primary/80 text-white",
  },
  bronze: {
    id: "bronze",
    label: "Bronze Partners",
    icon: "workspace_premium",
    colorClass: "text-charcoal",
    bgClass: "bg-white",
    borderClass: "border-l-charcoal/30",
    badgeClass: "bg-primary/80 text-white",
  },
};

const ICON_PALETTES = [
  { iconBg: "bg-medical-green/10", iconColor: "text-medical-green", icon: "storefront" as const },
  { iconBg: "bg-fresh-green/10", iconColor: "text-fresh-green", icon: "ecg_heart" as const },
  { iconBg: "bg-deep-forest/10", iconColor: "text-deep-forest", icon: "neurology" as const },
  { iconBg: "bg-primary/10", iconColor: "text-primary", icon: "medical_services" as const },
  { iconBg: "bg-secondary/10", iconColor: "text-secondary", icon: "vaccines" as const },
  { iconBg: "bg-medical-green/10", iconColor: "text-medical-green", icon: "bloodtype" as const },
];

function paletteForIndex(i: number) {
  return ICON_PALETTES[i % ICON_PALETTES.length]!;
}

const RECOGNIZED_SPONSOR_TIERS = new Set(TIER_ORDER);

function partitionSponsorSections(companies: PublicCompany[]) {
  const valued: PublicCompany[] = [];
  const defaultRest: PublicCompany[] = [];
  const byTier: Record<string, PublicCompany[]> = {};

  for (const c of companies) {
    if (isOurValuedSponsorRow(c)) {
      valued.push(c);
      continue;
    }
    const key = normalizedPublicSponsorTierKey(c);
    if (key === "default") {
      defaultRest.push(c);
      continue;
    }
    if (!RECOGNIZED_SPONSOR_TIERS.has(key)) {
      valued.push(c);
      continue;
    }
    if (!byTier[key]) byTier[key] = [];
    byTier[key].push(c);
  }

  const sortedTierKeys = Object.keys(byTier).sort((a, b) => {
    const indexA = TIER_ORDER.indexOf(a);
    const indexB = TIER_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return { valued, defaultRest, sortedTierKeys, byTier };
}

export const revalidate = 120;

export default async function SponsorsPage() {
  let companies: PublicCompany[] = [];
  let loadError: string | null = null;

  try {
    companies = await getPublicCompanies();
  } catch (e) {
    loadError =
      e instanceof Error ? e.message : "Unable to load companies. Please try again later.";
  }

  const { valued, defaultRest, sortedTierKeys, byTier } = partitionSponsorSections(companies);

  const sectionBlocks: {
    key: string;
    companies: PublicCompany[];
    heading: string;
    neutralTier: boolean;
  }[] = [];

  for (const tierKey of sortedTierKeys) {
    const list = byTier[tierKey];
    if (!list?.length) continue;
    sectionBlocks.push({
      key: tierKey,
      companies: list,
      heading:
        TIER_CONFIGS[tierKey]?.label ??
        publicSponsorTierSectionTitle(tierKey),
      neutralTier: false,
    });
  }
  if (defaultRest.length > 0) {
    sectionBlocks.push({
      key: "partners-default",
      companies: defaultRest,
      heading: "Partners",
      neutralTier: true,
    });
  }
  if (valued.length > 0) {
    sectionBlocks.push({
      key: "valued-sponsors",
      companies: valued,
      heading: "Our valued sponsors",
      neutralTier: true,
    });
  }

  return (
    <main className="flex min-h-screen w-full grow flex-col">
      <section className="bg-medical-green py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            Our Sponsors
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Partners supporting ANPMP Lagos 2026 and advancing private healthcare in Nigeria.
          </p>
        </div>
      </section>

      {loadError ? (
        <section className="w-full px-4 pb-12 sm:px-10">
          <div className="mx-auto max-w-[1280px] rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
            <p className="font-semibold">Could not load directory</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        </section>
      ) : null}

      {!loadError && companies.length > 0 ? (
        <div className="flex w-full flex-col gap-0">
          {sectionBlocks.map((block) => {
            const config = block.neutralTier
              ? {
                  id: block.key,
                  label: block.heading,
                  icon: "handshake",
                  colorClass: "text-charcoal",
                  bgClass: "bg-white",
                  borderClass: "border-l-charcoal/20",
                  badgeClass: "bg-primary text-white",
                }
              : TIER_CONFIGS[block.key] || {
                  id: block.key,
                  label: block.heading,
                  icon: "workspace_premium",
                  colorClass: "text-charcoal",
                  bgClass: "bg-white",
                  borderClass: "border-l-charcoal/20",
                  badgeClass: "bg-primary text-white",
                };

            return (
              <section
                key={block.key}
                className={`w-full border-b border-gray-100 py-16 last:border-b-0 ${config.bgClass}`}
              >
                <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
                  <div className="mb-10 flex items-center gap-3">
                    <div className={`rounded-full p-2.5 ${config.bgClass === 'bg-white' ? 'bg-mint-whisper' : config.bgClass} ${config.colorClass}`}>
                      <span className="material-symbols-outlined text-2xl">{config.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-[#181112]">
                        {config.label}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {block.companies.map((c, idx) => {
                      const slug = companySlug(c);
                      const image = companyLogoImageUrl(c) || c.headerImage?.trim() || "";
                      const palette = paletteForIndex(idx);
                      const displayTierName = block.neutralTier ? "" : publicSponsorTierBadgeLabel(c);

                      return (
                        <div
                          key={c.id}
                          className={`group flex flex-col items-stretch gap-5 rounded-2xl border-l-4 ${config.borderClass} bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                        >
                          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gray-50/50">
                            {image ? (
                              <Image
                                src={image}
                                alt={`${c.companyName} logo`}
                                fill
                                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                            ) : (
                              <div className={`flex h-full w-full items-center justify-center ${palette.iconBg} ${palette.iconColor}`}>
                                <span className="material-symbols-outlined text-5xl opacity-40">
                                  {palette.icon}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-lg font-bold leading-tight text-[#181112] transition-colors group-hover:text-primary">
                                  {c.companyName}
                                </h3>
                                {displayTierName ? (
                                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${config.badgeClass}`}>
                                    {displayTierName}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#896165]">
                                {c.tagline?.trim() || "Industry Partner"}
                              </p>
                            </div>

                            <div className="mt-6 flex items-center gap-2">
                              <Link
                                href={`/company/${slug}`}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
                              >
                                View Profile
                                <span className="material-symbols-outlined text-[18px]">
                                  arrow_forward
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      ) : null}

      {!loadError && companies.length === 0 ? (
        <section className="w-full px-4 pb-16 sm:px-10">
          <div className="mx-auto max-w-[1280px] rounded-xl border border-dashed border-primary/25 bg-background-light px-6 py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">storefront</span>
            <p className="mt-4 text-lg font-bold text-[#181112]">No companies listed yet</p>
            <p className="mt-2 text-sm text-[#896165]">
              Check back soon — profiles appear here once companies complete registration.
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
