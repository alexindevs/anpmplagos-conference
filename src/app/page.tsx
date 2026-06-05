import Link from "next/link";
import CountdownTimer from "./components/CountdownTimer";
import HeroBackgroundCarousel from "./components/HeroBackgroundCarousel";
import { FAQItem } from "./components/FAQItem";
import { RegistrationPriceTag } from "./components/RegistrationPriceTag";

const HERO_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD_kTd-14OPbdWSrY7rK7110uSZau7sXUvP1NIfInnznhVmlVCqwmtO7WiSB-m4udQlcmTw2mO6zKxmgasCK2xc44Qz5LQpCwX_CBD5Hq-ywnSWCHhK05XPI4Abj6FVMRdajOIWKRgNSAAeZuE2t4W5JTFI95RvCCPV42BvuT8MiMmT2H6pbU0KTcx9bezKfLd51JltcihIHnYscTFqichibiqblz0cQuF1vBk82FLpnt3rlwDL7mVwDWBQO6myXVKNfgTxcLpCQsRN",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920",
];

export default function Home() {
  return (
    <>
      {/* Hero Section - Split Screen Editorial */}
      <section className="relative w-full min-h-175 md:min-h-150 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Content */}
        <div className="w-full md:w-[55%] bg-deep-forest px-6 md:px-12 lg:px-20 py-16 md:py-20 flex items-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="inline-block py-1.5 px-4 bg-fresh-green/20 text-fresh-green text-xs font-bold tracking-widest mb-6 uppercase border border-fresh-green/30">
              ANPMP Lagos
            </span>
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight mb-6">
               2026 Annual General Meeting & Scientific Conference
            </h1>
            <p className="text-white/90 text-xl md:text-2xl font-serif italic mb-8 leading-relaxed">
              Where Nigeria&apos;s Private Practitioners Lead
            </p>
            <div className="flex flex-col gap-4 text-white/80 text-base font-mono mb-10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-fresh-green">calendar_month</span>
                <span>September 15–16, 2026</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-fresh-green">location_on</span>
                <span>Welcome Centre Hotels, Ikeja, Lagos</span>
              </div>
            </div>
            <a
              className="inline-flex items-center justify-center h-14 px-10 bg-primary text-white text-base font-bold shadow-lg hover:bg-red-700 hover:shadow-xl transition-all hover:-translate-y-1 animate-slide-in-left delay-300"
              href="#register"
            >
              Register Now
            </a>
          </div>
        </div>
        
        {/* Right Side - Image with Diagonal Cut */}
        <div className="w-full md:w-[45%] relative h-100 md:h-auto">
          <div className="absolute inset-0 bg-linear-to-br from-medical-green/40 to-deep-forest/60 z-10" />
          <HeroBackgroundCarousel images={HERO_IMAGES} />
          {/* Diagonal separator for desktop */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-20 bg-deep-forest" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        </div>
      </section>

      {/* Theme Section */}
      <section className="py-20 px-6 bg-medical-green relative overflow-hidden" id="about">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5">
          <span className="material-symbols-outlined text-[300px] text-white">medical_services</span>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-center gap-10">
            <div className="md:w-1/4">
              <span className="inline-block py-2 px-4 bg-white/20 text-white text-xs font-bold tracking-widest uppercase border border-white/30">
                2026 Theme
              </span>
            </div>
            <div>
              <h2 className="font-serif text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                Medical Negligence Laws: Separating Facts from Fiction
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Timer */}
      <section className="py-12 bg-mint-whisper">
        <div className="max-w-5xl mx-auto px-4">
          <CountdownTimer />
        </div>
      </section>

      {/* Event Highlights */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">
            What to Expect
          </h2>
          <p className="text-warm-gray text-lg mx-auto">
            Two days of learning, networking, and advancing private practice in Nigeria.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Networking */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-fresh-green/10 text-fresh-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">
                diversity_3
              </span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Networking</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Connect with 500+ practitioners from across Lagos and beyond.
            </p>
          </div>
          {/* Keynote Speakers */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-medical-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-medical-green/10 text-medical-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">
                record_voice_over
              </span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">
              Keynote Speakers
            </h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Learn from Nigeria&apos;s leading voices in private healthcare.
            </p>
          </div>
          {/* Workshops */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-fresh-green/10 text-fresh-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Workshops</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Hands-on sessions: clinical skills, practice management, legal compliance.
            </p>
          </div>
          {/* Exhibitions */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-medical-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-medical-green/10 text-medical-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">
                storefront
              </span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Exhibitions</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Explore cutting-edge products from leading healthcare brands.
            </p>
          </div>
          {/* Sponsor Presentations */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-fresh-green/10 text-fresh-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">
                campaign
              </span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">
              Sponsor Presentations
            </h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Innovations shaping private medical practice in Nigeria.
            </p>
          </div>
          {/* Elections */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-medical-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-medical-green/10 text-medical-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">how_to_vote</span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Elections</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              ANPMP Lagos leadership elections and AGM decisions.
            </p>
          </div>
          {/* Social Night */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-fresh-green/10 text-fresh-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">nightlife</span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Social Night</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Evening networking with music, food, and colleagues.
            </p>
          </div>
          {/* Spouse Support Groups */}
          <div className="group flex flex-col p-6 bg-white border-l-4 border-medical-green shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-medical-green/10 text-medical-green flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">family_restroom</span>
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Spouse Support</h3>
            <p className="text-warm-gray text-sm leading-relaxed">
              Dedicated sessions for spouses to connect and build networks.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule Overview */}
      <section className="py-24 bg-mint-whisper" id="schedule">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">
              Two-Day Schedule
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Day 1 */}
            <div className="relative bg-fresh-green p-8 md:p-10 text-white overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-4 right-4 opacity-10">
                <span className="font-mono text-[120px] font-bold leading-none">01</span>
              </div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-mono font-bold mb-4 border border-white/30">
                  SEPTEMBER 15
                </span>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">Day 1</h3>
                <h4 className="text-xl font-bold mb-4 text-white/90">
                  Registration, Opening & Evening Social
                </h4>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                    <span>Delegate registration and welcome</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                    <span>Opening ceremony and keynote address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                    <span>Evening social with music and networking</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Day 2 */}
            <div className="relative bg-medical-green p-8 md:p-10 text-white overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-4 right-4 opacity-10">
                <span className="font-mono text-[120px] font-bold leading-none">02</span>
              </div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-mono font-bold mb-4 border border-white/30">
                  SEPTEMBER 16
                </span>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">Day 2</h3>
                <h4 className="text-xl font-bold mb-4 text-white/90">
                  Scientific Sessions, AGM & Elections
                </h4>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                    <span>Panel discussions and scientific sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                    <span>Exhibition and sponsor presentations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                    <span>AGM and leadership elections</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Tiers */}
      <section className="py-24 px-4 max-w-7xl mx-auto" id="register">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">
            Join 500+ Colleagues
          </h2>
          <p className="text-warm-gray text-lg">
            Select your package:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Member Package */}
          <div className="relative flex flex-col p-8 bg-white border-l-4 border-fresh-green shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-4 right-4 px-3 py-1 bg-fresh-green text-white text-xs font-bold uppercase tracking-wider">
              Popular
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Member</h3>
              <p className="text-sm text-warm-gray">
                Active ANPMP Lagos Members
              </p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-mono font-bold text-charcoal">
                <RegistrationPriceTag type="member" />
              </span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-fresh-green text-xl">check_circle</span>
                <span>Full access to all days</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-fresh-green text-xl">check_circle</span>
                <span>AGM Voting Rights</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-fresh-green text-xl">check_circle</span>
                <span>Social Night Entry</span>
              </li>
            </ul>
            <Link
              href="/register?plan=member"
              className="block w-full py-3 bg-fresh-green text-white font-bold hover:bg-medical-green hover:shadow-lg transition-all text-center hover:-translate-y-0.5"
            >
              Register Now
            </Link>
          </div>

          {/* Non-Member Package */}
          <div className="relative flex flex-col p-8 bg-white border-l-4 border-medical-green shadow-lg hover:shadow-xl transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Non-Member</h3>
              <p className="text-sm text-warm-gray">
                Other Medical Practitioners
              </p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-mono font-bold text-charcoal">
                <RegistrationPriceTag type="nonMember" />
              </span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-medical-green text-xl">check_circle</span>
                <span>Full access to all days</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-medical-green text-xl">check_circle</span>
                <span>Conference materials</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-medical-green text-xl">check_circle</span>
                <span>Social Night Entry</span>
              </li>
            </ul>
            <Link
              href="/register?plan=non-member"
              className="block w-full py-3 bg-medical-green text-white font-bold hover:bg-deep-forest hover:shadow-lg transition-all text-center hover:-translate-y-0.5"
            >
              Register Now
            </Link>
          </div>

          {/* Sponsors & Exhibitors Package */}
          <div className="relative flex flex-col p-8 bg-white border-l-4 border-primary shadow-lg hover:shadow-xl transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Sponsors & Exhibitors</h3>
              <p className="text-sm text-warm-gray">
                Organizations and companies
              </p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-mono font-bold text-charcoal">
                ₦1,500,000+
              </span>
              <p className="text-sm text-warm-gray mt-1">Starting price</p>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-fresh-green text-xl">check_circle</span>
                <span>Company directory listing</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-fresh-green text-xl">check_circle</span>
                <span>Logo on materials</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-fresh-green text-xl">check_circle</span>
                <span>Booth selection after signup</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-charcoal">
                <span className="material-symbols-outlined text-fresh-green text-xl">check_circle</span>
                <span>Sponsorship and exhibition packages</span>
              </li>
            </ul>
            <Link
              href="/register?plan=company"
              className="block w-full py-3 bg-primary text-white font-bold hover:bg-red-700 hover:shadow-lg transition-all text-center hover:-translate-y-0.5"
            >
              Register as Sponsor
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Details */}
      <section className="py-24 bg-mint-whisper" id="venue">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-stretch h-full">
          <div className="w-full md:w-1/3 flex flex-col justify-center gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">
                Event Venue
              </h2>
              <p className="text-warm-gray text-lg">
                Welcome Centre Hotels, Ikeja — premium venue with accommodation on-site.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-fresh-green text-2xl mt-1">
                  location_on
                </span>
                <div>
                  <h4 className="font-bold text-charcoal mb-1">Address</h4>
                  <p className="text-sm text-warm-gray">
                    70 International Airport Road,
                    <br />
                    Ikeja, Lagos, Nigeria
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-fresh-green text-2xl mt-1">
                  phone
                </span>
                <div>
                  <h4 className="font-bold text-charcoal mb-1">Contact</h4>
                  <p className="text-sm text-warm-gray">+234 703 661 6909</p>
                </div>
              </div>
            </div>
            <a
              href="https://maps.app.goo.gl/MJSBGuXbku7Y4c4E7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-green text-white font-bold hover:bg-deep-forest transition-all w-fit hover:-translate-y-0.5 shadow-md hover:shadow-lg"
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

      {/* FAQ Section */}
      <section className="py-24 px-4 max-w-4xl mx-auto" id="faq">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">
            Questions?
          </h2>
          <p className="text-warm-gray text-lg">
            Everything you need to know about attending.
          </p>
        </div>
        <div className="space-y-3">
          <FAQItem 
            question="How do I register for the conference?"
            answer="You can register directly on our website by clicking the &quot;Register Now&quot; button in the navigation bar. Choose the tier that best fits your professional status and follow the instructions to complete your registration and payment."
          />
          <FAQItem 
            question="Can I register as an exhibitor or sponsor?"
            answer="Yes! We have several sponsorship tiers (Headliner, Platinum, Gold, and Silver). You can view the details in the &quot;Sponsors&quot; section above and register through the same portal. Exhibitors also get booth placements at the venue."
          />
          <FAQItem 
            question="Where is the conference being held?"
            answer="The conference is taking place at the Welcome Centre Hotels, located at 70 International Airport Road, Ikeja, Lagos. You can find a map and directions in the &quot;Event Venue&quot; section above."
          />
          <FAQItem 
            question="Where can I stay during the conference?"
            answer="The conference is held at the Welcome Centre Hotels, which offers premium accommodation for delegates. You can book your stay directly through our portal after registration or contact the venue for special conference rates."
          />
          <FAQItem 
            question="Will I receive a certificate of attendance?"
            answer="Yes, all registered delegates who attend the conference will receive a digital certificate of attendance sent to their registered email address after the event concludes."
          />
        </div>
      </section>
    </>
  );
}
