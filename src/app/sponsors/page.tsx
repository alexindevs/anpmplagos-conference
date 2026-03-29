import Image from "next/image";
import Link from "next/link";
import { companyLogoImageUrl } from "@/lib/company-branding";
import { getPublicCompanies, type PublicCompany } from "@/lib/api";

export const metadata = {
  title: "Our Sponsors - ANPMP Conference",
  description:
    "Connect with our conference sponsors. Discover cutting-edge solutions and industry leaders supporting the ANPMP community.",
};

/** Stable slug for links — list items should include `slug`; fall back to id only if needed. */
function companySlug(e: PublicCompany): string {
  const s = e.slug?.trim();
  if (s) return encodeURIComponent(s);
  return encodeURIComponent(e.id);
}

function displayTier(c: PublicCompany): string {
  const t = (c.highestSponsorshipTier ?? c.effectiveDisplayTier ?? c.tier ?? "").trim().toLowerCase();
  if (!t) return "";
  if (t === "headliner") return "Headliner";
  if (t === "platinum") return "Platinum";
  if (t === "gold") return "Gold";
  if (t === "silver") return "Silver";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const TIER_ORDER = ["headliner", "platinum", "gold", "silver"];

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
    label: "Headliner Sponsors",
    icon: "campaign",
    colorClass: "text-rose-600",
    bgClass: "bg-rose-50/30",
    borderClass: "border-l-rose-500",
    badgeClass: "bg-rose-100 text-rose-700",
  },
  platinum: {
    id: "platinum",
    label: "Platinum Sponsors",
    icon: "workspace_premium",
    colorClass: "text-slate-700",
    bgClass: "bg-slate-50",
    borderClass: "border-l-slate-400",
    badgeClass: "bg-slate-200 text-slate-800",
  },
  gold: {
    id: "gold",
    label: "Gold Sponsors",
    icon: "verified",
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50/30",
    borderClass: "border-l-amber-400",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  silver: {
    id: "silver",
    label: "Silver Sponsors",
    icon: "stars",
    colorClass: "text-gray-500",
    bgClass: "bg-gray-50/50",
    borderClass: "border-l-gray-300",
    badgeClass: "bg-gray-100 text-gray-700",
  },
};

const ICON_PALETTES = [
  { iconBg: "bg-secondary/10 dark:bg-secondary/20", iconColor: "text-secondary", icon: "storefront" as const },
  { iconBg: "bg-green-50 dark:bg-green-900/20", iconColor: "text-green-600 dark:text-green-400", icon: "ecg_heart" as const },
  { iconBg: "bg-purple-50 dark:bg-purple-900/20", iconColor: "text-purple-600 dark:text-purple-400", icon: "neurology" as const },
  { iconBg: "bg-orange-50 dark:bg-orange-900/20", iconColor: "text-orange-600 dark:text-orange-400", icon: "medical_services" as const },
  { iconBg: "bg-teal-50 dark:bg-teal-900/20", iconColor: "text-teal-600 dark:text-teal-400", icon: "vaccines" as const },
  { iconBg: "bg-rose-50 dark:bg-rose-900/20", iconColor: "text-rose-600 dark:text-rose-400", icon: "bloodtype" as const },
];

function paletteForIndex(i: number) {
  return ICON_PALETTES[i % ICON_PALETTES.length]!;
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

  const groupedByTier = companies.reduce((acc, c) => {
    const tier = (c.highestSponsorshipTier ?? c.effectiveDisplayTier ?? c.tier ?? "other")
      .trim()
      .toLowerCase();
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(c);
    return acc;
  }, {} as Record<string, PublicCompany[]>);

  const sortedTiers = Object.keys(groupedByTier).sort((a, b) => {
    const indexA = TIER_ORDER.indexOf(a);
    const indexB = TIER_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <main className="flex min-h-screen w-full grow flex-col items-center">
      <section className="flex w-full max-w-[1280px] flex-col gap-6 px-4 py-10 sm:px-10">
        <div className="flex max-w-2xl flex-col gap-3">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#181112]">
            Our Sponsors
          </h1>
          <p className="text-lg leading-normal text-[#896165]">
            Meet the companies supporting the ANPMP community. Discover cutting-edge solutions from our
            valued sponsors and partners.
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
          {sortedTiers.map((tierKey) => {
            const tierCompanies = groupedByTier[tierKey] || [];
            const config = TIER_CONFIGS[tierKey] || {
              id: tierKey,
              label: tierKey.charAt(0).toUpperCase() + tierKey.slice(1) + " Partners",
              icon: "workspace_premium",
              colorClass: "text-slate-500",
              bgClass: "bg-white",
              borderClass: "border-l-primary/20",
              badgeClass: "bg-slate-100 text-slate-600",
            };

            return (
              <section
                key={tierKey}
                className={`w-full border-b border-gray-100 py-16 last:border-b-0 ${config.bgClass}`}
              >
                <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
                  <div className="mb-10 flex items-center gap-3">
                    <div className={`rounded-full p-2.5 ${config.badgeClass.split(" ")[0]} ${config.colorClass}`}>
                      <span className="material-symbols-outlined text-2xl">{config.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-[#181112]">
                        {config.label}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tierCompanies.map((c, idx) => {
                      const slug = companySlug(c);
                      const image = companyLogoImageUrl(c) || c.headerImage?.trim() || "";
                      const palette = paletteForIndex(idx);
                      const displayTierName = displayTier(c);

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
                                {displayTierName && (
                                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${config.badgeClass}`}>
                                    {displayTierName}
                                  </span>
                                )}
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
