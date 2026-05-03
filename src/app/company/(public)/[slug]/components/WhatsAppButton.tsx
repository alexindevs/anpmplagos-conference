"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getProductWhatsAppContact, ApiError } from "@/lib/api";

interface WhatsAppButtonProps {
  slug: string;
  productId: string;
  className?: string;
}

export function WhatsAppButton({ slug, productId, className = "" }: WhatsAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const data = await getProductWhatsAppContact(slug, productId);
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error("WhatsApp contact not available.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || "Unable to connect to WhatsApp. Please try again.");
      } else {
        toast.error("Failed to connect to WhatsApp. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors ${className}`}
      title="Chat on WhatsApp"
    >
      Chat on WhatsApp
      {isLoading ? "Connecting..." : ""}
    </button>
  );
}
