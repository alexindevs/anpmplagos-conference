import Link from "next/link";

const COMMITTEE = [
  {
    name: "Dr. Tunji Akintade",
    role: "Chairman",
    credentials: "MBBS, FWACP",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEdi4YqV1iDQoXiDe3xdHIm8PkKuPwXUPM2nr-u-YUe3Qx-9wJHC8qR3newy6FdIBvVpiw5eFKnerl0gkICi7Pmoa5TAnyTSevZePHI9faK18FixoxMfcgwedUbI3EM6KLGck4C6jof6IwTQq-hBXy2LBDQMNXlR1Wol9ksw172jcK4QbVmKFqG6dls1bcayzgDrZoV6jZF7owDQM8YbyZ-A6s1XDAz5ft5MBOcEYiY3Lw2lwkRUgTHuLjxcL0L3p9DOZwcb2TAcFy",
    alt: "Portrait of Dr. Tunji Akintade in a white coat",
  },
  {
    name: "Dr. Sarah Adebayo",
    role: "Secretary General",
    credentials: "MD, MPH",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCflIeMbqXHCoZzr5qVEA5Be-Z33CfPVIbialbcVb2uF5h9IqY6kTry_BVU_h5v2KI2tGiaxiMNYB8pnilYw5T42A4XKMBTjzekvZDQl3inkcZvlQ-PgISle_vxsEtlGXQJINf1y2-9b-mGgiqXr3kZgGi6LwfIDoTym4TAjmaUjOausTa2wNs6v3CWBS57bgaHpExcYoNf_Fmges6M9yuj3EtNH-NH2jbf2R3NVJBKIe-0GO2kwbadngqfJzAZWJxhV6WqRKjBTpLD",
    alt: "Portrait of Dr. Sarah Adebayo smiling professionally",
  },
  {
    name: "Dr. Emeka Okonkwo",
    role: "Treasurer",
    credentials: "MBBS, FMCP",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIOdYH3Lbaz7AjaN9_Ll7Zr84jDrS_UhM_mHcoqTH8fY5i0_52rT06jDsEc6c7Lg4ypak2AjB9g_0uKuH_pJjoyS8mG8G9uoXgVSEDK2CEjC304PwV3lopKIA4fCeQtXNxD3e-NPSfttgR0fU2vqIuj364NNE1t4vEZCR1jrdpEa1i6Wosy1cxipSMcRkEAbeOGJWdafd-ImITdnAG5bLHYXGli444DMZitVKj8jJphuwhv7HdkP-UsAvO0g0KhzhuHswFjpp4SKTu",
    alt: "Portrait of Dr. Emeka Okonkwo in a suit",
  },
  {
    name: "Dr. Zainab Ahmed",
    role: "Public Relations",
    credentials: "MBBS, FWACS",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5hdL0vIHNhuaSJvJ0-c8LSJrguZoD02Ja8sNbTPeLj7RW5PfcfZy-rg1NA-fXEgFRkd4Z_mLIwuuNJTBzw-G3BiGWTiU2VVG34ZH0rsIcvAeaEYmGkfDxdn-mOsdD6fNGpFCP7d0HCzbS_rfUS494NE3-p0iBn2ZhcT6f4AHmaYOMr9qmqwbi78O4nL5o6UTD0gnIFYp9a3lElZDUOWCy7EmMSBAjVymbrv_YServdljLBGhK3JMTQdL-DhF2-I3TWw_DsmJUBEbl",
    alt: "Portrait of Dr. Zainab Ahmed with a stethoscope",
  },
];

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
                <span className="text-5xl font-mono font-bold text-charcoal mb-2">1978</span>
                <span className="text-sm font-bold text-warm-gray uppercase tracking-wider">Founded</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white border-l-4 border-medical-green">
                <span className="text-5xl font-mono font-bold text-charcoal mb-2">2000+</span>
                <span className="text-sm font-bold text-warm-gray uppercase tracking-wider">Members</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white border-l-4 border-fresh-green">
                <span className="text-5xl font-mono font-bold text-charcoal mb-2">30+</span>
                <span className="text-sm font-bold text-warm-gray uppercase tracking-wider">States</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white border-l-4 border-medical-green">
                <span className="text-5xl font-mono font-bold text-charcoal mb-2">45+</span>
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
              Meet the team making this conference happen.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COMMITTEE.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-4 p-6 bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg transition-all"
              >
                <div className="size-32 overflow-hidden rounded-full border-4 border-mint-whisper bg-gray-100">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${member.image}')` }}
                    data-alt={member.alt}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-charcoal mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-bold text-fresh-green mb-1">{member.role}</p>
                  <p className="text-xs text-warm-gray font-mono">
                    {member.credentials}
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
            href="/#register"
            className="flex h-14 min-w-[200px] cursor-pointer items-center justify-center bg-white px-10 text-base font-bold text-primary shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <span className="truncate">Register Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
