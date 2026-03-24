"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  deleteAdminGalleryItem,
  getAdminGallery,
  postAdminGallery,
  type GalleryItem,
} from "@/lib/api";

const GALLERY_QUERY_KEY = ["admin", "gallery"] as const;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,.jpg,.jpeg,.png";

export default function MediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: items = [], isLoading, isError, error } = useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: getAdminGallery,
  });

  const uploadMutation = useMutation({
    mutationFn: postAdminGallery,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
      setCaption("");
      setPickedFile(null);
      setFormError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (e) => {
      setFormError(e instanceof ApiError ? e.message : "Upload failed.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminGalleryItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    },
  });

  const listError =
    error instanceof ApiError
      ? (error.body?.message as string) || error.message
      : error instanceof Error
        ? error.message
        : null;

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormError(null);
    if (!file) {
      setPickedFile(null);
      return;
    }
    if (!/^image\/(jpeg|png)$/i.test(file.type)) {
      setFormError("Please choose a JPEG or PNG image.");
      e.target.value = "";
      setPickedFile(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setFormError("Image must be 5MB or smaller.");
      e.target.value = "";
      setPickedFile(null);
      return;
    }
    setPickedFile(file);
  };

  const handleSubmitUpload = (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!pickedFile) {
      setFormError("Choose an image first.");
      return;
    }
    uploadMutation.mutate({ image: pickedFile, caption: caption.trim() || undefined });
  };

  const busy = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-slate-100">Media library</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload gallery photos (shown on the public gallery). Videos stay embedded on the site as today.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        {formError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {formError}
          </div>
        )}

        {deleteMutation.isError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {deleteMutation.error instanceof ApiError
              ? deleteMutation.error.message
              : "Could not delete image."}
          </div>
        )}

        {isError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {listError || "Unable to load gallery."}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gallery videos (embedded)
            </p>
            <p className="mt-1 text-2xl font-black text-[#181112] dark:text-slate-100">2</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Day 1 and Day 2 highlight recordings on the public gallery.</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gallery images
            </p>
            <p className="mt-1 text-2xl font-black text-[#181112] dark:text-slate-100">
              {isLoading ? "…" : items.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">JPEG or PNG, max 5MB each.</p>
          </div>
        </div>

        <div className="mb-10 rounded-xl border border-primary/5 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <h3 className="mb-4 text-lg font-bold text-[#181112] dark:text-white">Upload image</h3>
          <form onSubmit={handleSubmitUpload} className="flex flex-col gap-4 sm:max-w-xl">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={handlePickFile}
                disabled={busy}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Choose image
              </button>
              <span className="text-xs text-slate-500 dark:text-white/50">
                {pickedFile ? pickedFile.name : "JPEG or PNG · max 5MB"}
              </span>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                Caption (optional)
              </span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                placeholder="Short description shown under the photo"
                className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-[#181112] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </label>
            <button
              type="submit"
              disabled={busy || !pickedFile}
              className="w-full rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50 sm:w-auto dark:text-primary"
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-primary/5 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <h3 className="mb-4 text-lg font-bold text-[#181112] dark:text-white">Gallery images</h3>
          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-white/50">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-white/50">No images yet. Upload one above.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item: GalleryItem) => (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-slate-200 dark:border-border-dark"
                >
                  <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-background-dark-softer">
                    <Image
                      src={item.imageUrl}
                      alt={item.caption?.trim() || "Gallery"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-col gap-2 border-t border-slate-100 p-3 dark:border-border-dark">
                    <p className="line-clamp-3 text-sm text-slate-700 dark:text-white/80">
                      {item.caption?.trim() || <span className="text-slate-400 dark:text-white/40">No caption</span>}
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!window.confirm("Remove this image from the gallery?")) return;
                        deleteMutation.mutate(item.id);
                      }}
                      className="self-start rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 rounded-xl border border-primary/5 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <h3 className="mb-4 text-lg font-bold text-[#181112] dark:text-white">Last year&apos;s videos</h3>
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <li className="flex flex-col gap-1">
              <span className="font-semibold">Day 1 – Social Night &amp; Opening</span>
              <span className="break-all text-xs text-slate-500 dark:text-slate-400">
                https://youtube.com/live/bpJMqIvRIa8?feature=share
              </span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-semibold">Day 2 – Scientific Sessions &amp; AGM</span>
              <span className="break-all text-xs text-slate-500 dark:text-slate-400">
                https://youtube.com/live/m5M1OByylCY?feature=share
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Video embeds are edited in code for now; gallery photos are managed here.
          </p>
        </div>
      </div>
    </>
  );
}
