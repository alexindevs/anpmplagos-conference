import Image from "next/image";
import { companyLogoImageUrl } from "@/lib/company-branding";
import type { CompanyReviewWithCompany } from "@/lib/api";

function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export function ReviewCard({ review }: { review: CompanyReviewWithCompany }) {
  const logo = companyLogoImageUrl(review.company);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-secondary/15 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined text-[18px] ${
              review.rating >= star ? "text-yellow-400" : "text-slate-300"
            }`}
            style={{ fontVariationSettings: review.rating >= star ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        ))}
      </div>

      <p className="flex-1 text-sm leading-relaxed text-[#896165] line-clamp-6">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-secondary/10">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-gray-50">
          {logo ? (
            <Image src={logo} alt="" fill className="object-contain p-1" sizes="40px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-mint-whisper text-medical-green">
              <span className="material-symbols-outlined text-lg">storefront</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-charcoal">{review.company.companyName}</p>
          <p className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
