import Image from "next/image";
import Link from "next/link";
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
  return (c.effectiveDisplayTier ?? c.tier ?? "").trim();
}

function isGoldCompany(c: PublicCompany): boolean {
  return displayTier(c).toLowerCase().includes("gold");
}

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

  const goldCompanies = companies.filter(isGoldCompany);
  const gridCompanies =
    goldCompanies.length > 0 ? companies.filter((c) => !isGoldCompany(c)) : companies;
  /** When every company is gold-tier, they only appear in the featured section. */
  const showMorePartnersSection =
    companies.length > 0 && !(goldCompanies.length > 0 && gridCompanies.length === 0);

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

      {/* Gold tier — from unified companies API */}
      {!loadError && goldCompanies.length > 0 ? (
        <section className="w-full border-y border-gray-200 bg-white py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#181112]">Gold Sponsors</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {goldCompanies.map((c) => {
                const slug = companySlug(c);
                const image = c.headerImage?.trim() || c.profileImage?.trim() || "";
                return (
                  <div
                    key={c.id}
                    className="group flex flex-col items-stretch gap-6 rounded-xl border-l-4 border-l-amber-400 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:flex-row"
                  >
                    <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:min-h-48 sm:w-48">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-5xl">verified</span>
                      </div>
                      {image ? (
                        <Image
                          src={image}
                          alt={`${c.companyName} brand image`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 192px"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-bold text-[#181112] transition-colors group-hover:text-primary">
                            {c.companyName}
                          </h3>
                          <span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            Gold
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#896165]">
                          {c.tagline?.trim() || "Sponsor partner"}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Link
                          href={`/company/${slug}`}
                          className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 sm:flex-none"
                        >
                          Visit profile
                        </Link>
                        <button
                          type="button"
                          className="flex size-10 items-center justify-center rounded-lg border border-gray-200 text-[#896165] transition-colors hover:border-primary hover:text-primary"
                        >
                          <span className="material-symbols-outlined">bookmark</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Remaining companies (or full list when no gold tier); hidden if all companies are gold */}
      {!loadError && showMorePartnersSection ? (
        <section className="w-full bg-white px-4 py-12 sm:px-10">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-2 text-gray-500">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#181112]">
                  {goldCompanies.length > 0 ? "More partners" : "All partners"}
                </h2>
                <p className="mt-1 text-sm text-[#896165]">
                  Companies supporting the ANPMP Lagos Conference.
                </p>
              </div>
            </div>

            {gridCompanies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-primary/25 bg-background-light px-6 py-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">storefront</span>
                <p className="mt-4 text-lg font-bold text-[#181112]">No companies listed yet</p>
                <p className="mt-2 text-sm text-[#896165]">
                  Check back soon — profiles appear here once companies complete registration.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gridCompanies.map((exhibitor, index) => {
                  const slug = companySlug(exhibitor);
                  const palette = paletteForIndex(index);
                  const logo = exhibitor.profileImage?.trim() || exhibitor.headerImage?.trim() || "";
                  const tier = displayTier(exhibitor);
                  return (
                    <div
                      key={exhibitor.id}
                      className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-4 flex min-h-16 items-center justify-start gap-3">
                        {logo ? (
                          <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                            <img
                              src={logo}
                              alt={`${exhibitor.companyName} logo`}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex size-16 shrink-0 items-center justify-center rounded-lg ${palette.iconBg} ${palette.iconColor}`}
                          >
                            <span className="material-symbols-outlined">{palette.icon}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold leading-tight text-[#181112] line-clamp-2">
                            {exhibitor.companyName}
                          </h3>
                          {tier ? (
                            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary/80">
                              {tier}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <p className="line-clamp-3 flex-1 text-sm text-[#896165] mb-6">
                        {exhibitor.tagline?.trim() || "View profile for more about this partner."}
                      </p>
                      <Link
                        href={`/company/${slug}`}
                        className="group flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#181112] transition-colors hover:border-primary hover:text-primary"
                      >
                        View details
                        <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
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
