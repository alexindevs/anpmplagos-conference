"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExhibitorProduct, updateExhibitorProduct, type ExhibitorProduct } from "@/lib/api";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ExhibitorProduct | null;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  /** New file chosen in this session (uploaded on save). */
  const [imageFile, setImageFile] = useState<File | null>(null);
  /** Local preview for `imageFile` only. */
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setLinkUrl(product.linkUrl || "");
      setSortOrder(product.sortOrder ?? 0);
      setImageFile(null);
      setImagePreviewUrl(null);
    } else {
      setName("");
      setDescription("");
      setLinkUrl("");
      setSortOrder(0);
      setImageFile(null);
      setImagePreviewUrl(null);
    }
    setFormError(null);
  }, [isOpen, product]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const mutation = useMutation({
    mutationFn: async () => {
      const base = {
        name,
        description: description.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
        sortOrder,
      };
      if (product) {
        return updateExhibitorProduct(product.id, base, imageFile ?? undefined);
      }
      if (!imageFile) {
        throw new Error("Add a product image.");
      }
      return createExhibitorProduct(base, imageFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor", "my-products"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!product && !imageFile) {
      setFormError("Please upload a product image.");
      return;
    }
    mutation.mutate();
  };

  const onPickFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Choose an image file (PNG, JPG, WebP, etc.).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Image must be 8 MB or smaller.");
      return;
    }
    setFormError(null);
    setImageFile(file);
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearNewImage = () => {
    setImageFile(null);
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const existingImageUrl = product?.imageUrl?.trim() || null;
  const showPreview = imagePreviewUrl || existingImageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden max-h-[min(90vh,720px)]">
        <div className="flex items-center justify-between p-6 border-b border-primary/10 shrink-0">
          <h2 className="text-xl font-black text-[#181112]">
            {product ? "Edit product" : "Add product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Product name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Product image</label>
            <p className="text-xs text-slate-500 mb-2">
              Upload a photo for this product. Shown on your public exhibitor profile.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-wrap items-start gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-[#181112] hover:border-primary hover:text-primary transition-colors"
              >
                {imageFile || existingImageUrl ? "Change image" : "Upload image"}
              </button>
              {imageFile ? (
                <button
                  type="button"
                  onClick={clearNewImage}
                  className="text-sm font-semibold text-slate-500 hover:text-red-600"
                >
                  Remove new image
                </button>
              ) : null}
            </div>
            {showPreview ? (
              <div className="mt-3 relative w-full max-w-[200px] aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- user upload or API URL */}
                <img
                  src={imagePreviewUrl || existingImageUrl || ""}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Product link <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Where visitors go for more detail — your website, a product page, brochure, or order
              form. Shown as &quot;Learn more&quot; on your public profile and opens in a new tab.
            </p>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/your-product"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Display order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full max-w-[120px] rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Lower numbers appear first in your showcase.</p>
          </div>

          {(formError || mutation.isError) && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {formError ||
                (mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to save product. Please try again.")}
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
              {mutation.isPending ? "Saving…" : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
