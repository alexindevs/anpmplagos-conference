import Image from "next/image";
import Link from "next/link";

const KEYNOTE_SPEAKERS = [
  {
    name: "Dr. Kayode Olatunji",
    credentials: "MBBS, FWACP",
    role: "Opening Keynote",
    topic: "Enhancing Healthcare Delivery: The Private Practitioner’s Role",
    bio: "Leading voice in private medical practice with decades of experience in clinical leadership and healthcare policy.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEdi4YqV1iDQoXiDe3xdHIm8PkKuPwXUPM2nr-u-YUe3Qx-9wJHC8qR3newy6FdIBvVpiw5eFKnerl0gkICi7Pmoa5TAnyTSevZePHI9faK18FixoxMfcgwedUbI3EM6KLGck4C6jof6IwTQq-hBXy2LBDQMNXlR1Wol9ksw172jcK4QbVmKFqG6dls1bcayzgDrZoV6jZF7owDQM8YbyZ-A6s1XDAz5ft5MBOcEYiY3Lw2lwkRUgTHuLjxcL0L3p9DOZwcb2TAcFy",
    imageAlt: "Portrait of Dr. Kayode Olatunji",
  },
  {
    name: "Dr. Sarah Adebayo",
    credentials: "MD, MPH",
    role: "Plenary Speaker",
    topic: "Innovation in Primary Care: Models That Work",
    bio: "Expert in health systems strengthening and community-based care across Nigeria and the region.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCflIeMbqXHCoZzr5qVEA5Be-Z33CfPVIbialbcVb2uF5h9IqY6kTry_BVU_h5v2KI2tGiaxiMNYB8pnilYw5T42A4XKMBTjzekvZDQl3inkcZvlQ-PgISle_vxsEtlGXQJINf1y2-9b-mGgiqXr3kZgGi6LwfIDoTym4TAjmaUjOausTa2wNs6v3CWBS57bgaHpExcYoNf_Fmges6M9yuj3EtNH-NH2jbf2R3NVJBKIe-0GO2kwbadngqfJzAZWJxhV6WqRKjBTpLD",
    imageAlt: "Portrait of Dr. Sarah Adebayo",
  },
];

const FEATURED_SPEAKERS = [
  {
    name: "Dr. Emeka Okonkwo",
    credentials: "MBBS, FMCP",
    role: "Panel Moderator",
    topic: "Healthcare Financing & Sustainability",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIOdYH3Lbaz7AjaN9_Ll7Zr84jDrS_UhM_mHcoqTH8fY5i0_52rT06jDsEc6c7Lg4ypak2AjB9g_0uKuH_pJjoyS8mG8G9uoXgVSEDK2CEjC304PwV3lopKIA4fCeQtXNxD3e-NPSfttgR0fU2vqIuj364NNE1t4vEZCR1jrdpEa1i6Wosy1cxipSMcRkEAbeOGJWdafd-ImITdnAG5bLHYXGli444DMZitVKj8jJphuwhv7HdkP-UsAvO0g0KhzhuHswFjpp4SKTu",
    imageAlt: "Portrait of Dr. Emeka Okonkwo",
  },
  {
    name: "Dr. Zainab Ahmed",
    credentials: "MBBS, FWACS",
    role: "Workshop Lead",
    topic: "Clinical Excellence in Private Practice",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5hdL0vIHNhuaSJvJ0-c8LSJrguZoD02Ja8sNbTPeLj7RW5PfcfZy-rg1NA-fXEgFRkd4Z_mLIwuuNJTBzw-G3BiGWTiU2VVG34ZH0rsIcvAeaEYmGkfDxdn-mOsdD6fNGpFCP7d0HCzbS_rfUS494NE3-p0iBn2ZhcT6f4AHmaYOMr9qmqwbi78O4nL5o6UTD0gnIFYp9a3lElZDUOWCy7EmMSBAjVymbrv_YServdljLBGhK3JMTQdL-DhF2-I3TWw_DsmJUBEbl",
    imageAlt: "Portrait of Dr. Zainab Ahmed",
  },
  {
    name: "Dr. Chidi Nwosu",
    credentials: "MBBS, FMCPath",
    role: "Panelist",
    topic: "Diagnostics & Quality Assurance",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEdi4YqV1iDQoXiDe3xdHIm8PkKuPwXUPM2nr-u-YUe3Qx-9wJHC8qR3newy6FdIBvVpiw5eFKnerl0gkICi7Pmoa5TAnyTSevZePHI9faK18FixoxMfcgwedUbI3EM6KLGck4C6jof6IwTQq-hBXy2LBDQMNXlR1Wol9ksw172jcK4QbVmKFqG6dls1bcayzgDrZoV6jZF7owDQM8YbyZ-A6s1XDAz5ft5MBOcEYiY3Lw2lwkRUgTHuLjxcL0L3p9DOZwcb2TAcFy",
    imageAlt: "Portrait of Dr. Chidi Nwosu",
  },
  {
    name: "Dr. Funke Adeyemi",
    credentials: "MBBS, FWACP (Paed)",
    role: "Panelist",
    topic: "Child Health & Maternal Care",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCflIeMbqXHCoZzr5qVEA5Be-Z33CfPVIbialbcVb2uF5h9IqY6kTry_BVU_h5v2KI2tGiaxiMNYB8pnilYw5T42A4XKMBTjzekvZDQl3inkcZvlQ-PgISle_vxsEtlGXQJINf1y2-9b-mGgiqXr3kZgGi6LwfIDoTym4TAjmaUjOausTa2wNs6v3CWBS57bgaHpExcYoNf_Fmges6M9yuj3EtNH-NH2jbf2R3NVJBKIe-0GO2kwbadngqfJzAZWJxhV6WqRKjBTpLD",
    imageAlt: "Portrait of Dr. Funke Adeyemi",
  },
];

