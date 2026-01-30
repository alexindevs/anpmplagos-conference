"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    pathname === path
      ? "text-primary text-sm font-medium transition-colors"
      : "text-[#181112] text-sm font-medium hover:text-primary transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[#f4f0f0] shadow-sm">
      <div className="px-4 md:px-10 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/anpmp-logo.jpg"
            alt="ANPMP"
            width={120}
            height={40}
            className="h-8 w-auto object-contain md:h-10"
          />
          <h2 className="text-[#181112] text-xl font-bold leading-tight tracking-tight">
            ANPMP
          </h2>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            About
          </Link>
          <Link
            href="/#speakers"
            className="text-[#181112] text-sm font-medium hover:text-primary transition-colors"
          >
            Speakers
          </Link>
          <Link href="/exhibition" className={linkClass("/exhibition")}>
            Exhibition Booth
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/#contact"
            className="hidden sm:block text-[#181112] text-sm font-medium hover:text-primary transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/#register"
            className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-md hover:bg-red-700 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
