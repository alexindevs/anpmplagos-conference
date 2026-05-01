"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAdminPositions,
  updatePosition,
  listCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  type CandidateWithVoteCount,
  ApiError,
} from "@/lib/api";
import { toast } from "sonner";

export default function EditPositionPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  // ── Position data ───────────────────────────────────────────────────────────
  const { data: allPositions, isLoading: loadingPositions } = useQuery({
    queryKey: ["admin", "elections", "positions"],
    queryFn: listAdminPositions,
  });
  const position = allPositions?.find((p) => p.id === id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [editInit, setEditInit] = useState(false);

  // Initialise form once position loads
  if (position && !editInit) {
    setTitle(position.title);
    setDescription(position.description ?? "");
    setOrder(String(position.order));
    setEditInit(true);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updatePosition(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        order: Number(order) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "elections", "positions"] });
      toast.success("Position updated.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Candidates ──────────────────────────────────────────────────────────────
  const { data: candidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ["admin", "elections", "candidates", id],
    queryFn: () => listCandidates(id),
  });

  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<CandidateWithVoteCount | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateBio, setCandidateBio] = useState("");
  const [confirmDeleteCandidate, setConfirmDeleteCandidate] =
    useState<CandidateWithVoteCount | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const dismissCandidateForm = useCallback(() => {
    setAvatarPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setEditingCandidate(null);
    setCandidateName("");
    setCandidateBio("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setShowCandidateForm(false);
  }, []);

  const openAddCandidate = () => {
    setAvatarPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setEditingCandidate(null);
    setCandidateName("");
    setCandidateBio("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setShowCandidateForm(true);
  };

  const openEditCandidate = (c: CandidateWithVoteCount) => {
    setAvatarPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return c.avatar ?? null;
    });
    setEditingCandidate(c);
    setCandidateName(c.name);
    setCandidateBio(c.bio ?? "");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setShowCandidateForm(true);
  };

  const saveCandidateMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", candidateName.trim());
      if (candidateBio.trim()) fd.append("bio", candidateBio.trim());
      const file = avatarInputRef.current?.files?.[0];
      if (file) fd.append("avatar", file);

      if (editingCandidate) {
        return updateCandidate(editingCandidate.id, fd);
      }
      return createCandidate(id, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin", "elections", "candidates", id],
      });
      qc.invalidateQueries({ queryKey: ["admin", "elections", "positions"] });
      toast.success(
        editingCandidate ? "Candidate updated." : "Candidate added."
      );
      dismissCandidateForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (cid: string) => deleteCandidate(cid),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin", "elections", "candidates", id],
      });
      qc.invalidateQueries({ queryKey: ["admin", "elections", "positions"] });
      toast.success("Candidate removed.");
      setConfirmDeleteCandidate(null);
    },
    onError: (err: Error) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to delete candidate."
      );
    },
  });

  useEffect(() => {
    if (!showCandidateForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissCandidateForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCandidateForm, dismissCandidateForm]);

  if (loadingPositions) {
    return (
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="w-full space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-white/5" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        </div>
      </main>
    );
  }

  if (!position) {
    return (
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="w-full">
          <p className="text-slate-500">Position not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="w-full space-y-8">
        {/* Back + breadcrumb */}
        <div className="space-y-3">
          <Link
            href="/admin/dashboard/elections/positions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary dark:text-white/60"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to positions
          </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-white/50">
          <Link href="/admin/dashboard/elections" className="hover:text-primary">
            Elections
          </Link>
          <span>/</span>
          <Link
            href="/admin/dashboard/elections/positions"
            className="hover:text-primary"
          >
            Positions
          </Link>
          <span>/</span>
          <span className="truncate">{position.title}</span>
        </div>
        </div>

        {/* Edit position form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-background-dark-soft">
          <h2 className="mb-4 text-lg font-bold text-[#181112] dark:text-white">
            Edit Position
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="w-full sm:w-32">
                <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
                  Display Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
                className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
              >
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </section>

        {/* Candidates section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-[#181112] dark:text-white">
              Candidates{" "}
              <span className="text-sm font-medium text-slate-500 dark:text-white/50">
                ({candidates?.length ?? 0})
              </span>
            </h2>
            <button
              type="button"
              onClick={openAddCandidate}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 sm:w-auto"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Candidate
            </button>
          </div>

          {loadingCandidates ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5"
                />
              ))}
            </div>
          ) : !candidates?.length ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-white/10">
              <span className="material-symbols-outlined text-[40px] text-slate-300 dark:text-white/20">
                person_add
              </span>
              <p className="mt-2 text-sm text-slate-500 dark:text-white/50">
                No candidates yet — add the first one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-background-dark-soft sm:flex-row sm:items-center"
                >
                  {/* Avatar */}
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                    {c.avatar ? (
                      <Image
                        src={c.avatar}
                        alt={c.name}
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[24px] text-primary">
                        person
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#181112] dark:text-white">
                      {c.name}
                    </p>
                    {c.bio && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-white/50">
                        {c.bio}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-white/30">
                      {c._count.votes} vote{c._count.votes !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:ml-auto sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openEditCandidate(c)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-primary/30 hover:text-primary dark:border-white/10 dark:text-white/60"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        edit
                      </span>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCandidate(c)}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        delete
                      </span>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add/Edit candidate modal */}
      {showCandidateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <button
            type="button"
            className="fixed inset-0 z-0 bg-black/40"
            aria-label="Close dialog"
            onClick={dismissCandidateForm}
          />
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="candidate-modal-title"
              className="relative z-10 mb-4 w-full rounded-2xl bg-white p-5 shadow-xl sm:mb-0 sm:w-11/12 lg:w-10/12 xl:w-4/5 dark:bg-background-dark-soft"
            >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2
                id="candidate-modal-title"
                className="text-lg font-bold text-[#181112] dark:text-white"
              >
                {editingCandidate ? "Edit Candidate" : "Add Candidate"}
              </h2>
              <button
                type="button"
                onClick={dismissCandidateForm}
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#181112] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="space-y-4">
              {/* Avatar upload */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Preview"
                      width={64}
                      height={64}
                      unoptimized={avatarPreview.startsWith("blob:")}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[30px] text-primary">
                      person
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
                    Photo
                  </label>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="mt-1 text-xs text-slate-600 dark:text-white/60"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setAvatarPreview((prev) => {
                        if (prev?.startsWith("blob:"))
                          URL.revokeObjectURL(prev);
                        if (file) return URL.createObjectURL(file);
                        return editingCandidate?.avatar ?? null;
                      });
                    }}
                  />
                  <p className="text-[10px] text-slate-400">
                    JPEG/PNG, max 5 MB
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
                  Bio / Short description
                </label>
                <textarea
                  value={candidateBio}
                  onChange={(e) => setCandidateBio(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={dismissCandidateForm}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 sm:w-auto dark:border-white/10 dark:text-white/60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saveCandidateMutation.isPending || !candidateName.trim()}
                onClick={() => saveCandidateMutation.mutate()}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
              >
                {saveCandidateMutation.isPending
                  ? "Saving…"
                  : editingCandidate
                  ? "Save Changes"
                  : "Add Candidate"}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete candidate confirmation */}
      {confirmDeleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <button
            type="button"
            className="fixed inset-0 z-0 bg-black/40"
            aria-label="Close dialog"
            onClick={() => setConfirmDeleteCandidate(null)}
          />
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
            <div className="relative z-10 mb-4 w-full rounded-2xl bg-white p-5 shadow-xl sm:mb-0 sm:w-11/12 lg:w-8/12 xl:w-2/5 dark:bg-background-dark-soft">
            <h2 className="text-lg font-bold text-[#181112] dark:text-white">
              Remove candidate?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
              <strong>{confirmDeleteCandidate.name}</strong> has received{" "}
              <strong>{confirmDeleteCandidate._count.votes}</strong> vote
              {confirmDeleteCandidate._count.votes !== 1 ? "s" : ""}.
              {confirmDeleteCandidate._count.votes > 0
                ? " Removal will be blocked because votes have already been cast."
                : " This cannot be undone."}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDeleteCandidate(null)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 sm:w-auto dark:border-white/10 dark:text-white/60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteCandidateMutation.isPending}
                onClick={() =>
                  deleteCandidateMutation.mutate(confirmDeleteCandidate.id)
                }
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
              >
                {deleteCandidateMutation.isPending ? "Removing…" : "Remove"}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
