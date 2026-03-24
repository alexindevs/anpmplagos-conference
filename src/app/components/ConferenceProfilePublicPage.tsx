import Image from "next/image";
import Link from "next/link";
import type { ConferenceProfile } from "@/lib/api";

function websiteHref(url: string | null): string | null {
  if (!url?.trim()) return null;
  const w = url.trim();
  if (w.startsWith("http://") || w.startsWith("https://")) return w;
  return `https://${w}`;
}

function bioParagraphs(bio: string): string[] {
  const parts = bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [bio.trim()].filter(Boolean);
}

export default function ConferenceProfilePublicPage({
  profile,
  listHref,
  listLabel,
  roleLabel,
}: {
  profile: ConferenceProfile;
  listHref: string;
  listLabel: string;
  /** e.g. "Speaker" or "Special guest" for metadata line */
  roleLabel: string;
}) {
  const web = websiteHref(profile.websiteLink);
  const paragraphs = bioParagraphs(profile.description ?? "");

  const socials: { href: string; label: string; icon: string }[] = [];
  if (profile.facebookLink?.trim()) {
    socials.push({ href: profile.facebookLink.trim(), label: "Facebook", icon: "public" });
  }
  if (profile.xLink?.trim()) {
    socials.push({ href: profile.xLink.trim(), label: "X", icon: "chat" });
  }
  if (profile.instagramLink?.trim()) {
    socials.push({ href: profile.instagramLink.trim(), label: "Instagram", icon: "photo_camera" });
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <section className="relative border-b border-[#e6dbdc] bg-white">
        <div className="flex flex-1 justify-center px-4 py-10 md:px-40 md:py-12">
          <div className="relative z-10 flex w-full max-w-[960px] flex-1 flex-col">
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-[#896165]">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <Link href={listHref} className="hover:text-primary">
                {listLabel}
              </Link>
              <span>/</span>
              <span className="text-primary">{profile.name}</span>
            </div>
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div className="relative mx-auto size-40 shrink-0 overflow-hidden rounded-full border-2 border-[#e6dbdc] bg-gray-100 md:mx-0 md:size-44">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    sizes="176px"
                    priority
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-3xl font-black text-primary/40">
                    {profile.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">{roleLabel}</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#181112] md:text-4xl">
                  {profile.name}
                </h1>
                <p className="mt-2 text-lg font-medium text-[#181112]">{profile.role}</p>
                {profile.qualifications?.trim() ? (
                  <p className="mt-1 text-sm text-[#896165]">{profile.qualifications}</p>
                ) : null}
                {profile.byline?.trim() ? (
                  <p className="mt-3 text-base leading-relaxed text-[#5c4a4c]">{profile.byline}</p>
                ) : null}
                {(web || socials.length > 0) && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                    {web ? (
                      <a
                        href={web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e6dbdc] bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/5"
                      >
                        <span className="material-symbols-outlined text-[20px]">language</span>
                        Website
                      </a>
                    ) : null}
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e6dbdc] bg-white px-4 py-2 text-sm font-semibold text-[#181112] shadow-sm transition-colors hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {paragraphs.length > 0 ? (
        <section className="flex flex-1 justify-center bg-white px-4 py-12 md:px-40">
          <div className="w-full max-w-[720px]">
            <h2 className="mb-6 text-xl font-bold text-[#181112]">About</h2>
            <div className="space-y-4 text-base leading-relaxed text-[#5c4a4c]">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-[#e6dbdc] bg-gray-50/80 px-4 py-10 md:px-40">
        <div className="mx-auto flex max-w-[720px] justify-center">
          <Link
            href={listHref}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to {listLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
