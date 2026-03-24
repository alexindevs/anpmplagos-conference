import Image from "next/image";
import Link from "next/link";
import { getPublicCompanies, type PublicCompany } from "@/lib/api";

const FOOTER_LOGO_SLOTS = 4;

function companySlug(c: PublicCompany): string {
  const s = c.slug?.trim();
  if (s) return encodeURIComponent(s);
  return encodeURIComponent(c.id);
}

function companyLogoUrl(c: PublicCompany): string {
  return (c.headerImage?.trim() || c.profileImage?.trim() || "");
}

export default async function Footer() {
  let topCompanies: PublicCompany[] = [];
  try {
    const all = await getPublicCompanies();
    topCompanies = all.slice(0, FOOTER_LOGO_SLOTS);
  } catch {
    topCompanies = [];
  }

  const slots: (PublicCompany | null)[] = Array.from(
    { length: FOOTER_LOGO_SLOTS },
    (_, i) => topCompanies[i] ?? null
  );

  return (
    <footer className="bg-secondary text-white py-16" id="contact">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/anpmp-logo.jpg"
                alt="ANPMP"
                width={140}
                height={48}
                className="h-10 w-auto object-contain md:h-12"
              />
              <h2 className="text-2xl font-bold">ANPMP</h2>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              The Association of Nigerian Private Medical Practitioners.
              Committed to enhancing healthcare delivery across the nation.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white hover:underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-white hover:underline"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white hover:underline"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  mail
                </span>
                info@anpmpconference.org
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  call
                </span>
                +234 800 ANPMP 00
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  location_on
                </span>
                Lagos, Nigeria
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  public
                </span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  share
                </span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  videocam
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 mt-8">
          <p className="text-center text-white/60 text-sm mb-6">
            Our Sponsors & Partners
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-90">
            {slots.map((c, i) => {
              const image = c ? companyLogoUrl(c) : "";
              const box = (
                <div className="relative flex h-10 w-28 items-center justify-center rounded-md bg-white/95 px-2 py-1 shadow-sm">
                  {image ? (
                    <Image
                      src={image}
                      alt={c ? `${c.companyName} logo` : "Partner"}
                      width={112}
                      height={40}
                      className="max-h-8 w-auto max-w-full object-contain object-center"
                    />
                  ) : (
                    <div
                      className="h-6 w-20 rounded bg-neutral-200/80"
                      aria-hidden
                    />
                  )}
                </div>
              );
              if (!c) {
                return (
                  <div key={`footer-partner-slot-${i}`} className="shrink-0">
                    {box}
                  </div>
                );
              }
              return (
                <Link
                  key={c.id}
                  href={`/company/${companySlug(c)}`}
                  className="shrink-0 transition-opacity hover:opacity-100"
                >
                  {box}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-12 text-xs text-white/50">
          © 2026 Association of Nigerian Private Medical Practitioners. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
