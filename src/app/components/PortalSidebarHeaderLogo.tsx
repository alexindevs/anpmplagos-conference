import Image from "next/image";

/** ANPMP mark for portal sidebar headers (uses `public/anpmp-logo.jpeg`). */
export function PortalSidebarHeaderLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-10 w-10 shrink-0 ${className}`}>
      <Image
        src="/anpmp-logo.jpeg"
        alt="ANPMP"
        fill
        className="object-contain"
        sizes="40px"
        priority
      />
    </div>
  );
}
