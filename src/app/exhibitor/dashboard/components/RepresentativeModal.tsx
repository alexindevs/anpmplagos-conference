"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExhibitorRepresentative, updateExhibitorRepresentative, type ExhibitorRepresentative } from "@/lib/api";

interface RepresentativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  representative?: ExhibitorRepresentative | null;
}

export function RepresentativeModal({ isOpen, onClose, representative }: RepresentativeModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (representative) {
        setName(representative.name);
        setTitle(representative.title);
        setPhone(representative.phone);
      } else {
        setName("");
        setTitle("");
        setPhone("");
      }
    }
  }, [isOpen, representative]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { name, title, phone };
      if (representative) {
        return updateExhibitorRepresentative(representative.id, payload);
      }
      return createExhibitorRepresentative(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor", "representatives"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <h2 className="text-xl font-black text-[#181112]">
            {representative ? "Edit Representative" : "Add Representative"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Job Title / Role</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          {mutation.isError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              Failed to save representative. Please try again.
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save Representative"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
