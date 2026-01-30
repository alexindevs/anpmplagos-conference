"use client";

import { useState } from "react";

export default function CopyLinkButton({
  className,
  title,
  children,
}: {
  className?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      title={copied ? "Copied!" : title}
    >
      {children}
      {copied && (
        <span className="sr-only" aria-live="polite">
          Link copied to clipboard
        </span>
      )}
    </button>
  );
}
