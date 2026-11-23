import Image from "next/image";
import Link from "next/link";
import FooterSponsors from "./FooterSponsors";

export default function Footer() {
  return (
    <footer className="bg-deep-forest text-white py-20" id="contact">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/anpmp-logo.jpeg"
                alt="ANPMP"
                width={140}
                height={48}
                className="h-10 w-auto object-contain md:h-12"
              />
              <h2 className="text-2xl font-serif font-bold">ANPMP Lagos</h2>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Since 1978, ANPMP has represented Nigeria&apos;s private medical practitioners — advocating for better policy, stronger practices, and professional excellence.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white hover:underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-white hover:underline"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white hover:underline"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  mail
                </span>
                admin@anpmplagos-conference.com
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  call
                </span>
                +234 703 661 6909
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  location_on
                </span>
                Lagos, Nigeria
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-6">Follow Us</h3>
            <div className="flex gap-3">
              <a
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-fresh-green transition-all"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  public
                </span>
              </a>
              <a
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-fresh-green transition-all"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  share
                </span>
              </a>
              <a
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-fresh-green transition-all"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  videocam
                </span>
              </a>
            </div>
          </div>
        </div>
        <FooterSponsors />
        <div className="text-center mt-12 text-sm text-white/50 font-mono">
          © 2026 Association of Nigerian Private Medical Practitioners. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
