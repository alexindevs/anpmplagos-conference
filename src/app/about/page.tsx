import Link from "next/link";

const COMMITTEE = [
  {
    name: "Dr. Kayode Olatunji",
    role: "Chairman",
    credentials: "MBBS, FWACP",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEdi4YqV1iDQoXiDe3xdHIm8PkKuPwXUPM2nr-u-YUe3Qx-9wJHC8qR3newy6FdIBvVpiw5eFKnerl0gkICi7Pmoa5TAnyTSevZePHI9faK18FixoxMfcgwedUbI3EM6KLGck4C6jof6IwTQq-hBXy2LBDQMNXlR1Wol9ksw172jcK4QbVmKFqG6dls1bcayzgDrZoV6jZF7owDQM8YbyZ-A6s1XDAz5ft5MBOcEYiY3Lw2lwkRUgTHuLjxcL0L3p9DOZwcb2TAcFy",
    alt: "Portrait of Dr. Kayode Olatunji in a white coat",
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
  title: "About the Conference - ANPMP",
  description:
    "Advancing Private Healthcare in Nigeria through collaboration, innovation, and shared expertise.",
};

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Hero Section with Breadcrumbs */}
      <section className="relative border-b border-[#e6dbdc] bg-white">
        <div
          className="flex flex-1 justify-center bg-cover bg-center px-4 py-10 md:px-40 md:py-16"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?ixlib=rb-4.0.3&auto=format&fit=crop&w=2091&q=80')`,
          }}
          data-alt="Abstract blurry medical conference background with people"
        >
          <div className="absolute inset-0 bg-white/90" />
          <div className="relative z-10 flex max-w-[960px] flex-1 flex-col items-center text-center">
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/"
                className="text-sm font-medium leading-normal text-[#896165] hover:text-primary"
              >
                Home
              </Link>
              <span className="text-sm font-medium leading-normal text-[#896165]">
                /
              </span>
              <span className="text-sm font-medium leading-normal text-primary">
                About
              </span>
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#181112] md:text-5xl">
              About the Conference
            </h1>
            <p className="mt-4 max-w-[600px] text-lg font-normal leading-normal text-[#896165]">
              Advancing Private Healthcare in Nigeria through collaboration,
              innovation, and shared expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="flex flex-1 justify-center bg-white px-4 py-12 md:px-40 md:py-20">
        <div className="flex max-w-[960px] flex-1 flex-col">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="group flex flex-col gap-6 rounded-xl border border-[#e6dbdc] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-[32px]">
                  medical_services
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold leading-tight text-[#181112]">
                  Our Mission
                </h2>
                <p className="text-base font-normal leading-relaxed text-[#5c4a4c]">
                  To unify private practitioners for better healthcare delivery
                  and advocacy across the nation. We strive to create an enabling
                  environment for private medical practice to thrive.
                </p>
              </div>
            </div>
            <div className="group flex flex-col gap-6 rounded-xl border border-[#e6dbdc] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
                <span className="material-symbols-outlined text-[32px]">
                  visibility
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold leading-tight text-[#181112]">
                  Our Vision
                </h2>
                <p className="text-base font-normal leading-relaxed text-[#5c4a4c]">
                  To be the leading voice for private medicine in Africa, setting
                  standards for care and ethics. We envision a future where quality
                  healthcare is accessible to every Nigerian.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History of ANPMP */}
      <section className="relative flex flex-1 justify-center overflow-hidden bg-[#fcfafa] px-4 py-16 md:px-40">
        <div className="pointer-events-none absolute right-0 top-1/2 -mr-20 -translate-y-1/2 opacity-[0.03]">
          <span className="material-symbols-outlined text-[400px]">
            history_edu
          </span>
        </div>
        <div className="relative z-10 flex max-w-[800px] flex-1 flex-col">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-primary" />
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                Our Heritage
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-[#181112] md:text-4xl">
              History of ANPMP
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-[#4a3a3c]">
              <p>
                The Association of Nigerian Private Medical Practitioners
                (ANPMP) was founded over four decades ago with a singular
                purpose: to bridge the gap in healthcare delivery within the
                private sector. From humble beginnings as a small collective of
                doctors in Lagos, we have grown into a nationwide body
                representing thousands of medical professionals.
              </p>
              <p>
                Throughout our history, ANPMP has been at the forefront of
                policy advocacy, fighting for the rights of private
                practitioners while ensuring that patient safety remains
                paramount. We have successfully launched numerous initiatives
                aimed at continuous professional development and have partnered
                with international bodies to bring world-class training to
                Nigerian soil.
              </p>
              <p>
                Today, our annual conference stands as a testament to our
                growth—a gathering of the brightest minds in medicine, dedicated
                to solving the unique challenges of healthcare in Africa.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#e6dbdc] pt-8 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary">1978</span>
                <span className="text-sm text-[#896165]">Founded</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary">5000+</span>
                <span className="text-sm text-[#896165]">Members</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary">36</span>
                <span className="text-sm text-[#896165]">States Covered</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary">45+</span>
                <span className="text-sm text-[#896165]">Conferences</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizing Committee */}
      <section className="flex flex-1 justify-center bg-white px-4 py-16 md:px-40">
        <div className="flex max-w-[960px] flex-1 flex-col gap-10">
          <div className="mx-auto max-w-[600px] text-center">
            <h2 className="mb-3 text-3xl font-bold leading-tight tracking-[-0.015em] text-[#181112]">
              Organizing Committee
            </h2>
            <p className="text-[#896165]">
              Meet the dedicated professionals working tirelessly to make this
              conference a success.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {COMMITTEE.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-3 p-4 text-center"
              >
                <div className="mb-2 size-32 overflow-hidden rounded-full border-2 border-[#e6dbdc] bg-gray-100">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${member.image}')` }}
                    data-alt={member.alt}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#181112]">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-1 text-xs text-[#896165]">
                    {member.credentials}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-primary px-4 py-16 text-white md:px-40">
        <div className="mx-auto flex w-full max-w-[960px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-3xl font-black leading-tight tracking-[-0.015em]">
              Ready to Join Us?
            </h2>
            <p className="text-lg text-white/90">
              Secure your spot at the most anticipated medical event of the
              year.
            </p>
          </div>
          <Link
            href="/#register"
            className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white px-8 text-base font-bold leading-normal tracking-[0.015em] text-primary shadow-lg transition-colors hover:bg-gray-100"
          >
            <span className="truncate">Register Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
