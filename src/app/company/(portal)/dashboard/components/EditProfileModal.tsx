"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getExhibitorProfile, updateExhibitorProfile, type UpdateExhibitorProfileInput } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const queryClient = useQueryClient();

  type TextFields = Omit<UpdateExhibitorProfileInput, "logo" | "headerImage">;
  const [formData, setFormData] = useState<TextFields>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

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
        whatsappNumber: (profile as { whatsappNumber?: string }).whatsappNumber || "",
      });
      setLogoFile(null);
      setLogoPreview(null);
      setHeaderFile(null);
      setHeaderPreview(null);
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => updateExhibitorProfile({
      ...formData,
      logo: logoFile ?? undefined,
      headerImage: headerFile ?? undefined,
    } as UpdateExhibitorProfileInput),
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

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void,
  ) {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
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

            {/* Image uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Company Logo</label>
                <div
                  className="relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-secondary hover:bg-secondary/5"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview || profile?.logo ? (
                    <Image
                      src={logoPreview ?? profile!.logo!}
                      alt="Logo preview"
                      fill
                      className="rounded-lg object-contain p-2"
                    />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-slate-400">add_photo_alternate</span>
                      <p className="mt-1 text-xs text-slate-500">Click to upload logo</p>
                    </>
                  )}
                  {(logoPreview || profile?.logo) && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <span className="text-xs font-bold text-white">Change</span>
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, setLogoFile, setLogoPreview)}
                />
                <p className="mt-1 text-xs text-slate-400">JPEG, PNG or WebP · max 5 MB</p>
              </div>

              {/* Header image */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Header / Banner Image</label>
                <div
                  className="relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-secondary hover:bg-secondary/5"
                  onClick={() => headerInputRef.current?.click()}
                >
                  {headerPreview || profile?.headerImage ? (
                    <Image
                      src={headerPreview ?? profile!.headerImage!}
                      alt="Header preview"
                      fill
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-slate-400">panorama</span>
                      <p className="mt-1 text-xs text-slate-500">Click to upload banner</p>
                    </>
                  )}
                  {(headerPreview || profile?.headerImage) && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <span className="text-xs font-bold text-white">Change</span>
                    </div>
                  )}
                </div>
                <input
                  ref={headerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, setHeaderFile, setHeaderPreview)}
                />
                <p className="mt-1 text-xs text-slate-400">JPEG, PNG or WebP · max 5 MB · recommended 1200×400 px</p>
              </div>
            </div>

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
                <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber || ""}
                  onChange={handleChange}
                  placeholder="e.g. +2348012345678"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Used for WhatsApp product lead redirects. Falls back to Primary Contact Phone if not set.</p>
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
