import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { QueryProvider } from "./providers/query-provider";
import { Toaster } from "./components/ui/toaster";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ANPMP Lagos 2026 Annual Conference",
  description:
    "Join the Association of Nigerian Private Medical Practitioners (ANPMP) Lagos Annual General Meeting / Scientific Conference 2026. Registration, speakers, sponsorship and more.",
  metadataBase: new URL("https://anpmplagos-conference.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://anpmplagos-conference.com",
    siteName: "ANPMP Lagos 2026 Annual Conference",
    title: "ANPMP Lagos 2026 Annual Conference",
    description:
      "Join the Association of Nigerian Private Medical Practitioners (ANPMP) Lagos Annual General Meeting / Scientific Conference 2026.",
    images: [
      {
        url: "/anpmp-logo.jpg",
        width: 800,
        height: 800,
        alt: "ANPMP Lagos Conference Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ANPMP Lagos 2026 Annual Conference",
    description:
      "Join the Association of Nigerian Private Medical Practitioners (ANPMP) Lagos Annual General Meeting / Scientific Conference 2026.",
    images: ["/anpmp-logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="light" lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${dmSerifDisplay.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} font-display bg-background-light dark:bg-background-dark text-charcoal antialiased`}
      >
        <QueryProvider>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
