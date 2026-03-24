export default function GalleryPage() {
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

  const images: { id: string; url: string; alt: string }[] = [];

  return (
    <main className="min-h-screen bg-background-light">
      <section className="border-b border-[#f4f0f0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-center md:py-14">
          <h1 className="text-3xl font-black tracking-tight text-[#181112] md:text-4xl">
            Gallery
          </h1>
          <p className="mx-auto max-w-2xl text-sm md:text-base text-gray-600">
            Moments from last year&apos;s ANPMP Lagos AGM / Scientific Conference.
            Watch the highlight reels and explore photos from the event.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 space-y-10">
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
                <h2 className="text-sm font-semibold text-[#181112] md:text-base">
                  {video.title}
                </h2>
                <p className="mt-1 text-xs text-gray-500 md:text-sm">
                  Streaming via YouTube Live recordings.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#181112] md:text-xl">
              Photo Highlights
            </h2>
            <p className="text-sm text-gray-600">
              A curated selection of photos from previous conferences. Check back for new highlights as more moments are captured and shared here.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex h-24 items-center justify-center rounded-xl bg-white/60">
                Coming soon: gallery images from last year&apos;s event.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-4/3 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

