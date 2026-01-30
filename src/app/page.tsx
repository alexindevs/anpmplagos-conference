import CountdownTimer from "./components/CountdownTimer";
import HeroBackgroundCarousel from "./components/HeroBackgroundCarousel";

const HERO_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD_kTd-14OPbdWSrY7rK7110uSZau7sXUvP1NIfInnznhVmlVCqwmtO7WiSB-m4udQlcmTw2mO6zKxmgasCK2xc44Qz5LQpCwX_CBD5Hq-ywnSWCHhK05XPI4Abj6FVMRdajOIWKRgNSAAeZuE2t4W5JTFI95RvCCPV42BvuT8MiMmT2H6pbU0KTcx9bezKfLd51JltcihIHnYscTFqichibiqblz0cQuF1vBk82FLpnt3rlwDL7mVwDWBQO6myXVKNfgTxcLpCQsRN",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920",
];

export default function Home() {
  const mapBg =
    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBTTqTGp8JffZe5o_6d1c57BkVJg5eNjctJjYqXozwYC0-vz9y2g1ZN46HbondBFZNMrx71LOLNFQsV2wJs_HsGPanr4n6cA_CXpJcQhwMCtYqpmGYCIWCFS20Set5EiqXaVSW1qyMsPKUzNQ0nsubHK9byXcDFrMD_tb-Si9oOvCpAKrPFtfTexs-zKNyQkL4WBhURpvnDrzxPz8tsG8QTKHJ6MZ0dV7Zx_f1FrjSb8uGmR3wVKOjuec7Jp1s4KJqDIFRoJ9mZ2lID")';

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <HeroBackgroundCarousel images={HERO_IMAGES} />
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wider mb-4 border border-white/30 uppercase">
            Annual General Conference 2026
          </span>
          <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 drop-shadow-lg">
            ANPMP Annual Conference
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-white/90 text-lg md:text-xl font-medium mb-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">calendar_month</span>
              <span>Sep 25, 2026</span>
            </div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">location_on</span>
              <span>Lagos, Nigeria</span>
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
            Enhancing Healthcare Delivery in Nigeria: The Role of Private
            Medical Practitioners
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
            Experience the best of medical networking, expert knowledge
            sharing, and hands-on professional development.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">
                diversity_3
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Networking</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Connect with peers, industry leaders, and potential partners in
              structured sessions designed for meaningful interaction.
            </p>
          </div>
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
              Gain insights from world-renowned medical experts discussing the
              future of private practice in Nigeria.
            </p>
          </div>
          <div className="group flex flex-col items-center text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h3 className="text-xl font-bold text-[#181112] mb-2">Workshops</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Participate in hands-on clinical and administrative workshops to
              enhance your service delivery.
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
                <h3 className="text-xl font-bold text-primary">Day 1: Sep 25</h3>
                <h4 className="text-lg font-semibold text-[#181112]">
                  Arrival & Opening Ceremony
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  Registration, Welcome Cocktail, and Opening Keynote Address.
                </p>
              </div>
              <div className="absolute left-4 md:left-1/2 -ml-3 w-6 h-6 rounded-full border-4 border-white bg-secondary shadow-md z-10" />
              <div className="w-full md:w-1/2 md:pl-12 pl-12" />
            </div>
            <div className="relative mb-12 flex flex-col md:flex-row items-center w-full">
              <div className="w-full md:w-1/2 md:pr-12 md:text-right pl-12 md:pl-0 mb-4 md:mb-0 order-1 md:order-1" />
              <div className="absolute left-4 md:left-1/2 -ml-3 w-6 h-6 rounded-full border-4 border-white bg-primary shadow-md z-10" />
              <div className="w-full md:w-1/2 md:pl-12 pl-12 order-2 md:order-2">
                <h3 className="text-xl font-bold text-primary">Day 2: Sep 26</h3>
                <h4 className="text-lg font-semibold text-[#181112]">
                  Technical Sessions & Workshops
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  Full day of panel discussions, breakout sessions, and
                  exhibition tours.
                </p>
              </div>
            </div>
            <div className="relative flex flex-col md:flex-row items-center w-full">
              <div className="w-full md:w-1/2 md:pr-12 md:text-right pl-12 md:pl-0 mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-primary">Day 3: Sep 27</h3>
                <h4 className="text-lg font-semibold text-[#181112]">
                  AGM & Gala Night
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  Annual General Meeting, Elections, and Closing Banquet.
                </p>
              </div>
              <div className="absolute left-4 md:left-1/2 -ml-3 w-6 h-6 rounded-full border-4 border-white bg-secondary shadow-md z-10" />
              <div className="w-full md:w-1/2 md:pl-12 pl-12" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Student</h3>
              <p className="text-sm text-gray-500">Medical Students & Interns</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-[#181112]">₦15,000</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">
                  check_circle
                </span>
                <span>Access to sessions</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">
                  check_circle
                </span>
                <span>Conference materials</span>
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all">
              Select
            </button>
          </div>
          <div className="relative flex flex-col p-6 bg-white rounded-xl border-2 border-primary shadow-xl scale-105 z-10">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-primary">Member</h3>
              <p className="text-sm text-gray-500">Active ANPMP Members</p>
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
                <span>Gala Night Entry</span>
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-red-700 transition-all shadow-md">
              Select
            </button>
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
                <span className="material-symbols-outlined text-green-600 text-[20px]">
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
                <span>Gala Night Entry</span>
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all">
              Select
            </button>
          </div>
          <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Corporate</h3>
              <p className="text-sm text-gray-500">
                Organizations & Exhibitors
              </p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-[#181112]">₦150,000</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">
                  check_circle
                </span>
                <span>Exhibition Booth</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">
                  check_circle
                </span>
                <span>2 Staff Passes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-green-600 text-[20px]">
                  check_circle
                </span>
                <span>Logo on brochure</span>
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all">
              Select
            </button>
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
                  <h4 className="font-bold text-[#181112]">
                    Eko Convention Centre
                  </h4>
                  <p className="text-sm text-gray-600">
                    Plot 1415 Adetokunbo Ademola Street,
                    <br />
                    Victoria Island, Lagos
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
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-green-900 transition-colors w-fit">
              <span className="material-symbols-outlined">map</span>
              Get Directions
            </button>
          </div>
          <div className="w-full md:w-2/3 h-[400px] md:h-auto rounded-2xl overflow-hidden shadow-lg bg-gray-200 relative group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: mapBg }}
              data-alt="Map showing the location of Eko Convention Centre in Lagos"
              data-location="Lagos, Nigeria"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-6xl text-primary drop-shadow-xl animate-bounce">
                location_on
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
