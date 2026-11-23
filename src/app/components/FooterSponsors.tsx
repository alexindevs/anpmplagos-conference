"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getPublicCompanies, type PublicCompany } from "@/lib/api";
import { companyLogoImageUrl } from "@/lib/company-branding";

const FOOTER_LOGO_SLOTS = 8;

function companySlug(c: PublicCompany): string {
  const s = c.slug?.trim();
  if (s) return encodeURIComponent(s);
  return encodeURIComponent(c.id);
}

function companyLogoUrl(c: PublicCompany): string {
  return companyLogoImageUrl(c) || c.headerImage?.trim() || "";
}

/**
 * Sponsor logo strip. Signed-in users only: the list is fetched in the browser after the session
 * check, so it never appears in server-rendered HTML that search engines receive.
 */
export default function FooterSponsors() {
  const { data: user } = useAuthSession();

  const { data: companies } = useQuery({
    queryKey: ["sponsors", "footer"],
    queryFn: () => getPublicCompanies({ cache: "no-store" }),
    enabled: !!user,
  });

  if (!user) return null;

  const footerLogos = (companies ?? []).filter((c) => companyLogoUrl(c)).slice(0, FOOTER_LOGO_SLOTS);
  if (footerLogos.length === 0) return null;

  return (
    <div className="border-t border-white/20 pt-8 mt-8">
      <p className="text-center text-white/60 text-sm mb-6">Our Sponsors & Partners</p>
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-90">
        {footerLogos.map((c) => (
          <Link
            key={c.id}
            href={`/company/${companySlug(c)}`}
            className="shrink-0 transition-opacity hover:opacity-100"
          >
            <div className="relative flex h-10 w-28 items-center justify-center">
              <Image
                src={companyLogoUrl(c)}
                alt={`${c.companyName} logo`}
                width={112}
                height={40}
                className="max-h-8 w-auto max-w-full object-contain object-center"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
