import CopyLinkButton from "@/app/components/CopyLinkButton";
import Link from "next/link";
import { notFound } from "next/navigation";

const EXHIBITOR_PROFILES: Record<
  string,
  {
    name: string;
    tagline: string;
    badge: "Gold" | "Silver";
    bannerImage: string;
    logoImage: string;
    aboutParagraphs: string[];
    booth: string;
    website: string;
    email: string;
    products: { name: string; description: string; image: string; imageAlt: string }[];
    representatives: { name: string; title: string; image: string; imageAlt: string }[];
  }
> = {
  "medtech-solutions": {
    name: "MedTech Solutions Inc.",
    tagline:
      "Leading the way in pediatric medical devices and telehealth software.",
    badge: "Gold",
    bannerImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBugSQV-WTRWok262BPfB6Fuf3JqYw_Z0PpvBEd8FDeb7WJRRaqV5LswDYGd5pEFiUtlxK_p2S5TTSzXT3ow8mPC9f24618iQSWP6jqIvbpWlfO5f-nT1C7DswbGrHkUTARzA_xQiZGy2A2iRR8E1kAo4BQfaNtognBDN6zcA7Gc48sYfEH8uR3ct9lz7q7ZbIZ0hPS82d2yAGhq12OfG2F6FxyvZhZ4j9Hx4iXW-5CCdkCFszH_ZEeQ6eyyfuLty8dSsHd2I56qozz",
    logoImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbxazdaafnYwEKMkaItMQjsxB7C07yZ4MfmvqIezXL8bDwCfs7n7OIeZHn71gxEqJgmdV4K3NqXax7DZKcW1U8sQPv1NH12UzBulZgZFPJC3vd1gk4F-uwXsLHXOqKgsysPb4vDGy5nanT_8akRkqqgOtPIbx642oOOgUWLvOT6RQSTfjdiO-JtJXLe2ZxeX506JhcJsk0e_xMmrZb4rJ29vQMqv8_k8idTJQl7mb-OziILZNECzvWYOMLSmJpGfaX8OHqap81NEX5",
    aboutParagraphs: [
      "Innovating the future of pediatric medicine. Our mission is to provide accessible healthcare solutions to children worldwide through advanced technology and compassionate care. At MedTech Solutions, we believe that every child deserves the best start in life.",
      "Founded in 2010, we have grown from a small startup to a global leader in non-invasive diagnostic tools. Our team of dedicated engineers and medical professionals work tirelessly to bridge the gap between complex medical needs and user-friendly technology.",
      "Join us at Booth #402 to experience our latest innovations firsthand and discuss how we can partner to improve patient outcomes in your facility.",
    ],
    booth: "Booth #402, Hall B",
    website: "www.medtechsolutions.com",
    email: "contact@medtechsolutions.com",
    products: [
      {
        name: "MediScan Pro V4",
        description:
          "Next-generation non-invasive diagnostic scanner designed specifically for pediatric physiology.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBwifGLqZgXTuLTr7Quo0P4bj_XnMwVl-godQ-BOimMPVwZd3aRFhSR0PxV7yJ2kC1dM4QMCql7gfulqhEJ5um4Fnt6RfS_1VQFcW9ebdNCEsK4YMayGHmH6QKJuPntPKQuB-1icp5iDanbBUTZQyQZIOEU72laP0rn_FntrVR3O26vWR_7c-n7h4IQG5Zzqo_10yzqRug_1NulzoxHTCb3tf0GmTif88Lp0kV5BsBhQGRuniZciMglfxf7BVIK_PEcy5cPrfbM5TeV",
        imageAlt: "Advanced pediatric scanner device on a clean table",
      },
      {
        name: "TeleCare Suite",
        description:
          "A comprehensive software platform for remote patient monitoring and virtual consultations.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAHf8uiAjWfc386qS1X7_T5kX1c0d2BP0M8NO8PJBfvxitxFZKBDDh0AjRCyoq0Ilxs6OtlqEqaxv6JtRLiZWZdbvHGfXyTzxhtd0UNnT-p32Ncocl7oUo8ZYGqaQ47FOiTKcetb1M9ZCc1ZhHCKoMiJ6eGdnTd-J2lAAvmdiNPUUnL_JJ9jEDW6hN1XS1IPLWBr5XDm9WAV9gWO_VMi0udBGnE6Kz8wLVB1XHJljxMBO7knodtP2Evek3PBQFPzpyXH5xDbB_GTWAj",
        imageAlt: "Tablet displaying telehealth software interface",
      },
      {
        name: "SmartVitals Watch",
        description:
          "Continuous vital sign monitoring wearable for ambulatory patients in hospital settings.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAoncVfCI3wCJGuCpDV-q8Zm80b2hE6mMH5xm7NKSNQsV9xAeLZdxfOHETMETlK3jt8myTMZfCQeBHEi2mLiyxyFrgkFCVHVvweTHwuM7sLuYQn_Zms3ickL8UtOeKBdb9PeKM7Q1QJWMmxiCkT1c_KvVsvt9E0groBwdmLdZAWyPgzCBwdMPBiYzjHyqEe8Qvts2ctu_lMCcIh647-9Kro_33z1HBCqz1333kmstT7wiHJVnmzOxql6u8gvU-9Mk6yFv80BDgNF0jj",
        imageAlt: "Medical smart wearable device close up",
      },
      {
        name: "DataAnalytics AI",
        description:
          "AI-powered analytics engine to predict patient risks and optimize hospital resource allocation.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAS9mlP3WooBlpSLeLHgPl3QxIci-CiqG_5af-S4M-vTNqJ2MdwHhHIhR2ElIHVEGT8eegLUgexd5g2TvlfK6-yl3tRsKAwYgk9dvAph_cntbzzP7e5s9Thm-yOKF6gx24qGpfZbIfSSf5C6vZC-pRpr-pUQqbP-elWqj8_PJkYHfZF9Lm42SEZM_mnircx-HwVklnGlHAsaicPEXCLdZf2kahzFX6D_eK0xMllLEu5lTSbkChdMTyXyCcEoYsGCwE5VSvMnKJPnFpQ",
        imageAlt: "Doctors analyzing data on a large screen",
      },
    ],
    representatives: [
      {
        name: "Sarah Jenkins",
        title: "VP of Sales",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAz5AJRP5vs-aqJSAcH61shVSKK84R6Q0jdBbPubjDEjD4hh9rFwFqJgJS26rvGCi1k-wQSzcxwuSti_u8JNyZ8KZYUkmw4WOgeA0nDY4YY-aCYmfZmwjbWxF6Q61S35AU5mPZqZfqsynKks_qjNBmH1S-uZA__n1GrxyJK-MR9N61u1MMsNBXViIrwaDZ0cOMpGRP8oTDc5xnRWmH9KqRn0IW9ug0hxl7-Sy-ibvhXgO5Pqcs8QI8gYJXZrLDMHYxnrb1Vbvofr3b9",
        imageAlt: "Portrait of Sarah Jenkins",
      },
      {
        name: "Michael Chen",
        title: "Product Manager",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA8V2CrF0FLtcSrQg3B6bBRsQ_QBaRmWhrbXsILF2-_Fb5Y2oe1DxntSfXrq2tHP-BBIENpTzi1yfRCEMb2mmLfAJ19K4TxyxVDKpV6aHcdkap7kJIsL5NsjJ8uhHoQGLqwbav-DFT0jUNPbKxS5UHXKdZW6WGBNC-quYle97VnPs9z2S1zFmcEl5iWAwNZza7Hy0b-ph3GncKHTlpRltzIRaTMK5jnlQQgiBCaEebk9dippLDWmtgXOCaRz0D4hAjhdmJyy672WlR8",
        imageAlt: "Portrait of Michael Chen",
      },
      {
        name: "Elena Rodriguez",
        title: "Clinical Specialist",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBdT-k4E_3GTgjrc3TFmDzag8AhZxqpwwAiOZdcnRF4Qsa-XVlpttffi7trlx4gW06c0uDUdSNiCxQoJhAVehV9GJeUdr3dikeM53ZZMEXyGAa20Lc595kRon9mbYVQ60CJBwi-RAJbnFdiqAX8mLWdpOnp3StXVkH8-VNTsP135PXcoa2BfGVvzZAyvcIvQvDcOFdmbRlWxmAKas_iXVuvJPVy0nxI9jtTUkFTKVsB4UX9Afhv_3TrGQb7oKMuzNEnivXbni20LWtc",
        imageAlt: "Portrait of Elena Rodriguez",
      },
    ],
  },
};

