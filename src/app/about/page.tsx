import Image from "next/image";
import Link from "next/link";

/** Local Organizing Committee — AGM / conference 2026. Photos: `/public`. */
const COMMITTEE = [
  {
    name: "Dr. Tunji Akintade",
    role: "Chairman, Conference Organizing Committee",
    assignments: "Leads the overall LOC for the conference.",
    image: "/tunji-akintade.jpeg",
    alt: "Dr. Tunji Akintade",
  },
  {
    name: "Dr. Emma Onyenuche",
    role: "1st Vice Chairman, ANPMP Lagos",
    assignments: "Member, Scientific Conference sub-committee.",
    image: "/dr-emma-onyenuche.jpeg",
    alt: "Dr. Emma Onyenuche",
  },
  {
    name: "Dr. Chinedum Eluogu",
    role: "2nd Vice Chairman, ANPMP Lagos",
    assignments: "Consultant cardiologist. Registration committee.",
    image: "/dr-chinedum-eluogu.jpeg",
    alt: "Dr. Chinedum Eluogu",
  },
  {
    name: "Dr. Oluwaseun Olusola",
    role: "General Secretary, ANPMP Lagos · Secretary, 2026 COC",
    assignments: "Chairperson, Scientific Sub-Committee.",
    image: "/dr-oluwaseun-olusola.jpeg",
    alt: "Dr. Oluwaseun Olusola",
  },
  {
    name: "Dr. Veronica Oluyemisi Nyamali",
    role: "State Treasurer · Chair, Finance & Fundraising",
    assignments: "Electoral sub-committee.",
    image: "/dr-veronica-o-nyamali.jpeg",
    alt: "Dr. Veronica Oluyemisi Nyamali",
  },
  {
    name: "Dr. Olawale Oladubu",
    role: "Assistant Secretary, ANPMP Lagos · Chair, Registration",
    assignments: "Registration sub-committee for the AGM / conference.",
    image: "/dr-olawale-oladubu.jpeg",
    alt: "Dr. Olawale Oladubu",
  },
  {
    name: "Dr. Ayelaje O. J.",
    role: "Social & Welfare Secretary, ANPMP · Chair, Social & Welfare",
    assignments: "Social and welfare sub-committee for the conference.",
    image: "/dr-ayelaje-o-j.jpeg",
    alt: "Dr. Ayelaje O. J.",
  },
  {
    name: "Dr. Austine Aipoh",
    role: "Chairman, Electoral Sub-Committee",
    assignments: "Scientific & Registration sub-committees.",
    image: "/dr-austine-aipoh.jpeg",
    alt: "Dr. Austine Aipoh",
  },
  {
    name: "Dr. Mojeed Olayemi Jaiyeola",
    role: "Chairman, Shomolu/Bariga Zone",
    assignments: "Fundraising & Registration sub-committees.",
    image: "/dr-mojeed-olayemi-jaiyeola.jpeg",
    alt: "Dr. Mojeed Olayemi Jaiyeola",
  },
  {
    name: "Dr. Folarin A. Olasogba",
    role: "Member, Scientific & Publicity Sub-Committees",
    assignments: "Conference organizing committee.",
    image: "/dr-folarin-a-olasogba.jpeg",
    alt: "Dr. Folarin A. Olasogba",
  },
  {
    name: "Dr. Nwobu Olufunke Omotayo",
    role: "Member, Local Organizing Committee",
    assignments: "Fundraising committee.",
    image: "/dr-omotayo-olofunke-nwobu.jpeg",
    alt: "Dr. Nwobu Olufunke Omotayo",
  },
  {
    name: "Dr. Olawunmi Abiodun Otusanya",
    role: "Member, Local Organizing Committee",
    assignments: "Fundraising committee.",
    image: "/olawunmi-abiodun.jpeg",
    alt: "Dr. Olawunmi Abiodun Otusanya",
  },
  {
    name: "Dr. Obasi Ugochukwu",
    role: "Member, Local Organizing Committee",
    assignments: "Fundraising committee.",
    image: "/obasi-ugochukwu.jpeg",
    alt: "Dr. Obasi Ugochukwu",
  },
  {
    name: "Dr. M. Westerhoff",
    role: "Member, Local Organizing Committee",
    assignments: "Conference organizing committee.",
    image: "/dr-m-westerhoff.jpeg",
    alt: "Dr. M. Westerhoff",
  },
] as const;

