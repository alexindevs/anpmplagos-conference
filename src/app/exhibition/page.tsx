import LoadMoreExhibitors from "@/app/components/LoadMoreExhibitors";
import Image from "next/image";
import Link from "next/link";

const GOLD_SPONSORS = [
  {
    slug: "medicorp-solutions",
    name: "MediCorp Solutions",
    description:
      "Leading the way in patient diagnostics with AI-driven imaging and comprehensive care management platforms.",
    icon: "biotech",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcd-9J-o2bOr7st8J6bmTy_IHlXIKwxCnhtbC8R8qIpXMirp4h3XCMkWJ4qsJQlLRHs25yRpgn_v2XENwSmoVjqo3i1HjWvAZ-h_wM2c54zoUShFr07HGnAAKgOL6OznV8u-pXFQcsVzecEghIxCUlW-gVZFsPm4dPEZ34DjEq1VoZ77ppJbbINkIYjUd-J5HN_VhNihAUUPIgAFh8vOyGAVEzGqUiV05Atz5liyZlgHdyeAnuZCM91YyaQyEp6Bfz_93hGpi61Eon",
    imageAlt: "Abstract blue technology pattern representing MediCorp branding",
  },
  {
    slug: "pharmaplus",
    name: "PharmaPlus",
    description:
      "Innovation for a healthier tomorrow through next-generation pharmaceuticals and accessible treatment plans.",
    icon: "cardiology",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4qtW8K6OKOKStGPQOVFTzXMRXoU-HfhPo64Xd7EFK5lvql_ySWuYZI4qEsVBfVyGtksOQOt2shnzERGyztw2vKFIaxZiHa99w2nbekSX16CVWmcsDf6NxhnNr_2cYHNsOuu29YqTkzXrWt-uwdFHbXeoB3I-HaImshc8FWVrozqFgGWmcyHjOphhZbdCiAwy9TJZjRqGUgt8SE1qZNnD2Vts1sGRuTd6x2S--HcQer83d9dYbmH4NkS00U-o3gcfe57VEIkGXXs5G",
    imageAlt: "Clean minimal medical cross pattern for PharmaPlus",
  },
];

const SILVER_EXHIBITORS = [
  {
    slug: "genx-labs",
    name: "GenX Labs",
    description:
      "Advanced genetic screening solutions for modern clinical practices.",
    icon: "genetics",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    slug: "heartsafe",
    name: "HeartSafe",
    description: "Portable ECG monitoring devices for remote patient care.",
    icon: "ecg_heart",
    iconBg: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    slug: "neurotech",
    name: "NeuroTech",
    description:
      "Brain-computer interfaces for rehabilitation and therapy.",
    icon: "neurology",
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    slug: "carefirst",
    name: "CareFirst",
    description:
      "Streamlined administrative tools for hospitals and private clinics.",
    icon: "medical_services",
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    slug: "vaxglobal",
    name: "VaxGlobal",
    description:
      "Global distribution networks for essential immunization programs.",
    icon: "vaccines",
    iconBg: "bg-teal-50 dark:bg-teal-900/20",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    slug: "redcross-tech",
    name: "RedCross Tech",
    description: "Innovative blood banking and donor management software.",
    icon: "bloodtype",
    iconBg: "bg-rose-50 dark:bg-rose-900/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];

export const metadata = {
  title: "Exhibition Booth Directory - ANPMP Conference",
  description:
    "Explore the virtual exhibition hall. Connect with industry leaders and discover cutting-edge solutions for the ANPMP community.",
};

export default function ExhibitionPage() {
  return (
    <main className="flex min-h-screen w-full grow flex-col items-center">
      {/* Page Header */}
      <section className="flex w-full max-w-[1280px] flex-col gap-6 px-4 py-10 sm:px-10">
        <div className="flex max-w-2xl flex-col gap-3">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#181112]">
            Our Exhibitors & Partners
          </h1>
          <p className="text-lg leading-normal text-[#896165]">
            Explore the virtual exhibition hall. Connect with industry
            leaders and discover cutting-edge solutions for the ANPMP
            community.
          </p>
        </div>
      </section>

      {/* Gold Sponsors Section */}
      <section className="w-full border-y border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#181112]">
              Gold Sponsors
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {GOLD_SPONSORS.map((sponsor) => (
              <div
                key={sponsor.name}
                className="group flex flex-col items-stretch gap-6 rounded-xl border-l-4 border-l-amber-400 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:flex-row"
              >
                <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:min-h-48 sm:w-48">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-5xl">
                      {sponsor.icon}
                    </span>
                  </div>
                  <Image
                    src={sponsor.image}
                    alt={sponsor.imageAlt}
                    fill
                    className="object-cover opacity-0"
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-[#181112] transition-colors group-hover:text-primary">
                        {sponsor.name}
                      </h3>
                      <span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Gold
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#896165]">
                      {sponsor.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href={`/exhibition/${sponsor.slug}`}
                      className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 sm:flex-none"
                    >
                      Visit Booth
                    </Link>
                    <button
                      type="button"
                      className="flex size-10 items-center justify-center rounded-lg border border-gray-200 text-[#896165] transition-colors hover:border-primary hover:text-primary"
                    >
                      <span className="material-symbols-outlined">
                        bookmark
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Silver Exhibitors Section */}
      <section className="w-full bg-white px-4 py-12 sm:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-full bg-gray-100 p-2 text-gray-500">
              <span className="material-symbols-outlined">
                workspace_premium
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#181112]">
              Silver Exhibitors
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SILVER_EXHIBITORS.map((exhibitor) => (
              <div
                key={exhibitor.name}
                className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-16 items-center justify-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full ${exhibitor.iconBg} ${exhibitor.iconColor}`}
                    >
                      <span className="material-symbols-outlined">
                        {exhibitor.icon}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#181112]">
                      {exhibitor.name}
                    </h3>
                  </div>
                </div>
                <p className="line-clamp-2 flex-1 text-sm text-[#896165] mb-6">
                  {exhibitor.description}
                </p>
                <Link
                  href={`/exhibition/${exhibitor.slug}`}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#181112] transition-colors hover:border-primary hover:text-primary"
                >
                  View Details
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <LoadMoreExhibitors />
        </div>
      </section>
    </main>
  );
}
