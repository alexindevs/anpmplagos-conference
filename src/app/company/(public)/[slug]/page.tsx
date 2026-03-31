import CopyLinkButton from "@/app/components/CopyLinkButton";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getPublicExhibitorBySlug, type PublicExhibitorProfile } from "@/lib/api";
import { companyLogoImageUrl } from "@/lib/company-branding";
import ExhibitorViewTracker from "./ExhibitorViewTracker";
import { WhatsAppButton } from "./components/WhatsAppButton";

export const dynamic = "force-dynamic";

const getProfile = cache(async (slug: string) => getPublicExhibitorBySlug(slug));

function websiteHref(website: string | null): string | null {
  if (!website?.trim()) return null;
  const w = website.trim();
  if (w.startsWith("http://") || w.startsWith("https://")) return w;
  return `https://${w}`;
}

function descriptionParagraphs(description: string): string[] {
  const parts = description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [description.trim()].filter(Boolean);
}

function repInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function boothLocationLine(ex: PublicExhibitorProfile): string {
  if (ex.booth) {
    const { name, size } = ex.booth;
    return size ? `${name} · ${size}` : name;
  }
  if (ex.boothPreference?.trim()) return ex.boothPreference.trim();
  return "To be announced";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exhibitor = await getProfile(slug);
  if (!exhibitor) return { title: "Partner - ANPMP Lagos Conference" };
  return {
    title: `${exhibitor.companyName} | ANPMP Lagos Sponsors`,
    description: exhibitor.tagline ?? exhibitor.description.slice(0, 160),
  };
}