export const metadata = {
  title: "About the Conference - ANPMP Lagos",
  description:
    "Advancing Private Healthcare in Nigeria through collaboration, innovation, and shared expertise.",
};

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-medical-green py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            About ANPMP Lagos
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Since 1978, representing Nigeria&apos;s private medical practitioners.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group flex flex-col gap-6 p-8 bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg transition-all">
              <div className="flex size-14 items-center justify-center bg-fresh-green/10 text-fresh-green">
                <span className="material-symbols-outlined text-[32px]">
                  medical_services
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-3xl font-serif font-bold text-charcoal">
                  Our Mission
                </h2>
                <p className="text-base leading-relaxed text-warm-gray">
                 To represent and advocate for private medical practitioners in Nigeria by safeguarding their professional interests and welfare, while strengthening the private healthcare sector through active policy engagement, capacity building, and continuous professional development.
                </p>
              </div>
            </div>
            <div className="group flex flex-col gap-6 p-8 bg-white border-l-4 border-medical-green shadow-sm hover:shadow-lg transition-all">
              <div className="flex size-14 items-center justify-center bg-medical-green/10 text-medical-green">
                <span className="material-symbols-outlined text-[32px]">
                  visibility
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-3xl font-serif font-bold text-charcoal">
                  Our Vision
                </h2>
                <p className="text-base leading-relaxed text-warm-gray">
                  We envision a healthcare system where private medical practice delivers consistently high-quality, accessible, and patient-centered care across Nigeria. We aim to be the leading voice shaping a well-regulated, innovative, and globally aligned private healthcare sector.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History of ANPMP */}
      <section className="relative overflow-hidden bg-mint-whisper px-4 py-24">
        <div className="pointer-events-none absolute right-0 top-1/2 -mr-20 -translate-y-1/2 opacity-[0.03]">
          <span className="material-symbols-outlined text-[400px]">
            history_edu
          </span>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="h-1 w-16 bg-fresh-green" />
              <span className="text-sm font-bold uppercase tracking-widest text-fresh-green">
                Our Heritage
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">
              History of ANPMP Lagos
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-charcoal">
              <p>
                Private medical practice in Nigeria dates back to the early 20th century, with independent practitioners establishing services outside government-owned hospitals as far back as 1909. As the sector grew, the need for a unified professional body became evident.
              </p>
              <p>
                Around 1921, private practitioners formally organized under the Association of General Medical Practitioners of Nigeria (AGMPN)—the earliest structured body representing private doctors in the country. This marked the beginning of coordinated advocacy and professional collaboration within Nigeria&apos;s private healthcare space.
              </p>
              <p>
                By the late 1980s, the evolution of medicine beyond general practice led to a broader, more inclusive structure. The association was reconstituted as the Association of General and Private Medical Practitioners of Nigeria (AGPMPN), reflecting the growing presence of specialists and diverse medical disciplines.
              </p>
              <p>
                Over time, the organization transitioned into its current identity as the Association of Nigerian Private Medical Practitioners (ANPMP)—a national body representing all categories of private medical and dental practitioners, whether clinic owners or employed professionals.
              </p>
              <p>
                Today, ANPMP operates through a structured system spanning national, zonal, and state levels, with governance anchored by its Annual General Meeting (AGM) and National Executive Council (NEC). The association plays a critical role in shaping healthcare policy, promoting continuing medical education, and fostering collaboration across the private health sector.
              </p>
              <p>
                A key part of its legacy is its long-standing tradition of hosting Annual General Meetings and Scientific Conferences, which serve as platforms for knowledge exchange, policy dialogue, and professional development. Over the decades, these conferences have grown into major events within Nigeria&apos;s healthcare landscape.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white border-l-4 border-fresh-green">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-charcoal mb-2">1978</span>
                <span className="text-sm font-bold text-warm-gray uppercase tracking-wider">Founded</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white border-l-4 border-medical-green">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-charcoal mb-2">2000+</span>
                <span className="text-sm font-bold text-warm-gray uppercase tracking-wider">Members</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white border-l-4 border-fresh-green">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-charcoal mb-2">30+</span>
                <span className="text-sm font-bold text-warm-gray uppercase tracking-wider">States</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white border-l-4 border-medical-green">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-charcoal mb-2">45+</span>
                <span className="text-sm font-bold text-warm-gray uppercase tracking-wider">Conferences</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizing Committee */}
      <section className="bg-white px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">
              Organizing Committee
            </h2>
            <p className="text-warm-gray text-lg">
              Local Organizing Committee for the AGM &amp; scientific conference.
            </p>
          </div>

          {/* State Chairman — featured at centre top */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-col items-center gap-4 p-8 bg-white border-l-4 border-deep-forest shadow-md hover:shadow-xl transition-all w-full md:max-w-[400px]">
              <div className="relative size-[200px] shrink-0 overflow-hidden rounded-full border-4 border-mint-whisper bg-gray-100">
                <Image
                  src="/dr-jonathan-esegine.jpeg"
                  alt="Dr. Jonathan Esegine"
                  width={200}
                  height={200}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-charcoal mb-1">
                  Dr. Jonathan Esegine
                </h3>
                <span className="inline-block py-0.5 px-3 bg-deep-forest/10 text-deep-forest text-xs font-bold tracking-widest uppercase border border-deep-forest/20 mb-2">
                  DMP
                </span>
                <p className="text-sm font-bold text-deep-forest leading-snug">
                  State Chairman, ANPMP Lagos
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {COMMITTEE.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-4 p-6 bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative size-[160px] shrink-0 overflow-hidden rounded-full border-4 border-mint-whisper bg-gray-100">
                  <Image
                    src={member.image}
                    alt={member.alt}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-charcoal mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-bold text-fresh-green mb-2 leading-snug">
                    {member.role}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-1">
                    Committee focus
                  </p>
                  <p className="text-xs text-warm-gray leading-relaxed">
                    {member.assignments}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-primary px-4 py-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-4xl font-serif font-bold leading-tight text-white/90">
              Ready to Join Us?
            </h2>
            <p className="text-xl text-white/90">
              Register for ANPMP Lagos 2026.
            </p>
          </div>
          <Link
            href="/register"
            className="flex h-14 min-w-[200px] cursor-pointer items-center justify-center bg-white px-10 text-base font-bold text-primary shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <span className="truncate">Register Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