type ExhibitorProfile = (typeof EXHIBITOR_PROFILES)["medtech-solutions"];

const SLUG_OVERRIDES: Record<string, Partial<ExhibitorProfile>> = {
  "medicorp-solutions": {
    name: "MediCorp Solutions",
    tagline:
      "Leading the way in patient diagnostics with AI-driven imaging and comprehensive care management platforms.",
    badge: "Gold",
    booth: "Booth #101, Hall A",
    website: "www.medicorpsolutions.com",
    email: "contact@medicorpsolutions.com",
  },
  pharmaplus: {
    name: "PharmaPlus",
    tagline:
      "Innovation for a healthier tomorrow through next-generation pharmaceuticals and accessible treatment plans.",
    badge: "Gold",
    booth: "Booth #205, Hall A",
    website: "www.pharmaplus.com",
    email: "contact@pharmaplus.com",
  },
  "genx-labs": {
    name: "GenX Labs",
    tagline:
      "Advanced genetic screening solutions for modern clinical practices.",
    badge: "Silver",
    booth: "Booth #201, Hall B",
    website: "www.genxlabs.com",
    email: "contact@genxlabs.com",
  },
  heartsafe: {
    name: "HeartSafe",
    tagline: "Portable ECG monitoring devices for remote patient care.",
    badge: "Silver",
    booth: "Booth #202, Hall B",
    website: "www.heartsafe.com",
    email: "contact@heartsafe.com",
  },
  neurotech: {
    name: "NeuroTech",
    tagline:
      "Brain-computer interfaces for rehabilitation and therapy.",
    badge: "Silver",
    booth: "Booth #203, Hall B",
    website: "www.neurotech.com",
    email: "contact@neurotech.com",
  },
  carefirst: {
    name: "CareFirst",
    tagline:
      "Streamlined administrative tools for hospitals and private clinics.",
    badge: "Silver",
    booth: "Booth #204, Hall B",
    website: "www.carefirst.com",
    email: "contact@carefirst.com",
  },
  vaxglobal: {
    name: "VaxGlobal",
    tagline:
      "Global distribution networks for essential immunization programs.",
    badge: "Silver",
    booth: "Booth #205, Hall B",
    website: "www.vaxglobal.com",
    email: "contact@vaxglobal.com",
  },
  "redcross-tech": {
    name: "RedCross Tech",
    tagline: "Innovative blood banking and donor management software.",
    badge: "Silver",
    booth: "Booth #206, Hall B",
    website: "www.redcrosstech.com",
    email: "contact@redcrosstech.com",
  },
};

