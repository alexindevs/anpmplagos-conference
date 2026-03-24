import Link from "next/link";
import CountdownTimer from "./components/CountdownTimer";
import HeroBackgroundCarousel from "./components/HeroBackgroundCarousel";

const HERO_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD_kTd-14OPbdWSrY7rK7110uSZau7sXUvP1NIfInnznhVmlVCqwmtO7WiSB-m4udQlcmTw2mO6zKxmgasCK2xc44Qz5LQpCwX_CBD5Hq-ywnSWCHhK05XPI4Abj6FVMRdajOIWKRgNSAAeZuE2t4W5JTFI95RvCCPV42BvuT8MiMmT2H6pbU0KTcx9bezKfLd51JltcihIHnYscTFqichibiqblz0cQuF1vBk82FLpnt3rlwDL7mVwDWBQO6myXVKNfgTxcLpCQsRN",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920",
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <HeroBackgroundCarousel images={HERO_IMAGES} />
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wider mb-4 border border-white/30 uppercase">
            AGM / Scientific Conference
          </span>
          <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 drop-shadow-lg">
            ANPMP Lagos Annual General Conference
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-white/90 text-lg md:text-xl font-medium mb-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">calendar_month</span>
              <span>September 15–16, 2026</span>
            </div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">location_on</span>
              <span>Welcome Hotel, Airport Road, Lagos, Nigeria</span>
            </div>
          </div>
          <a
            className="flex items-center justify-center h-12 px-8 bg-primary text-white text-base font-bold rounded-lg shadow-lg hover:bg-red-700 hover:scale-105 transition-all duration-300"
            href="#register"
          >
            Secure Your Spot
          </a>
        </div>
      </section>

      {/* Theme Section (Serif) */}
      <section className="py-16 px-4 bg-white" id="about">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary font-bold uppercase tracking-widest text-xs mb-3">
            Conference Theme
          </p>
          <h2 className="font-serif text-[#181112] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Theme to be announced
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-8 rounded-full" />
        </div>
      </section>

      {/* Countdown Timer (Circular) */}
      <section className="py-8 bg-background-light">
        <div className="max-w-5xl mx-auto px-4">
          <CountdownTimer />
        </div>
      </section>

      {/* Event Highlights */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#181112] mb-4">
            Event Highlights
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Key experiences across the two days of the ANPMP Lagos AGM / Scientific Conference.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Networking */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">
                diversity_3
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Networking</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Connect with peers, industry leaders, and partners in structured and informal sessions.
            </p>
          </div>
          {/* Keynote Speakers */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">
                record_voice_over
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">
              Keynote Speakers
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Hear from leading voices in private medical practice and health systems.
            </p>
          </div>
          {/* Workshops */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Workshops</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Participate in hands-on clinical and practice-management sessions to sharpen your skills.
            </p>
          </div>
          {/* Exhibitions */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">
                diversity_3
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Exhibitions</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Explore cutting-edge products and services from leading healthcare brands.
            </p>
          </div>
          {/* Sponsor Presentations */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">
                campaign
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">
              Sponsor Presentations
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Hear directly from sponsors on innovations shaping private medical practice.
            </p>
          </div>
          {/* Elections */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">how_to_vote</span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Elections</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Participate in the ANPMP Lagos leadership elections and AGM decisions.
            </p>
          </div>
          {/* Social Night */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">nightlife</span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Social Night</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Unwind on the first night with music, food, and networking in a relaxed setting.
            </p>
          </div>
          {/* Spouse Support Groups */}
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">family_restroom</span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Spouse Support Groups</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Dedicated sessions for spouses to connect, share experiences, and build support networks.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule Overview */}
      <section className="py-20 bg-gray-50" id="schedule">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#181112]">
              Schedule Overview
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -ml-px" />
            <div className="relative mb-12 flex flex-col md:flex-row items-center w-full">
              <div className="w-full md:w-1/2 md:pr-12 md:text-right pl-12 md:pl-0 mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-primary">Day 1: Sep 15</h3>
                <h4 className="text-lg font-semibold text-[#181112]">
                  Arrival, Opening & Social Night
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  Registration, welcome cocktail, opening keynote address, and Social Night.
                </p>
              </div>
              <div className="absolute left-4 md:left-1/2 -ml-3 w-6 h-6 rounded-full border-4 border-white bg-secondary shadow-md z-10" />
              <div className="w-full md:w-1/2 md:pl-12 pl-12" />
            </div>
            <div className="relative mb-12 flex flex-col md:flex-row items-center w-full">
              <div className="w-full md:w-1/2 md:pr-12 md:text-right pl-12 md:pl-0 mb-4 md:mb-0 order-1 md:order-1" />
              <div className="absolute left-4 md:left-1/2 -ml-3 w-6 h-6 rounded-full border-4 border-white bg-primary shadow-md z-10" />
              <div className="w-full md:w-1/2 md:pl-12 pl-12 order-2 md:order-2">
                <h3 className="text-xl font-bold text-primary">Day 2: Sep 16</h3>
                <h4 className="text-lg font-semibold text-[#181112]">
                  Scientific Sessions, AGM & Elections
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  Panel discussions, scientific sessions, exhibition and sponsor presentations, AGM and elections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Tiers */}
      <section className="py-20 px-4 max-w-7xl mx-auto" id="register">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#181112] mb-4">
            Registration Tiers
          </h2>
          <p className="text-gray-600">
            Choose the package that best suits your professional status.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
          {/* Temporarily hidden: only company registration is open.
          <div className="relative flex flex-col p-6 bg-white rounded-xl border-2 border-primary shadow-xl scale-[1.02] z-10 lg:scale-105">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-primary">Member</h3>
              <p className="text-sm text-gray-500">Active ANPMP Lagos Members</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-[#181112]">₦40,000</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  check_circle
                </span>
                <span>Full access to all days</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  check_circle
                </span>
                <span>AGM Voting Rights</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  check_circle
                </span>
                <span>Social Night Entry</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-700 transition-all shadow-md text-center"
            >
              Select
            </Link>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Non-Member</h3>
              <p className="text-sm text-gray-500">
                Other Medical Practitioners
              </p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-[#181112]">₦55,000</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  check_circle
                </span>
                <span>Full access to all days</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">
                  check_circle
                </span>
                <span>Conference materials</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">
                  check_circle
                </span>
                <span>Social Night Entry</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all text-center"
            >
              Select
            </Link>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Speaker</h3>
              <p className="text-sm text-gray-500">Invited conference speakers</p>
            </div>
            <div className="mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-[#181112]">Complimentary</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                <span>Full access to all days</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Speaker profile &amp; byline</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Social Night entry</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all text-center"
            >
              Select
            </Link>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Special Guest</h3>
              <p className="text-sm text-gray-500">Invited dignitaries &amp; special guests</p>
            </div>
            <div className="mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-[#181112]">Complimentary</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                <span>Full access to all days</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Special guest recognition</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Social Night entry</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all text-center"
            >
              Select
            </Link>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Sponsor</h3>
              <p className="text-sm text-gray-500">Sponsors &amp; brand partners</p>
            </div>
            <div className="mb-6">
              <span className="text-xl sm:text-2xl font-bold text-[#181112] leading-tight">
                From ₦1,500,000
              </span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Sponsor listing &amp; visibility</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Logo on materials</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Optional masterclass / panel slots</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all text-center"
            >
              Select
            </Link>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Exhibitor</h3>
              <p className="text-sm text-gray-500">Organizations with exhibition booths</p>
            </div>
            <div className="mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-primary">Based on booth</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Pricing tied to booth selection</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>2 staff passes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Logo on brochure</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all text-center"
            >
              Select
            </Link>
          </div>
          */}
          <div className="relative flex flex-col p-6 bg-white rounded-xl border-2 border-primary shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-primary">Company / Sponsor</h3>
              <p className="text-sm text-gray-500">
                Organizations and companies (booths, sponsorship, masterclasses, and panel sessions)
              </p>
            </div>
            <div className="mb-6">
              <span className="text-xl sm:text-2xl font-bold text-[#181112] leading-tight">
                Plans from portal
              </span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span>Company directory listing</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Logo on materials</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Booth selection after signup</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span>Sponsorship and paid plans</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-700 transition-all shadow-md text-center"
            >
              Select
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Details */}
      <section className="py-20 bg-gray-50" id="venue">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-stretch h-full">
          <div className="w-full md:w-1/3 flex flex-col justify-center gap-6">
            <div>
              <h2 className="text-3xl font-bold text-[#181112] mb-2">
                Venue & Location
              </h2>
              <p className="text-gray-600">
                Join us at the heart of Lagos for this transformative event.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">
                  location_on
                </span>
                <div>
                  <h4 className="font-bold text-[#181112]">Welcome Hotel</h4>
                  <p className="text-sm text-gray-600">
                    Welcome Hotel,
                    <br />
                    70 International Airport Road,
                    <br />
                    Ikeja, Lagos, Nigeria
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">
                  phone
                </span>
                <div>
                  <h4 className="font-bold text-[#181112]">Contact Venue</h4>
                  <p className="text-sm text-gray-600">+234 1 277 2700</p>
                </div>
              </div>
            </div>
            <a
              href="https://maps.app.goo.gl/MJSBGuXbku7Y4c4E7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-green-900 transition-colors w-fit"
            >
              <span className="material-symbols-outlined">map</span>
              Get Directions
            </a>
          </div>
          <div className="w-full md:w-2/3 h-[400px] md:h-auto rounded-2xl overflow-hidden shadow-lg bg-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3050.2245262451356!2d3.3248840735677527!3d6.554025822810819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8e11b461cc9b%3A0xe64b54b518150583!2sWelcome%20Centre%20Hotels!5e1!3m2!1sen!2sng!4v1773227657060!5m2!1sen!2sng"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