export const metadata = {
  title: "Speakers - ANPMP Conference",
  description:
    "Meet the keynote and featured speakers at the ANPMP Annual Conference. Leading voices in private medical practice and healthcare delivery.",
};

export default function SpeakersPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Hero Section with Breadcrumbs */}
      <section className="relative border-b border-[#e6dbdc] bg-white">
        <div
          className="flex flex-1 justify-center bg-cover bg-center px-4 py-10 md:px-40 md:py-16"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?ixlib=rb-4.0.3&auto=format&fit=crop&w=2091&q=80')`,
          }}
          data-alt="Conference background"
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
                Speakers
              </span>
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#181112] md:text-5xl">
              Our Speakers
            </h1>
            <p className="mt-4 max-w-[600px] text-lg font-normal leading-normal text-[#896165]">
              Gain insights from leading practitioners and experts shaping the
              future of private healthcare in Nigeria.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="flex flex-1 justify-center border-b border-[#e6dbdc] bg-white px-4 py-10 md:px-40 md:py-12">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="text-base font-normal leading-relaxed text-[#5c4a4c]">
            Our keynote and plenary speakers will set the tone for the
            conference. Featured speakers and panelists will lead workshops and
            discussions on clinical excellence, financing, and innovation in
            private practice.
          </p>
        </div>
      </section>

      {/* Keynote Speakers */}
      <section className="flex flex-1 justify-center bg-white px-4 py-16 md:px-40">
        <div className="flex max-w-[960px] flex-1 flex-col gap-10">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined text-[28px]">
                record_voice_over
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#181112]">
              Keynote & Plenary Speakers
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {KEYNOTE_SPEAKERS.map((speaker) => (
              <div
                key={speaker.name}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#e6dbdc] bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:items-start sm:text-left">
                  <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-2 border-[#e6dbdc] bg-gray-100">
                    <Image
                      src={speaker.image}
                      alt={speaker.imageAlt}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="text-xl font-bold text-[#181112]">
                      {speaker.name}
                    </h3>
                    <p className="text-sm font-medium text-primary">
                      {speaker.role}
                    </p>
                    <p className="text-xs text-[#896165]">{speaker.credentials}</p>
                    <p className="mt-1 text-sm font-medium text-[#181112]">
                      {speaker.topic}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#5c4a4c]">
                      {speaker.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Speakers */}
      <section className="flex flex-1 justify-center border-t border-[#e6dbdc] bg-white px-4 py-16 md:px-40">
        <div className="flex max-w-[960px] flex-1 flex-col gap-10">
          <div className="mx-auto max-w-[600px] text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <span className="material-symbols-outlined text-[28px]">
                  groups
                </span>
              </div>
            </div>
            <h2 className="mb-3 text-3xl font-bold leading-tight tracking-[-0.015em] text-[#181112]">
              Featured Speakers & Panelists
            </h2>
            <p className="text-[#896165]">
              Practitioners and experts leading workshops, panels, and
              discussions across the programme.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SPEAKERS.map((speaker) => (
              <div
                key={speaker.name}
                className="flex flex-col items-center rounded-xl border border-[#e6dbdc] bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative mb-4 size-28 overflow-hidden rounded-full border-2 border-[#e6dbdc] bg-gray-100">
                  <Image
                    src={speaker.image}
                    alt={speaker.imageAlt}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#181112]">
                  {speaker.name}
                </h3>
                <p className="text-sm font-medium text-primary">
                  {speaker.role}
                </p>
                <p className="mt-1 text-xs text-[#896165]">
                  {speaker.credentials}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#5c4a4c]">
                  {speaker.topic}
                </p>
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
              Secure your spot and hear from these speakers at the most
              anticipated medical event of the year.
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
