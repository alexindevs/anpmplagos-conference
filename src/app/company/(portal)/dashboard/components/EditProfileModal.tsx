"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getExhibitorProfile, updateExhibitorProfile, type UpdateExhibitorProfileInput } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateExhibitorProfileInput>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["company", "profile"],
    queryFn: getExhibitorProfile,
    enabled: isOpen,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        tagline: profile.tagline || "",
        description: profile.description || "",
        boothPreference: profile.boothPreference || "",
        website: profile.website || "",
        contactEmail: profile.contactEmail || "",
        primaryContactName: profile.primaryContactName || "",
        primaryContactPhone: profile.primaryContactPhone || "",
        hotelBookingUrl: profile.hotelBookingUrl || "",
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateExhibitorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["company", "dashboard"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full md:max-w-[50%] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-black text-charcoal">Edit Company Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  name="primaryContactName"
                  value={formData.primaryContactName || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Primary Contact Phone</label>
                <input
                  type="tel"
                  name="primaryContactPhone"
                  value={formData.primaryContactPhone || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Hotel Booking URL</label>
                <input
                  type="url"
                  name="hotelBookingUrl"
                  value={formData.hotelBookingUrl || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Optional link for staff to book conference hotels. It appears as a button on your dashboard.</p>
              </div>
            </div>

            {mutation.isError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                Failed to update profile. Please try again.
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
                className="rounded-lg bg-secondary px-6 py-2 font-bold text-white transition-colors hover:brightness-110 disabled:opacity-50"
              >
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