export default async function PublicCompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exhibitor = await getProfile(slug);
  if (!exhibitor) notFound();

  const webHref = websiteHref(exhibitor.website);
  const paragraphs = descriptionParagraphs(exhibitor.description);
  const displayTier = (exhibitor.highestSponsorshipTier ?? exhibitor.effectiveDisplayTier ?? exhibitor.tier)?.trim();
  const tierLabel = displayTier ? `${displayTier.charAt(0).toUpperCase() + displayTier.slice(1)} Partner` : "Conference partner";

  const bannerStyle = exhibitor.headerImage
    ? { backgroundImage: `url("${exhibitor.headerImage}")` }
    : undefined;
  const logoUrl = companyLogoImageUrl(exhibitor);

  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-10 sm:py-10">
      <ExhibitorViewTracker slug={slug} />

      {/* Hero / Profile Header */}
      <div className="relative mb-8 w-full overflow-hidden rounded-xl border border-[#e6e0e0] bg-white shadow-sm">
        <div
          className={`relative h-48 w-full bg-cover bg-center ${!exhibitor.headerImage ? "bg-linear-to-br from-slate-200 to-slate-400" : ""}`}
          style={bannerStyle}
          data-alt="Partner banner"
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        </div>
        <div className="relative -mt-12 px-6 sm:-mt-16 sm:px-10">
          <div className="relative z-10 inline-block overflow-hidden rounded-lg border border-[#e6e0e0] bg-white shadow-md">
            {logoUrl ? (
              <div
                className="h-24 w-24 bg-cover bg-center bg-no-repeat sm:h-32 sm:w-32"
                style={{ backgroundImage: `url("${logoUrl}")` }}
                data-alt={`${exhibitor.companyName} logo`}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center bg-primary/10 text-2xl font-black text-primary sm:h-32 sm:w-32">
                {repInitials(exhibitor.companyName)}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-6 px-6 pb-6 pt-6 sm:flex-row sm:items-start sm:px-10">
          <div className="mb-2 flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#181112] sm:text-3xl">
                {exhibitor.companyName}
              </h1>
              <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="material-symbols-outlined mr-1 text-[14px]">verified</span>
                {tierLabel}
              </span>
            </div>
            {exhibitor.tagline?.trim() ? (
              <p className="text-sm text-[#896165] sm:text-base">{exhibitor.tagline}</p>
            ) : null}
          </div>
          <div className="mb-2 hidden sm:block">
            <CopyLinkButton
              className="rounded-full p-2 text-[#896165] transition-colors hover:bg-[#f4f0f0]"
              title="Copy page link"
            >
              <span className="material-symbols-outlined">share</span>
            </CopyLinkButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          <section className="rounded-xl border border-[#e6e0e0] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#181112]">
              <span className="material-symbols-outlined text-primary">info</span>
              About us
            </h2>
            <div className="max-w-none leading-relaxed text-[#181112]">
              {paragraphs.map((p, i) => (
                <p key={i} className="mb-4 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#181112]">
                <span className="material-symbols-outlined text-primary">grid_view</span>
                Products &amp; services
              </h2>
            </div>
            {exhibitor.products.length === 0 ? (
              <p className="text-sm text-[#896165]">No products listed yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {exhibitor.products.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-lg border border-[#e6e0e0] bg-white transition-shadow hover:shadow-md"
                  >
                    {product.imageUrl ? (
                      <div
                        className="h-48 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url("${product.imageUrl}")` }}
                        data-alt={product.name}
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-[#f4f0f0] text-[#896165]">
                        <span className="material-symbols-outlined text-5xl opacity-40">image</span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 text-lg font-bold text-[#181112]">{product.name}</h3>
                      {product.description?.trim() ? (
                        <p className="mb-4 flex-1 text-sm text-[#896165]">{product.description}</p>
                      ) : (
                        <div className="mb-4 flex-1" />
                      )}
                      <div className="flex items-center gap-3">
                        {product.linkUrl?.trim() ? (
                          <a
                            href={product.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-red-700"
                          >
                            Learn more
                            <span className="material-symbols-outlined ml-1 text-[16px]">open_in_new</span>
                          </a>
                        ) : null}
                        <WhatsAppButton slug={slug} productId={product.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-xl border border-[#e6e0e0] bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="mb-4 text-lg font-bold text-[#181112]">Contact information</h3>
            <div className="mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-[#f4f0f0] p-1.5 text-[#896165]">
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#896165]">Booth</p>
                  <p className="text-sm font-medium text-[#181112]">{boothLocationLine(exhibitor)}</p>
                  {exhibitor.booth?.description?.trim() ? (
                    <p className="mt-1 text-xs text-[#896165]">{exhibitor.booth.description}</p>
                  ) : null}
                </div>
              </div>
              {webHref ? (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-[#f4f0f0] p-1.5 text-[#896165]">
                    <span className="material-symbols-outlined text-[20px]">language</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#896165]">Website</p>
                    <a
                      href={webHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline break-all"
                    >
                      {exhibitor.website}
                    </a>
                  </div>
                </div>
              ) : null}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-[#f4f0f0] p-1.5 text-[#896165]">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#896165]">Email</p>
                  <a
                    href={`mailto:${exhibitor.contactEmail}`}
                    className="text-sm font-medium text-[#181112] hover:text-primary break-all"
                  >
                    {exhibitor.contactEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-[#f4f0f0] p-1.5 text-[#896165]">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#896165]">Primary contact</p>
                  <p className="text-sm font-medium text-[#181112]">{exhibitor.primaryContactName}</p>
                  {exhibitor.primaryContactPhone?.trim() ? (
                    <a
                      href={`tel:${exhibitor.primaryContactPhone.replace(/\s/g, "")}`}
                      className="mt-1 block text-sm text-primary hover:underline"
                    >
                      {exhibitor.primaryContactPhone}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            <Link
              href="/sponsors"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e6e0e0] py-2.5 text-sm font-semibold text-[#181112] transition-colors hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to sponsors
            </Link>
          </div>

          <div className="rounded-xl border border-[#e6e0e0] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#181112]">Booth representatives</h3>
            {(exhibitor.boothReps?.length ?? 0) === 0 ? (
              <p className="text-sm text-[#896165]">No representatives listed.</p>
            ) : (
              <div className="space-y-4">
                {(exhibitor.boothReps ?? []).map((rep) => (
                  <div key={rep.id} className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#e6e0e0] bg-primary/10 text-xs font-bold text-primary">
                      {repInitials(rep.name)}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <p className="truncate text-sm font-bold text-[#181112]">{rep.name}</p>
                      <p className="truncate text-xs text-[#896165]">{rep.title}</p>
                    </div>
                    {rep.phone?.trim() ? (
                      <a
                        href={`tel:${rep.phone.replace(/\s/g, "")}`}
                        className="shrink-0 rounded-lg border border-[#e6e0e0] px-3 py-1.5 text-xs font-medium text-[#181112] transition-colors hover:border-primary hover:text-primary"
                      >
                        Call
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
