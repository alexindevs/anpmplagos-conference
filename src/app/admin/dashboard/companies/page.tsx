"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCompanies,
  patchAdminExhibitor,
  patchAdminCompanyImages,
  ApiError,
  type CompanySummary,
} from "@/lib/api";

// ─── Edit Modal ────────────────────────────────────────────────────────────────

function EditCompanyModal({
  company,
  onClose,
  onSaved,
}: {
  company: CompanySummary;
  onClose: () => void;
  onSaved: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const [companyName, setCompanyName] = useState(company.companyName ?? "");
  const [tagline, setTagline] = useState(company.tagline ?? "");
  const [contactEmail, setContactEmail] = useState(company.contactEmail ?? "");
  const [primaryContactName, setPrimaryContactName] = useState(company.primaryContactName ?? "");
  const [primaryContactPhone, setPrimaryContactPhone] = useState(company.primaryContactPhone ?? "");
  const [website, setWebsite] = useState(company.website ?? "");
  const [sponsorshipTier, setSponsorshipTier] = useState(company.highestSponsorshipTier ?? "");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logo ?? null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(company.headerImage ?? null);

  const logoRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeaderFile(file);
    setHeaderPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await patchAdminExhibitor(company.id, {
        companyName: companyName.trim() || undefined,
        tagline: tagline.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        primaryContactName: primaryContactName.trim() || undefined,
        primaryContactPhone: primaryContactPhone.trim() || undefined,
        website: website.trim() || undefined,
        highestSponsorshipTier: sponsorshipTier || undefined,
      });

      if (logoFile || headerFile) {
        await patchAdminCompanyImages(
          company.id,
          logoFile ?? undefined,
          headerFile ?? undefined,
        );
      }

      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes.");
      setSaving(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="w-[80%] md:w-[50%] rounded-xl bg-white shadow-2xl dark:bg-background-dark-soft">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-border-dark">
          <div>
            <h3 className="text-base font-black text-charcoal dark:text-white">Edit Company</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">{company.companyName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-white/40 dark:hover:bg-background-dark-softer dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* Images row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Logo */}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Logo
              </p>
              <div
                onClick={() => logoRef.current?.click()}
                className="relative flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-secondary/60 dark:border-border-dark dark:bg-background-dark-softer"
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-white/20">
                    add_photo_alternate
                  </span>
                )}
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
              <p className="mt-1 text-center text-[10px] text-slate-400 dark:text-white/30">
                Click to upload · max 5 MB
              </p>
            </div>

            {/* Header image */}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Header Image
              </p>
              <div
                onClick={() => headerRef.current?.click()}
                className="relative flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-secondary/60 dark:border-border-dark dark:bg-background-dark-softer"
              >
                {headerPreview ? (
                  <Image
                    src={headerPreview}
                    alt="Header preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-white/20">
                    image
                  </span>
                )}
              </div>
              <input
                ref={headerRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleHeaderChange}
              />
              <p className="mt-1 text-center text-[10px] text-slate-400 dark:text-white/30">
                Click to upload · max 5 MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short description..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Primary Contact Name
              </label>
              <input
                type="text"
                value={primaryContactName}
                onChange={(e) => setPrimaryContactName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Primary Contact Phone
              </label>
              <input
                type="tel"
                value={primaryContactPhone}
                onChange={(e) => setPrimaryContactPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">
                Sponsorship Tier
              </label>
              <select
                value={sponsorshipTier}
                onChange={(e) => setSponsorshipTier(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              >
                <option value="">Default (no tier)</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="headliner">Headliner</option>
              </select>
              <p className="mt-1 text-xs text-slate-400 dark:text-white/30">
                Manually override the highest sponsorship tier assigned to this company.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-border-dark dark:text-white/80 dark:hover:bg-background-dark-softer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [editingCompany, setEditingCompany] = useState<CompanySummary | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "companies", page, pageSize, search],
    queryFn: () => getAdminCompanies({ page, pageSize, search: search || undefined }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSaved={async () => {
            setEditingCompany(null);
            await queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
          }}
        />
      )}

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">Companies</h2>
            <p className="text-sm text-slate-500 dark:text-white/50">
              Manage company accounts, profiles, and booth assignments
            </p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 w-full flex-1 sm:min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by company or contact name..."
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Total companies
            </p>
            <p className="mt-1 text-2xl font-black text-charcoal dark:text-white">{total}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Page
            </p>
            <p className="mt-1 text-2xl font-black text-secondary">
              {page} / {totalPages}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Company
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Booth
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      Loading companies...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-primary" colSpan={5}>
                      Unable to load companies.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      No companies found.
                    </td>
                  </tr>
                )}
                {(data?.items ?? []).map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {row.logo ? (
                          <Image
                            src={row.logo}
                            alt={row.companyName}
                            width={32}
                            height={32}
                            className="size-8 rounded-lg object-contain ring-1 ring-slate-200 dark:ring-border-dark"
                            unoptimized
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-background-dark-softer">
                            <span className="material-symbols-outlined text-base text-slate-400 dark:text-white/30">
                              business
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-charcoal dark:text-white">{row.companyName}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50">{row.contactEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal dark:text-white/70">{row.primaryContactName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">
                      {row.booth?.name ?? row.booth?.code ?? row.booth?.floorSection ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">
                      {new Date(row.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCompany(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark-softer"
                          title="Edit company"
                        >
                          <span className="material-symbols-outlined text-base">edit_note</span>
                          Edit
                        </button>
                        {row.slug ? (
                          <Link
                            href={`/company/${row.slug}`}
                            target="_blank"
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-background-dark-softer dark:text-white/90 dark:hover:bg-background-dark"
                          >
                            View
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400 dark:bg-background-dark-softer dark:text-white/40 cursor-not-allowed"
                            disabled
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between bg-primary/5 px-6 py-4 dark:bg-background-dark-softer">
            <p className="text-sm text-slate-500 dark:text-white/50">
              Showing page <span className="font-bold text-slate-700 dark:text-white/70">{page}</span> of{" "}
              <span className="font-bold text-slate-700 dark:text-white/70">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
