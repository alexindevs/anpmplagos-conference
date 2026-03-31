import Image from "next/image";
import type { GalleryItem } from "@/lib/api";

async function fetchGallery(): Promise<GalleryItem[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/gallery`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as GalleryItem[]) : [];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const videos = [
    {
      id: "day1",
      title: "Day 1 – Social Night & Opening (Last Year)",
      url: "https://www.youtube.com/embed/bpJMqIvRIa8",
    },
    {
      id: "day2",
      title: "Day 2 – Scientific Sessions & AGM (Last Year)",
      url: "https://www.youtube.com/embed/m5M1OByylCY",
    },
  ];

  const images = await fetchGallery();

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-medical-green py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">Gallery</h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Highlights from previous ANPMP Lagos conferences.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-4">Video Highlights</h2>
          <p className="text-warm-gray text-lg">Watch the full conference recordings from last year.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col overflow-hidden bg-white border-l-4 border-fresh-green shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative w-full pt-[56.25%]">
                <iframe
                  src={video.url}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="px-6 py-4">
                <h2 className="text-base font-bold text-charcoal">{video.title}</h2>
                <p className="mt-1 text-sm text-warm-gray">Full conference recording on YouTube.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal mb-4">Photo Highlights</h2>
            <p className="text-warm-gray text-lg">
              Moments captured from previous conferences.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="border border-dashed border-mint-whisper bg-mint-whisper p-12 text-center">
              <p className="text-warm-gray">No photos in the gallery yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((item) => (
                <figure
                  key={item.id}
                  className="group overflow-hidden bg-white border-l-4 border-medical-green shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-4/3 w-full bg-gray-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.caption?.trim() ? item.caption : "Conference photo"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  {item.caption?.trim() ? (
                    <figcaption className="px-4 py-3 text-left text-sm text-warm-gray">
                      {item.caption.trim()}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
