import Image from "next/image";
import Link from "next/link";
import {
  getPublicSpeakers,
  getPublicSpecialGuests,
  type ConferenceProfile,
} from "@/lib/api";

export const metadata = {
  title: "Speakers - ANPMP Lagos Conference",
  description:
    "Meet the keynote and featured speakers at the ANPMP Lagos Annual Conference. Leading voices in private medical practice and healthcare delivery.",
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
      className={`group flex flex-col overflow-hidden bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg transition-all ${subtle ? "sm:flex-row sm:items-start sm:text-left" : "items-center text-center"}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-gray-100 ${subtle ? "h-48 w-full sm:h-auto sm:min-h-[220px] sm:w-48" : "mx-auto mt-6 size-28 rounded-full border-4 border-mint-whisper"}`}
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
          <div className="flex size-full items-center justify-center text-2xl font-black text-fresh-green/30">
            {p.name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-2 ${subtle ? "p-6 text-center sm:text-left" : "p-6"}`}>
        <h3 className="text-lg font-bold text-charcoal transition-colors group-hover:text-fresh-green md:text-xl">
          {p.name}
        </h3>
        <p className="text-sm font-bold text-fresh-green">{p.role}</p>
        {p.qualifications?.trim() ? (
          <p className="text-xs text-warm-gray font-mono">{p.qualifications}</p>
        ) : null}
        {p.byline?.trim() ? (
          <p className={`text-sm leading-relaxed text-warm-gray ${subtle ? "mt-2" : "mt-1"}`}>{p.byline}</p>
        ) : null}
        <span className="mt-2 inline-flex items-center justify-center gap-1 text-xs font-bold text-fresh-green sm:justify-start">
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
      <section className="relative bg-medical-green py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            Our Speakers
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Leading practitioners and experts shaping Nigeria&apos;s private healthcare sector.
          </p>
        </div>
      </section>

      {loadError ? (
        <section className="flex flex-1 justify-center border-b border-[#e6dbdc] bg-white px-4 py-12 md:px-40">
          <div className="max-w-180 rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800">
            <p className="font-semibold">Could not load speakers</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        </section>
      ) : (
        <>
          
          {keynotes.length > 0 ? (
            <section className="bg-mint-whisper py-24 px-4">
              <div className="w-full max-w-6xl mx-auto">
                <header className="mb-16">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="bg-medical-green/10 p-3 text-medical-green">
                      <span className="material-symbols-outlined text-[32px]">record_voice_over</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
                      Keynote &amp; Plenary Speakers
                    </h2>
                  </div>
                  <p className="text-base leading-relaxed text-warm-gray">
                    Opening addresses, plenary talks, and flagship presentations setting the direction for the conference. Big-picture perspectives on healthcare delivery, policy, and the future of private practice.
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
            <section className="bg-mint-whisper px-24 py-12">
              <div className="w-full max-w-6xl mx-auto">
                <header className="mb-16">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="bg-fresh-green/10 p-3 text-fresh-green">
                      <span className="material-symbols-outlined text-[32px]">groups</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">
                      Featured &amp; Panel Speakers
                    </h2>
                  </div>
                  <p className="text-base leading-relaxed text-warm-gray">
                    Workshop leads, moderators, and panelists bringing depth to themed tracks — clinical excellence, financing, operations, and innovation.
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
              className="scroll-mt-24 bg-mint-whisper px-24 py-12"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-primary/10 p-3 text-primary">
                      <span className="material-symbols-outlined text-[32px]">star</span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-4">
                    Special Guests
                  </h2>
                  <p className="text-warm-gray text-lg">
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

      <section className="bg-primary px-4 py-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-4xl font-serif font-bold text-white/90 leading-tight">Ready to Join Us?</h2>
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
