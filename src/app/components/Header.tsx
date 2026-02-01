"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (path: string) =>
    pathname === path
      ? "text-primary text-sm font-medium transition-colors"
      : "text-[#181112] text-sm font-medium hover:text-primary transition-colors";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = (
    <>
      <Link href="/" className={linkClass("/")}>
        Home
      </Link>
      <Link href="/about" className={linkClass("/about")}>
        About
      </Link>
      <Link
            href="/speakers"
            className={linkClass("/speakers")}
          >
            Speakers
          </Link>
      <Link href="/exhibition" className={linkClass("/exhibition")}>
        Exhibition Booth
      </Link>
    </>
  );

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
          {navLinks}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/#contact"
            className="text-[#181112] text-sm font-medium hover:text-primary transition-colors"
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
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex size-10 items-center justify-center rounded-lg text-[#181112] hover:bg-gray-100 transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="material-symbols-outlined text-[28px]">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 top-[65px] z-40 bg-[#ffffff] transition-opacity duration-200 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-1 px-4 py-6 border-t border-[#f4f0f0] bg-white">
          <Link
            href="/"
            className={`py-3 px-3 rounded-lg ${linkClass("/")}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`py-3 px-3 rounded-lg ${linkClass("/about")}`}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/speakers"
            className={`py-3 px-3 rounded-lg ${linkClass("/speakers")} hover:bg-gray-50`}
            onClick={() => setMenuOpen(false)}
          >
            Speakers
          </Link>
          <Link
            href="/exhibition"
            className={`py-3 px-3 rounded-lg ${linkClass("/exhibition")}`}
            onClick={() => setMenuOpen(false)}
          >
            Exhibition Booth
          </Link>
          <Link
            href="/#contact"
            className="py-3 px-3 rounded-lg text-[#181112] text-sm font-medium hover:text-primary hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          <div className="mt-4 pt-4 border-t border-[#f4f0f0]">
            <Link
              href="/#register"
              className="flex cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold shadow-md hover:bg-red-700 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Register Now
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