function getExhibitor(slug: string): ExhibitorProfile | null {
  const full = EXHIBITOR_PROFILES[slug];
  if (full) return full;
  const overrides = SLUG_OVERRIDES[slug];
  if (overrides) {
    return { ...EXHIBITOR_PROFILES["medtech-solutions"], ...overrides };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exhibitor = getExhibitor(slug);
  if (!exhibitor) return { title: "Exhibitor - ANPMP Conference" };
  return {
    title: `Exhibitor Profile - ${exhibitor.name} | ANPMP Conference`,
    description: exhibitor.tagline,
  };
}

export default async function ExhibitorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exhibitor = getExhibitor(slug);
  if (!exhibitor) notFound();

  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-10 sm:py-10">
      {/* Hero / Profile Header */}
      <div className="relative mb-8 w-full overflow-hidden rounded-xl border border-[#e6e0e0] bg-white shadow-sm">
        <div
          className="relative h-48 w-full bg-cover bg-center"
          style={{ backgroundImage: `url("${exhibitor.bannerImage}")` }}
          data-alt="Exhibitor banner"
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        </div>
        {/* Logo only: half overlapping the banner */}
        <div className="relative -mt-12 px-6 sm:-mt-16 sm:px-10">
          <div className="relative z-10 inline-block rounded-lg border border-[#e6e0e0] bg-white p-2 shadow-md">
            <div
              className="h-24 w-24 rounded bg-white bg-cover bg-center bg-no-repeat sm:h-32 sm:w-32"
              style={{ backgroundImage: `url("${exhibitor.logoImage}")` }}
              data-alt={`${exhibitor.name} logo`}
            />
          </div>
        </div>
        {/* Title, tagline, badge, share: below the header image */}
        <div className="flex flex-col items-start gap-6 px-6 pb-6 pt-6 sm:flex-row sm:items-start sm:px-10">
          <div className="mb-2 flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#181112] sm:text-3xl">
                {exhibitor.name}
              </h1>
              <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="material-symbols-outlined mr-1 text-[14px]">
                  verified
                </span>
                {exhibitor.badge} Sponsor
              </span>
            </div>
            <p className="max-w-2xl text-sm text-[#896165] sm:text-base">
              {exhibitor.tagline}
            </p>
          </div>
          <div className="mb-2 hidden sm:block">
            <CopyLinkButton
              className="rounded-full p-2 text-[#896165] transition-colors hover:bg-[#f4f0f0]"
              title="Copy page link"
            >
              <span className="material-symbols-outlined">share</span>
            </CopyLinkButton>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-10 lg:col-span-2">
          {/* About Section */}
          <section className="rounded-xl border border-[#e6e0e0] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#181112]">
              <span className="material-symbols-outlined text-primary">
                info
              </span>
              About Us
            </h2>
            <div className="max-w-none leading-relaxed text-[#181112]">
              {exhibitor.aboutParagraphs.map((p, i) => (
                <p key={i} className="mb-4">
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* Products Section */}
          <section>
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#181112]">
                <span className="material-symbols-outlined text-primary">
                  grid_view
                </span>
                Products & Services
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {exhibitor.products.map((product) => (
                <div
                  key={product.name}
                  className="group flex flex-col overflow-hidden rounded-lg border border-[#e6e0e0] bg-white transition-shadow hover:shadow-md"
                >
                  <div
                    className="h-48 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url("${product.image}")` }}
                    data-alt={product.imageAlt}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-bold text-[#181112]">
                      {product.name}
                    </h3>
                    <p className="mb-4 flex-1 text-sm text-[#896165]">
                      {product.description}
                    </p>
                    <Link
                      href="#"
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-red-700"
                    >
                      Learn more{" "}
                      <span className="material-symbols-outlined ml-1 text-[16px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column Sidebar */}
        <aside className="flex flex-col gap-6">
          {/* Contact & CTA Card */}
          <div className="rounded-xl border border-[#e6e0e0] bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="mb-4 text-lg font-bold text-[#181112]">
              Contact Information
            </h3>
            <div className="mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-[#f4f0f0] p-1.5 text-[#896165]">
                  <span className="material-symbols-outlined text-[20px]">
                    storefront
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#896165]">
                    Location
                  </p>
                  <p className="text-sm font-medium text-[#181112]">
                    {exhibitor.booth}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-[#f4f0f0] p-1.5 text-[#896165]">
                  <span className="material-symbols-outlined text-[20px]">
                    language
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#896165]">
                    Website
                  </p>
                  <a
                    href={`https://${exhibitor.website}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {exhibitor.website}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-[#f4f0f0] p-1.5 text-[#896165]">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#896165]">
                    Email
                  </p>
                  <a
                    href={`mailto:${exhibitor.email}`}
                    className="text-sm font-medium text-[#181112] hover:text-primary"
                  >
                    {exhibitor.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Representatives Card */}
          <div className="rounded-xl border border-[#e6e0e0] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#181112]">
              Booth Representatives
            </h3>
            <div className="space-y-4">
              {exhibitor.representatives.map((rep) => (
                <div key={rep.name} className="flex items-center gap-3">
                  <div
                    className="size-10 shrink-0 rounded-full border border-[#e6e0e0] bg-cover bg-center"
                    style={{ backgroundImage: `url("${rep.image}")` }}
                    data-alt={rep.imageAlt}
                  />
                  <div className="min-w-0 flex-1 truncate">
                    <p className="truncate text-sm font-bold text-[#181112]">
                      {rep.name}
                    </p>
                    <p className="truncate text-xs text-[#896165]">
                      {rep.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-[#e6e0e0] px-3 py-1.5 text-xs font-medium text-[#181112] transition-colors hover:border-primary hover:text-primary"
                  >
                    Call them
                  </button>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </main>
  );
}
