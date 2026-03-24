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
    <main className="min-h-screen bg-background-light">
      <section className="border-b border-[#f4f0f0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-center md:py-14">
          <h1 className="text-3xl font-black tracking-tight text-[#181112] md:text-4xl">Gallery</h1>
          <p className="mx-auto max-w-2xl text-sm text-gray-600 md:text-base">
            Moments from last year&apos;s ANPMP Lagos AGM / Scientific Conference. Watch the highlight reels and explore
            photos from the event.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="relative w-full pt-[56.25%]">
                <iframe
                  src={video.url}
                  title={video.title}
                  className="absolute inset-0 h-full w-full rounded-t-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="px-5 py-4">
                <h2 className="text-sm font-semibold text-[#181112] md:text-base">{video.title}</h2>
                <p className="mt-1 text-xs text-gray-500 md:text-sm">Streaming via YouTube Live recordings.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#181112] md:text-xl">Photo highlights</h2>
            <p className="text-sm text-gray-600">
              Photos from previous conferences. New images are added by the conference team as they become available.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              No photos in the gallery yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((item) => (
                <figure
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-4/3 w-full bg-gray-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.caption?.trim() ? item.caption : "Conference photo"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  {item.caption?.trim() ? (
                    <figcaption className="border-t border-gray-100 px-4 py-3 text-left text-sm text-gray-700">
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
