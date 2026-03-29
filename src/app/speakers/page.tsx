import Image from "next/image";
import Link from "next/link";
import {
  getPublicSpeakers,
  getPublicSpecialGuests,
  type ConferenceProfile,
} from "@/lib/api";

export const metadata = {
  title: "Speakers - ANPMP Conference",
  description:
    "Meet the keynote and featured speakers at the ANPMP Annual Conference. Leading voices in private medical practice and healthcare delivery.",
};

export const revalidate = 120;

function isKeynote(p: ConferenceProfile): boolean {
  return (p.highlightType ?? "").toLowerCase() === "keynote";
}

function profilePath(p: ConferenceProfile): string {
  if (p.kind === "special_guest") {
    return `/special-guests/${encodeURIComponent(p.slug)}`;
  }
  return `/speakers/${encodeURIComponent(p.slug)}`;
}

function SpeakerListingCard({ p, subtle }: { p: ConferenceProfile; subtle?: boolean }) {
  const href = profilePath(p);
  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-xl border border-[#e6dbdc] bg-white shadow-sm transition-shadow hover:shadow-md ${subtle ? "sm:flex-row sm:items-start sm:text-left" : "items-center text-center"}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-gray-100 ${subtle ? "h-48 w-full border-b border-[#e6dbdc] sm:h-auto sm:min-h-[220px] sm:w-48 sm:rounded-l-xl sm:border-b-0 sm:border-r" : "mx-auto mt-6 size-28 rounded-full border-2 border-[#e6dbdc]"}`}
      >
        {p.profilePicture ? (
          <Image
            src={p.profilePicture}
            alt={p.name}
            fill
            className="object-cover"
            sizes={subtle ? "(max-width:640px) 100vw, 192px" : "112px"}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-2xl font-black text-primary/30">
            {p.name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-1 ${subtle ? "p-6 text-center sm:text-left" : "p-6"}`}>
        <h3 className="text-lg font-bold text-[#181112] transition-colors group-hover:text-primary md:text-xl">
          {p.name}
        </h3>
        <p className="text-sm font-medium text-primary">{p.role}</p>
        {p.qualifications?.trim() ? (
          <p className="text-xs text-[#896165]">{p.qualifications}</p>
        ) : null}
        {p.byline?.trim() ? (
          <p className={`text-sm leading-relaxed text-[#5c4a4c] ${subtle ? "mt-2" : "mt-1"}`}>{p.byline}</p>
        ) : null}
        <span className="mt-2 inline-flex items-center justify-center gap-1 text-xs font-bold text-primary sm:justify-start">
          View profile
          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
            arrow_forward
          </span>
        </span>
      </div>
    </Link>
  );
}

export default async function SpeakersPage() {
  let speakers: ConferenceProfile[] = [];
  let guests: ConferenceProfile[] = [];
  let loadError: string | null = null;

  try {
    [speakers, guests] = await Promise.all([getPublicSpeakers(), getPublicSpecialGuests()]);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Unable to load speakers. Please try again later.";
  }

  const keynotes = speakers.filter(isKeynote);
  const featured = speakers.filter((s) => !isKeynote(s));

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
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
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#181112] md:text-5xl">
              Our Speakers
            </h1>
            <p className="mt-4 max-w-[600px] text-lg font-normal leading-normal text-[#896165]">
              Gain insights from leading practitioners and experts shaping the future of private healthcare in Nigeria.
            </p>
          </div>
        </div>
      </section>

      {loadError ? (
        <section className="flex flex-1 justify-center border-b border-[#e6dbdc] bg-white px-4 py-12 md:px-40">
          <div className="max-w-[720px] rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800">
            <p className="font-semibold">Could not load speakers</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        </section>
      ) : (
        <>
          <section className="flex flex-1 justify-center border-b border-[#e6dbdc] bg-white px-4 py-10 md:px-40 md:py-12">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-base font-normal leading-relaxed text-[#5c4a4c]">
                Learn from clinicians, policymakers, and innovators who are advancing private medical practice in
                Nigeria.
              </p>
            </div>
          </section>

          {keynotes.length > 0 ? (
            <section className="flex flex-1 justify-center border-b border-[#e6dbdc] bg-white px-4 py-16 md:px-40">
              <div className="flex w-full max-w-[960px] flex-1 flex-col gap-10">
                <header className="max-w-3xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <span className="material-symbols-outlined text-[28px]">record_voice_over</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#181112] md:text-3xl">
                      Keynote &amp; plenary speakers
                    </h2>
                  </div>
                  <p className="text-base leading-relaxed text-[#896165]">
                    These sessions anchor the conference programme: opening addresses, plenary talks, and flagship
                    presentations that set the direction for the days ahead. Expect big-picture perspective on healthcare
                    delivery, policy, and the future of private practice.
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {keynotes.map((p) => (
                    <SpeakerListingCard key={p.id} p={p} subtle />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {featured.length > 0 ? (
            <section className="flex flex-1 justify-center border-b border-[#e6dbdc] bg-white px-4 py-16 md:px-40">
              <div className="flex w-full max-w-[960px] flex-1 flex-col gap-10">
                <header className="max-w-3xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <span className="material-symbols-outlined text-[28px]">groups</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#181112] md:text-3xl">
                      Featured &amp; panel speakers
                    </h2>
                  </div>
                  <p className="text-base leading-relaxed text-[#896165]">
                    Workshop leads, moderators, and panelists bring depth to themed tracks—clinical excellence, financing,
                    operations, and innovation. They facilitate dialogue, share practical tools, and connect peers across
                    specialties and regions.
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((p) => (
                    <SpeakerListingCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {guests.length > 0 ? (
            <section
              id="special-guests"
              className="flex flex-1 scroll-mt-24 justify-center border-t border-[#e6dbdc] bg-gray-50/80 px-4 py-16 md:px-40"
            >
              <div className="flex max-w-[960px] flex-1 flex-col gap-10">
                <div className="mx-auto max-w-[600px] text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                      <span className="material-symbols-outlined text-[28px]">star</span>
                    </div>
                  </div>
                  <h2 className="mb-3 text-3xl font-bold leading-tight tracking-[-0.015em] text-[#181112]">
                    Special guests
                  </h2>
                  <p className="text-[#896165]">
                    Dignitaries and honoured guests joining us for the conference.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {guests.map((p) => (
                    <SpeakerListingCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {!loadError && keynotes.length === 0 && featured.length === 0 && guests.length === 0 ? (
            <section className="flex flex-1 justify-center bg-white px-4 py-16 md:px-40">
              <p className="text-center text-[#896165]">Speaker profiles will appear here once they are published.</p>
            </section>
          ) : null}
        </>
      )}

      <section className="bg-primary px-4 py-16 text-white md:px-40">
        <div className="mx-auto flex w-full max-w-[960px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-3xl font-black leading-tight tracking-[-0.015em]">Ready to Join Us?</h2>
            <p className="text-lg text-white/90">
              Secure your spot at the most anticipated medical event of the year.
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
