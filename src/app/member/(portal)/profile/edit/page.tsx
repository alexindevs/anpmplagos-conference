"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMyRegistration, updateMemberProfile, type MemberProfile } from "@/lib/api";
import { MemberPortalShell } from "@/app/member/components/MemberPortalShell";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const SPECIALTY_OPTIONS = [
  { value: "general", label: "General Practice" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "surgery", label: "Surgery" },
  { value: "traditional", label: "Traditional Medicine" },
  { value: "other", label: "Other" },
];

function fieldClass(error?: string) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-charcoal outline-none transition-all focus:ring-2 dark:text-white dark:bg-background-dark-softer ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-slate-200 focus:border-primary focus:ring-primary/20 dark:border-border-dark"
  }`;
}

export default function MemberEditProfilePage() {
  const { data: user } = useAuthSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: registration, isLoading } = useQuery({
    queryKey: ["member", "registration"],
    queryFn: getMyRegistration,
    enabled: !!user,
  });

  const profile = registration?.member as MemberProfile | undefined;
  const userId = user?.id ?? "";
  const fullName = profile?.fullName ?? user?.member?.fullName ?? "Member";

  // Form state — initialised once the profile loads
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    title: "",
    bio: "",
    primarySpecialty: "",
    hospitalOrg: "",
    organizationAddress: "",
    zone: "",
    state: "",
    hasSpouse: false,
    spouseName: "",
    spouseEmail: "",
    spousePhone: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (profile && !seeded) {
      setForm({
        fullName: profile.fullName ?? "",
        phone: profile.phone ?? "",
        title: profile.title ?? "",
        bio: profile.bio ?? "",
        primarySpecialty: profile.primarySpecialty ?? "",
        hospitalOrg: profile.hospitalOrg ?? "",
        organizationAddress: profile.organizationAddress ?? "",
        zone: profile.zone ?? "",
        state: profile.state ?? "",
        hasSpouse: profile.hasSpouse ?? false,
        spouseName: profile.spouseName ?? "",
        spouseEmail: profile.spouseEmail ?? "",
        spousePhone: profile.spousePhone ?? "",
      });
      setSeeded(true);
    }
  }, [profile, seeded]);

  const currentAvatarUrl = profile?.avatar
    ? profile.avatar.startsWith("http")
      ? profile.avatar
      : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${profile.avatar}`
    : null;

  const mutation = useMutation({
    mutationFn: () =>
      updateMemberProfile({
        ...form,
        state: form.state || undefined,
        avatar: avatarFile ?? undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["member", "registration"] });
      router.push("/member/dashboard");
    },
    onError: (e: unknown) => {
      setSaveError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
    },
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    if (!form.primarySpecialty) errs.primarySpecialty = "Please select a specialty.";
    if (!form.hospitalOrg.trim()) errs.hospitalOrg = "Hospital / organization is required.";
    if (form.hasSpouse && !form.spouseName.trim())
      errs.spouseName = "Spouse name is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!validate()) return;
    mutation.mutate();
  }

  if (isLoading) {
    return (
      <MemberPortalShell userId={userId} fullName={fullName}>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="space-y-4">
            <div className="h-10 w-48 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </main>
      </MemberPortalShell>
    );
  }

  if (!profile) {
    return (
      <MemberPortalShell userId={userId} fullName={fullName}>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="text-slate-500">Profile not found.</p>
        </main>
      </MemberPortalShell>
    );
  }

  const displayAvatar = avatarPreview ?? currentAvatarUrl;

  return (
    <MemberPortalShell userId={userId} fullName={fullName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-border-dark dark:bg-background-dark-soft dark:text-white/70"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
          <div className="border-l-4 border-primary pl-4">
            <h1 className="text-2xl font-black text-charcoal dark:text-white">Edit Profile</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
                <h2 className="mb-5 text-base font-black text-charcoal dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr, Prof"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      className={fieldClass(errors.fullName)}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={fieldClass(errors.phone)}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      placeholder="A short professional bio"
                      value={form.bio}
                      onChange={(e) => set("bio", e.target.value)}
                      className={`${fieldClass()} resize-none`}
                    />
                  </div>
                </div>
              </section>

              {/* Professional Information */}
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
                <h2 className="mb-5 text-base font-black text-charcoal dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">business_center</span>
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Specialty <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.primarySpecialty}
                      onChange={(e) => set("primarySpecialty", e.target.value)}
                      className={fieldClass(errors.primarySpecialty)}
                    >
                      <option value="">Select…</option>
                      {SPECIALTY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {errors.primarySpecialty && (
                      <p className="mt-1 text-xs text-red-500">{errors.primarySpecialty}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Hospital / Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.hospitalOrg}
                      onChange={(e) => set("hospitalOrg", e.target.value)}
                      className={fieldClass(errors.hospitalOrg)}
                    />
                    {errors.hospitalOrg && (
                      <p className="mt-1 text-xs text-red-500">{errors.hospitalOrg}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Organization Address
                    </label>
                    <textarea
                      rows={2}
                      value={form.organizationAddress}
                      onChange={(e) => set("organizationAddress", e.target.value)}
                      className={`${fieldClass()} resize-none`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Zone
                    </label>
                    <input
                      type="text"
                      value={form.zone}
                      onChange={(e) => set("zone", e.target.value)}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      State
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      className={fieldClass()}
                    >
                      <option value="">Select your state</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Spouse Information */}
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
                <h2 className="mb-5 text-base font-black text-charcoal dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group</span>
                  Spouse Information
                </h2>
                <label className="mb-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.hasSpouse}
                    onChange={(e) => set("hasSpouse", e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span className="text-sm font-semibold text-charcoal dark:text-white">
                    My spouse will be attending
                  </span>
                </label>
                {form.hasSpouse && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                        Spouse Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.spouseName}
                        onChange={(e) => set("spouseName", e.target.value)}
                        className={fieldClass(errors.spouseName)}
                      />
                      {errors.spouseName && (
                        <p className="mt-1 text-xs text-red-500">{errors.spouseName}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                        Spouse Email
                      </label>
                      <input
                        type="email"
                        value={form.spouseEmail}
                        onChange={(e) => set("spouseEmail", e.target.value)}
                        className={fieldClass()}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                        Spouse Phone
                      </label>
                      <input
                        type="tel"
                        value={form.spousePhone}
                        onChange={(e) => set("spousePhone", e.target.value)}
                        className={fieldClass()}
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar: avatar + save */}
            <aside className="space-y-6">
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
                <h2 className="mb-4 text-sm font-black text-charcoal dark:text-white">Profile Photo</h2>
                <div className="flex flex-col items-center gap-4">
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt="Profile photo"
                      width={120}
                      height={120}
                      className="size-[120px] rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex size-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer">
                      <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-border-dark dark:bg-background-dark-soft dark:text-white/70"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    {displayAvatar ? "Change photo" : "Upload photo"}
                  </button>
                  <p className="text-center text-[11px] text-slate-400 dark:text-white/30">
                    JPEG or PNG, max 5 MB
                  </p>
                </div>
              </section>

              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
                {saveError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                    {saveError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mutation.isPending && (
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  )}
                  {mutation.isPending ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={mutation.isPending}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-border-dark dark:bg-background-dark-soft dark:text-white/70"
                >
                  Cancel
                </button>
              </section>
            </aside>
          </div>
        </form>
      </main>
    </MemberPortalShell>
  );
}
