import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-16" id="contact">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/anpmp-logo.jpg"
                alt="ANPMP"
                width={140}
                height={48}
                className="h-10 w-auto object-contain md:h-12"
              />
              <h2 className="text-2xl font-bold">ANPMP</h2>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              The Association of Nigerian Private Medical Practitioners.
              Committed to enhancing healthcare delivery across the nation.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
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
                  About Conference
                </Link>
              </li>
              <li>
                <Link
                  href="/#register"
                  className="hover:text-white hover:underline"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/#schedule"
                  className="hover:text-white hover:underline"
                >
                  Schedule
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  mail
                </span>
                info@anpmpconference.org
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  call
                </span>
                +234 800 ANPMP 00
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
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  public
                </span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  share
                </span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  videocam
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 mt-8">
          <p className="text-center text-white/60 text-sm mb-6">
            Our Sponsors & Partners
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
            <div
              className="h-8 w-24 bg-white/30 rounded"
              data-alt="Sponsor Logo 1"
            />
            <div
              className="h-8 w-24 bg-white/30 rounded"
              data-alt="Sponsor Logo 2"
            />
            <div
              className="h-8 w-24 bg-white/30 rounded"
              data-alt="Sponsor Logo 3"
            />
            <div
              className="h-8 w-24 bg-white/30 rounded"
              data-alt="Sponsor Logo 4"
            />
          </div>
        </div>
        <div className="text-center mt-12 text-xs text-white/50">
          © 2026 Association of Nigerian Private Medical Practitioners. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
