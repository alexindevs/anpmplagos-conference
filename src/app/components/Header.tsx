"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authSessionQueryKey, useAuthSession } from "@/hooks/use-auth-session";

export default function Header() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: user } = useAuthSession();
  const prevPathname = useRef<string | null>(null);

  // Header stays mounted across routes; re-check session when the user navigates (e.g. after auth elsewhere).
  useEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      void queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
    }
    prevPathname.current = pathname;
  }, [pathname, queryClient]);

  const linkClass = (path: string) =>
    pathname === path
      ? "text-fresh-green text-sm font-semibold transition-colors border-b-2 border-fresh-green"
      : "text-charcoal text-sm font-medium hover:text-fresh-green transition-colors border-b-2 border-transparent hover:border-fresh-green/30";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  /** Public `/company/:slug` profiles keep this header; portal routes use CompanyPortalShell. */
  const isCompanyPortal =
    pathname.startsWith("/company/dashboard") ||
    pathname.startsWith("/company/floor-plan") ||
    pathname.startsWith("/company/select-booth") ||
    pathname.startsWith("/company/marketing") ||
    pathname.startsWith("/company/booth") ||
    pathname.startsWith("/company/payment-callback") ||
    pathname.startsWith("/company/hotel-room") ||
    pathname.startsWith("/company/order") ||
    pathname.startsWith("/company/cart") ||
    pathname.startsWith("/company/masterclasses") ||
    pathname.startsWith("/company/panels") ||
    pathname.startsWith("/company/presentations") ||
    pathname.startsWith("/company/sessions/") ||
    pathname.startsWith("/company/support") ||
    pathname.startsWith("/company/sponsorship-plans") ||
    pathname.startsWith("/company/tickets") ||
    pathname.startsWith("/company/receipts");

  /** Marketing header only: hide inside admin, company portal, member portal, attendee portal, moderator portal, and hotel booking (portal shell). */
  const hideMarketingHeader =
    pathname.startsWith("/admin") ||
    isCompanyPortal ||
    pathname.startsWith("/member/") ||
    pathname.startsWith("/attendee/") ||
    pathname.startsWith("/moderator") ||
    pathname.startsWith("/hotel-rooms");

  if (hideMarketingHeader) {
    return null;
  }

  const navLinks = (
    <>
      <Link href="/" className={linkClass("/")}>
        Home
      </Link>
      <Link href="/about" className={linkClass("/about")}>
        About
      </Link>
      <Link href="/speakers" className={linkClass("/speakers")}>
        Speakers
      </Link>
      <Link href="/sponsors" className={linkClass("/sponsors")}>
        Sponsors
      </Link>
      <Link href="/gallery" className={linkClass("/gallery")}>
        Gallery
      </Link>
      <Link
        href="/#contact"
        className="text-charcoal text-sm font-medium hover:text-fresh-green transition-colors border-b-2 border-transparent hover:border-fresh-green/30"
      >
        Contact us
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/98 backdrop-blur-md border-b-2 border-mint-whisper shadow-sm">
      <div className="px-4 md:px-10 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/anpmp-logo.jpeg"
            alt="ANPMP"
            width={120}
            height={40}
            className="h-8 w-auto object-contain md:h-10"
          />
          <h2 className="text-charcoal text-xl font-bold leading-tight tracking-tight font-serif">
            ANPMP Lagos
          </h2>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          {user?.regType === "admin" ? (
            <Link
              href="/admin/dashboard"
              className="flex cursor-pointer items-center justify-center rounded h-10 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
            >
              Admin
            </Link>
          ) : null}
          {user?.regType === "company" ? (
            <Link
              href="/company/dashboard"
              className="flex cursor-pointer items-center justify-center rounded h-10 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
            >
              Company portal
            </Link>
          ) : user?.regType === "member" ? (
            <Link
              href="/member/dashboard"
              className="flex cursor-pointer items-center justify-center rounded h-10 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
            >
              Member Portal
            </Link>
          ) : user?.regType === "attendee" ? (
            <Link
              href="/attendee/dashboard"
              className="flex cursor-pointer items-center justify-center rounded h-10 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
            >
              Attendee Portal
            </Link>
          ) : null}
          {!user ? (
            <>
              <Link
                href="/login"
                className="flex cursor-pointer items-center justify-center rounded h-10 px-5 border-2 border-deep-forest text-deep-forest text-sm font-bold hover:bg-deep-forest/10 transition-all"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex cursor-pointer items-center justify-center rounded h-10 px-5 bg-primary text-white text-sm font-bold shadow-md hover:bg-red-700 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                Register Now
              </Link>
            </>
          ) : user.regType !== "admin" &&
            user.regType !== "company" &&
            user.regType !== "member" &&
            user.regType !== "attendee" ? (
            <Link
              href="/register"
              className="text-charcoal text-sm font-medium hover:text-fresh-green transition-colors"
            >
              My registration
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="lg:hidden flex size-10 items-center justify-center rounded text-charcoal hover:bg-mint-whisper transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="material-symbols-outlined text-[28px]">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[65px] z-40 bg-background-light transition-opacity duration-200 ${
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
            href="/sponsors"
            className={`py-3 px-3 rounded-lg ${linkClass("/sponsors")}`}
            onClick={() => setMenuOpen(false)}
          >
            Sponsors
          </Link>
          <Link
            href="/gallery"
            className={`py-3 px-3 rounded-lg ${linkClass("/gallery")}`}
            onClick={() => setMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            href="/#contact"
            className="py-3 px-3 rounded text-charcoal text-sm font-medium hover:text-fresh-green hover:bg-mint-whisper transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Contact us
          </Link>
          <div className="mt-4 pt-4 border-t border-[#f4f0f0] flex flex-col gap-2">
            {user?.regType === "admin" ? (
              <Link
                href="/admin/dashboard"
                className="flex cursor-pointer items-center justify-center rounded h-12 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            ) : null}
            {user?.regType === "company" ? (
              <Link
                href="/company/dashboard"
                className="flex cursor-pointer items-center justify-center rounded h-12 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Company portal
              </Link>
            ) : user?.regType === "member" ? (
              <Link
                href="/member/dashboard"
                className="flex cursor-pointer items-center justify-center rounded h-12 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Member Portal
              </Link>
            ) : user?.regType === "attendee" ? (
              <Link
                href="/attendee/dashboard"
                className="flex cursor-pointer items-center justify-center rounded h-12 px-5 border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Attendee Portal
              </Link>
            ) : null}
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="flex cursor-pointer items-center justify-center rounded h-12 px-5 border-2 border-deep-forest text-deep-forest text-sm font-bold hover:bg-deep-forest/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="flex cursor-pointer items-center justify-center rounded h-12 px-5 bg-primary text-white text-sm font-bold shadow-md hover:bg-red-700 hover:shadow-lg transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Register Now
                </Link>
              </>
            ) : user.regType !== "admin" &&
              user.regType !== "company" &&
              user.regType !== "exhibitor" &&
              user.regType !== "sponsor" ? (
              <Link
                href="/register"
                className="flex cursor-pointer items-center justify-center rounded h-12 px-5 border border-mint-whisper text-charcoal text-sm font-bold hover:border-fresh-green transition-all"
                onClick={() => setMenuOpen(false)}
              >
                My registration
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
