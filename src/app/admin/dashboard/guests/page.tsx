"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  deleteAdminSpeaker,
  deleteAdminSpecialGuest,
  downloadPrintableBadge,
  generateSpeakerPass,
  getAdminSpeakers,
  getAdminSpecialGuests,
  patchAdminSpeaker,
  patchAdminSpecialGuest,
  postAdminSpeaker,
  postAdminSpecialGuest,
  type AdminConferenceProfilePatchInput,
  type ConferenceHighlightType,
  type ConferenceProfile,
  type ConferenceProfileKind,
} from "@/lib/api";

const SPEAKERS_KEY = ["admin", "speakers"] as const;
const GUESTS_KEY = ["admin", "special-guests"] as const;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,.jpg,.jpeg,.png";

type Tab = "speakers" | "guests";

const emptyForm = {
  name: "",
  role: "",
  qualifications: "",
  byline: "",
  highlightType: "featured" as ConferenceHighlightType,
  description: "",
  websiteLink: "",
  facebookLink: "",
  xLink: "",
  instagramLink: "",
};

export default function AdminGuestsPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("speakers");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ConferenceProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [showAdhocModal, setShowAdhocModal] = useState(false);
  const [adhocForm, setAdhocForm] = useState({
    name: "",
    role: "",
    qualifications: "",
    kind: "speaker" as ConferenceProfileKind,
  });
  const [adhocImage, setAdhocImage] = useState<File | null>(null);
  const [adhocImagePreview, setAdhocImagePreview] = useState<string | null>(null);
  const [adhocError, setAdhocError] = useState<string | null>(null);
  const [generatingPassId, setGeneratingPassId] = useState<string | null>(null);

  const { data: speakers = [], isLoading: spLoading, isError: spErr, error: spError } = useQuery({
    queryKey: SPEAKERS_KEY,
    queryFn: getAdminSpeakers,
  });

  const { data: guests = [], isLoading: sgLoading, isError: sgErr, error: sgError } = useQuery({
    queryKey: GUESTS_KEY,
    queryFn: getAdminSpecialGuests,
  });

  const listError = (e: unknown) =>
    e instanceof ApiError ? ((e.body?.message as string) || e.message) : e instanceof Error ? e.message : null;

  useEffect(() => {
    if (!editing && !showForm) {
      setForm(emptyForm);
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [editing, showForm]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name ?? "",
        role: editing.role ?? "",
        qualifications: editing.qualifications ?? "",
        byline: editing.byline ?? "",
        highlightType:
          (editing.highlightType?.toLowerCase() === "keynote" ? "keynote" : "featured") as ConferenceHighlightType,
        description: editing.description ?? "",
        websiteLink: editing.websiteLink ?? "",
        facebookLink: editing.facebookLink ?? "",
        xLink: editing.xLink ?? "",
        instagramLink: editing.instagramLink ?? "",
      });
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [editing]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: SPEAKERS_KEY });
    void queryClient.invalidateQueries({ queryKey: GUESTS_KEY });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile) throw new Error("Profile photo is required.");
      const base = {
        image: imageFile,
        name: form.name.trim(),
        role: form.role.trim(),
        qualifications: form.qualifications.trim(),
        byline: form.byline.trim(),
        highlightType: form.highlightType,
        description: form.description.trim(),
        websiteLink: form.websiteLink.trim() || undefined,
        facebookLink: form.facebookLink.trim() || undefined,
        xLink: form.xLink.trim() || undefined,
        instagramLink: form.instagramLink.trim() || undefined,
      };
      if (tab === "speakers") return postAdminSpeaker(base);
      return postAdminSpecialGuest(base);
    },
    onSuccess: () => {
      invalidateAll();
      setShowForm(false);
      setForm(emptyForm);
      setImageFile(null);
      setFormError(null);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "Create failed."),
  });

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!editing) throw new Error("Nothing to update.");
      const patch: AdminConferenceProfilePatchInput = {
        name: form.name.trim(),
        role: form.role.trim(),
        qualifications: form.qualifications.trim(),
        byline: form.byline.trim(),
        highlightType: form.highlightType,
        description: form.description.trim(),
        websiteLink: form.websiteLink.trim(),
        facebookLink: form.facebookLink.trim(),
        xLink: form.xLink.trim(),
        instagramLink: form.instagramLink.trim(),
        ...(imageFile ? { image: imageFile } : {}),
      };
      if (editing.kind === "speaker") return patchAdminSpeaker(editing.id, patch);
      return patchAdminSpecialGuest(editing.id, patch);
    },
    onSuccess: () => {
      invalidateAll();
      setEditing(null);
      setForm(emptyForm);
      setImageFile(null);
      setFormError(null);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "Update failed."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (p: ConferenceProfile) => {
      if (p.kind === "speaker") return deleteAdminSpeaker(p.id);
      return deleteAdminSpecialGuest(p.id);
    },
    onSuccess: invalidateAll,
  });

  const adhocPrintMutation = useMutation({
    mutationFn: () => downloadPrintableBadge({ ...adhocForm, imageFile: adhocImage }),
    onSuccess: () => {
      setShowAdhocModal(false);
      setAdhocForm({ name: "", role: "", qualifications: "", kind: "speaker" });
      setAdhocImage(null);
      setAdhocImagePreview(null);
      setAdhocError(null);
    },
    onError: (e) => setAdhocError(e instanceof Error ? e.message : "Badge generation failed."),
  });

  const handleGeneratePass = async (p: ConferenceProfile) => {
    setGeneratingPassId(p.id);
    try {
      const updated = await generateSpeakerPass(p.id, p.kind as ConferenceProfileKind);
      queryClient.setQueryData<ConferenceProfile[]>(
        p.kind === "speaker" ? SPEAKERS_KEY : GUESTS_KEY,
        (old) => old?.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)) ?? old,
      );
    } catch {
      // silently fall through — list will refetch
      invalidateAll();
    } finally {
      setGeneratingPassId(null);
    }
  };

  const handleSubmitAdhoc = (ev: React.FormEvent) => {
    ev.preventDefault();
    setAdhocError(null);
    if (!adhocForm.name.trim() || !adhocForm.role.trim() || !adhocForm.qualifications.trim()) {
      setAdhocError("Name, role, and qualifications are required.");
      return;
    }
    adhocPrintMutation.mutate();
  };

  const busy = createMutation.isPending || patchMutation.isPending || deleteMutation.isPending;
  const list = tab === "speakers" ? speakers : guests;
  const loading = tab === "speakers" ? spLoading : sgLoading;
  const err = tab === "speakers" ? spErr : sgErr;
  const errMsg = tab === "speakers" ? listError(spError) : listError(sgError);

  const handlePickImage = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormError(null);
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!/^image\/(jpeg|png)$/i.test(file.type)) {
      setFormError("Photo must be JPEG or PNG.");
      e.target.value = "";
      setImageFile(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setFormError("Image must be 5MB or smaller.");
      e.target.value = "";
      setImageFile(null);
      return;
    }
    setImageFile(file);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setFormError(null);
    setShowForm(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submitCreate = (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.role.trim() || !form.qualifications.trim() || !form.byline.trim()) {
      setFormError("Name, role, qualifications, and byline are required.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Bio (description) is required.");
      return;
    }
    if (!imageFile) {
      setFormError("Profile photo is required.");
      return;
    }
    createMutation.mutate();
  };

  const submitPatch = (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.role.trim() || !form.qualifications.trim() || !form.byline.trim()) {
      setFormError("Name, role, qualifications, and byline are required.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Bio (description) is required.");
      return;
    }
    patchMutation.mutate();
  };

  const publicUrl = (p: ConferenceProfile) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path =
      p.kind === "speaker"
        ? `/speakers/${encodeURIComponent(p.slug)}`
        : `/special-guests/${encodeURIComponent(p.slug)}`;
    return `${origin}${path}`;
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">Guests</h2>
            <p className="text-sm text-slate-500 dark:text-white/50">
              Manage conference speakers and special guests. No self-registration — profiles are
              curated here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setShowAdhocModal(true); setAdhocError(null); }}
              disabled={busy}
              className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-50"
            >
              Print adhoc badge
            </button>
            <button
              type="button"
              onClick={openCreate}
              disabled={busy}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Add {tab === "speakers" ? "speaker" : "special guest"}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-border-dark">
          <button
            type="button"
            onClick={() => {
              setTab("speakers");
              setShowForm(false);
              setEditing(null);
              setFormError(null);
            }}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              tab === "speakers"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-charcoal dark:text-white/50 dark:hover:text-white"
            }`}
          >
            Speakers ({speakers.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("guests");
              setShowForm(false);
              setEditing(null);
              setFormError(null);
            }}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              tab === "guests"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-charcoal dark:text-white/50 dark:hover:text-white"
            }`}
          >
            Special guests ({guests.length})
          </button>
        </div>

        {formError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {formError}
          </div>
        )}

        {showForm && !editing && (
          <form
            onSubmit={submitCreate}
            className="mb-10 rounded-xl border border-primary/5 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
          >
            <h3 className="mb-4 text-lg font-bold text-charcoal dark:text-white">
              New {tab === "speakers" ? "speaker" : "special guest"}
            </h3>
            <ProfileFormFields
              form={form}
              setForm={setForm}
              imageFile={imageFile}
              onPickImage={handlePickImage}
              fileInputRef={fileRef}
              onFileChange={onFileChange}
              requireImage
              existingImageUrl={null}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating…" : "Create"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium dark:border-border-dark"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {editing && (
          <form
            onSubmit={submitPatch}
            className="mb-10 rounded-xl border border-primary/5 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
          >
            <h3 className="mb-4 text-lg font-bold text-charcoal dark:text-white">Edit {editing.name}</h3>
            <ProfileFormFields
              form={form}
              setForm={setForm}
              imageFile={imageFile}
              onPickImage={handlePickImage}
              fileInputRef={fileRef}
              onFileChange={onFileChange}
              requireImage={false}
              existingImageUrl={editing.profilePicture}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {patchMutation.isPending ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditing(null);
                  setFormError(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium dark:border-border-dark"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {err && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {errMsg || "Unable to load list."}
          </div>
        )}

        <div className="rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-border-dark sm:px-6">
            <h3 className="text-sm font-bold text-charcoal dark:text-white">
              {tab === "speakers" ? "Speakers" : "Special guests"}
            </h3>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading…</p>
          ) : list.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No profiles yet. Use Add to create one.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-border-dark">
              {list.map((p) => (
                <li key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-background-dark-softer">
                      {p.profilePicture ? (
                        <Image src={p.profilePicture} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs font-bold text-slate-400">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-charcoal dark:text-white">{p.name}</p>
                      <p className="text-sm text-slate-600 dark:text-white/60">{p.role}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">
                        {p.highlightType} · slug: {p.slug}
                      </p>
                      <Link
                        href={p.kind === "speaker" ? `/speakers/${p.slug}` : `/special-guests/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                      >
                        View public profile
                      </Link>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {p.qrCodeUrl && (
                      <a
                        href={p.qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 border border-green-200 hover:bg-green-100"
                      >
                        <span className="material-symbols-outlined text-sm">qr_code</span>
                        Pass ready
                      </a>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || generatingPassId === p.id}
                        onClick={() => void handleGeneratePass(p)}
                        className="rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary disabled:opacity-50"
                      >
                        {generatingPassId === p.id ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                            Generating…
                          </span>
                        ) : p.qrCodeUrl ? (
                          "Regenerate pass"
                        ) : (
                          "Generate pass"
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setShowForm(false);
                          setEditing(p);
                          setFormError(null);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-border-dark"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (typeof window !== "undefined" && window.confirm(`Delete ${p.name}?`)) {
                            deleteMutation.mutate(p);
                          }
                        }}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 dark:border-red-900/50 dark:text-red-300"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          void navigator.clipboard.writeText(publicUrl(p));
                        }}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                      >
                        Copy link
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showAdhocModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAdhocModal(false); setAdhocImage(null); if (adhocImagePreview) URL.revokeObjectURL(adhocImagePreview); setAdhocImagePreview(null); } }}
        >
          <div className="w-[80%] md:w-[50%] rounded-2xl bg-white p-6 shadow-2xl dark:bg-background-dark-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-black text-charcoal dark:text-white">Print Adhoc Badge</h3>
              <button
                type="button"
                onClick={() => { setShowAdhocModal(false); setAdhocImage(null); if (adhocImagePreview) URL.revokeObjectURL(adhocImagePreview); setAdhocImagePreview(null); }}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-background-dark-softer"
              >
                <span className="material-symbols-outlined text-xl text-slate-500">close</span>
              </button>
            </div>
            <p className="mb-5 text-sm text-slate-500 dark:text-white/50">
              Generate a printable badge (without QR code) for a non-platform guest.
            </p>
            <form onSubmit={handleSubmitAdhoc} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Name
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
                  value={adhocForm.name}
                  onChange={(e) => setAdhocForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Role / title
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
                  value={adhocForm.role}
                  onChange={(e) => setAdhocForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Chief Medical Officer"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Qualifications
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
                  value={adhocForm.qualifications}
                  onChange={(e) => setAdhocForm((f) => ({ ...f, qualifications: e.target.value }))}
                  placeholder="e.g. MBBS, FRCPS"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Badge type
                </span>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
                  value={adhocForm.kind}
                  onChange={(e) => setAdhocForm((f) => ({ ...f, kind: e.target.value as ConferenceProfileKind }))}
                >
                  <option value="speaker">Speaker</option>
                  <option value="special_guest">Special Guest</option>
                </select>
              </label>
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Profile photo <span className="normal-case font-normal">(optional)</span>
                </span>
                <div className="flex items-center gap-3">
                  {adhocImagePreview ? (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={adhocImagePreview} alt="Preview" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer">
                      <span className="material-symbols-outlined text-2xl text-slate-300">person</span>
                    </div>
                  )}
                  <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark-softer">
                    {adhocImage ? "Change photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setAdhocImage(file);
                        if (adhocImagePreview) URL.revokeObjectURL(adhocImagePreview);
                        setAdhocImagePreview(file ? URL.createObjectURL(file) : null);
                      }}
                    />
                  </label>
                  {adhocImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdhocImage(null);
                        if (adhocImagePreview) URL.revokeObjectURL(adhocImagePreview);
                        setAdhocImagePreview(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  )}
                </div>
              </div>
              {adhocError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {adhocError}
                </p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={adhocPrintMutation.isPending}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {adhocPrintMutation.isPending ? "Generating…" : "Download badge"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAdhocModal(false); setAdhocImage(null); if (adhocImagePreview) URL.revokeObjectURL(adhocImagePreview); setAdhocImagePreview(null); }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium dark:border-border-dark"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileFormFields({
  form,
  setForm,
  imageFile,
  onPickImage,
  fileInputRef,
  onFileChange,
  requireImage,
  existingImageUrl,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  imageFile: File | null;
  onPickImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  requireImage: boolean;
  existingImageUrl: string | null;
}) {
  const field =
    "w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Profile photo {requireImage ? "(required)" : "(optional new image replaces current)"}
        </span>
        <input ref={fileInputRef} type="file" accept={ACCEPT} className="hidden" onChange={onFileChange} />
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onPickImage}
            className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
          >
            Choose JPEG/PNG
          </button>
          <span className="text-xs text-slate-500 dark:text-white/50">
            {imageFile ? imageFile.name : requireImage ? "No file chosen" : "Keep current if unchanged"}
          </span>
        </div>
        {!imageFile && existingImageUrl ? (
          <div className="relative mt-2 size-20 overflow-hidden rounded-lg border border-slate-200 dark:border-border-dark">
            <Image src={existingImageUrl} alt="Current" fill className="object-cover" sizes="80px" />
          </div>
        ) : null}
      </div>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Name
        </span>
        <input
          className={field}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Role / title
        </span>
        <input
          className={field}
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          required
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Qualifications
        </span>
        <input
          className={field}
          value={form.qualifications}
          onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))}
          required
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Byline (short tagline)
        </span>
        <input
          className={field}
          value={form.byline}
          onChange={(e) => setForm((f) => ({ ...f, byline: e.target.value }))}
          required
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Highlight
        </span>
        <select
          className={field}
          value={form.highlightType}
          onChange={(e) =>
            setForm((f) => ({ ...f, highlightType: e.target.value as ConferenceHighlightType }))
          }
        >
          <option value="keynote">Keynote</option>
          <option value="featured">Featured</option>
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Bio (description)
        </span>
        <textarea
          className={field}
          rows={5}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Website (optional)
        </span>
        <input
          className={field}
          type="url"
          placeholder="https://www.example.com"
          value={form.websiteLink}
          onChange={(e) => setForm((f) => ({ ...f, websiteLink: e.target.value }))}
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Facebook (optional)
        </span>
        <input
          className={field}
          type="url"
          placeholder="https://facebook.com/username"
          value={form.facebookLink}
          onChange={(e) => setForm((f) => ({ ...f, facebookLink: e.target.value }))}
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          X (optional)
        </span>
        <input
          className={field}
          type="url"
          placeholder="https://x.com/username"
          value={form.xLink}
          onChange={(e) => setForm((f) => ({ ...f, xLink: e.target.value }))}
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
          Instagram (optional)
        </span>
        <input
          className={field}
          type="url"
          placeholder="https://instagram.com/username"
          value={form.instagramLink}
          onChange={(e) => setForm((f) => ({ ...f, instagramLink: e.target.value }))}
        />
      </label>
    </div>
  );
}
