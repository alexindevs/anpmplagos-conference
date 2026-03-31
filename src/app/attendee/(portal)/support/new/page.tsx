"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { ApiError, createSupportTicket, type SupportTicketCategory } from "@/lib/api";
import { SUPPORT_CATEGORY_CHOICES } from "@/lib/support-ticket-labels";

const MAX_FILES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png";

function validateFiles(files: FileList | null): string | null {
  if (!files?.length) return null;
  if (files.length > MAX_FILES) {
    return `You can attach up to ${MAX_FILES} images.`;
  }
  for (let i = 0; i < files.length; i++) {
    const f = files[i]!;
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      return "Only JPEG or PNG images are allowed.";
    }
    if (f.size > MAX_BYTES) {
      return "Each image must be 5 MB or smaller.";
    }
  }
  return null;
}

export default function AttendeeSupportNewPage() {
  const router = useRouter();
  const { data: user } = useAuthSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("other");
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const files = fileInputRef.current?.files ?? null;
      const ferr = validateFiles(files);
      if (ferr) throw new Error(ferr);
      const list = files?.length ? Array.from(files) : undefined;
      return createSupportTicket({
        title,
        category,
        description,
        images: list,
      });
    },
    onSuccess: (res) => {
      router.push(`/attendee/support/${res.id}`);
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError) {
        setFormError(
          typeof e.body?.message === "string" ? e.body.message : e.message || "Could not send your request."
        );
      } else if (e instanceof Error) {
        setFormError(e.message);
      } else {
        setFormError("Could not send your request.");
      }
    },
  });

  const onFilesChange = () => {
    setFileError(validateFiles(fileInputRef.current?.files ?? null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || !description.trim()) {
      setFormError("Please enter a subject and a message.");
      return;
    }
    if (fileError) return;
    mutation.mutate();
  };

  return (
    <>
      <header className="border-b border-primary/15 bg-background-light/95 px-4 py-5 backdrop-blur sm:px-6 sm:py-6 lg:px-8">
        <div className="border-l-4 border-primary pl-4">
          <Link
            href="/attendee/support"
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to support
          </Link>
          <h1 className="text-2xl font-black text-charcoal">New support request</h1>
          <p className="mt-1 text-sm text-slate-600">
            Describe your question or issue. The team will reply by email and you can follow progress here.
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto  w-full max-w-[80%] md:max-w-[50%] space-y-6 rounded-xl border border-primary/20 bg-white p-6 shadow-sm"
        >
          {formError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</div>
          ) : null}

          <div>
            <label htmlFor="support-title" className="block text-sm font-bold text-slate-700">
              Subject
            </label>
            <input
              id="support-title"
              type="text"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label htmlFor="support-category" className="block text-sm font-bold text-slate-700">
              Topic
            </label>
            <select
              id="support-category"
              value={category}
              onChange={(ev) => setCategory(ev.target.value as SupportTicketCategory)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {SUPPORT_CATEGORY_CHOICES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="support-description" className="block text-sm font-bold text-slate-700">
              Message
            </label>
            <textarea
              id="support-description"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={8}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="support-images" className="block text-sm font-bold text-slate-700">
              Screenshots (optional)
            </label>
            <p className="mt-0.5 text-xs text-slate-500">Up to {MAX_FILES} images, JPEG or PNG, 5 MB each.</p>
            <input
              ref={fileInputRef}
              id="support-images"
              type="file"
              accept={ACCEPT}
              multiple
              onChange={onFilesChange}
              className="mt-2 block w-full text-sm text-slate-600"
            />
            {fileError ? <p className="mt-2 text-sm text-red-700">{fileError}</p> : null}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || Boolean(fileError)}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:brightness-110 disabled:opacity-50"
            >
              {mutation.isPending ? "Sending…" : "Submit request"}
            </button>
            <Link
              href="/attendee/support"
              className="inline-flex items-center rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
