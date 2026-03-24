"use client";

import { useEffect, useRef } from "react";
import { trackPublicExhibitorProfileView } from "@/lib/api";

const storageKey = (slug: string) => `exhibitor-profile-view:${slug}`;

/** One track-view per browser session per slug (EXHIBITOR-PORTAL.md §6.1). */
export default function ExhibitorViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(storageKey(slug))) return;
      sessionStorage.setItem(storageKey(slug), "1");
    } catch {
      /* private mode / blocked storage — still allow one in-memory fire */
    }
    sent.current = true;
    void trackPublicExhibitorProfileView(slug).catch(() => {
      /* non-blocking */
    });
  }, [slug]);

  return null;
}
