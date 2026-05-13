import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://solarcheckng.com"),
  title: {
    default: "SolarCheck Nigeria — Find Trusted Solar Installers Near You",
    template: "%s | SolarCheck Nigeria",
  },
  description:
    "Compare verified solar installers across Nigeria. Get free quotes, read real reviews, and find the best solar energy system for your home or business.",
  keywords: [
    "solar installers Nigeria",
    "solar panel installation Lagos",
    "solar energy Nigeria",
    "solar companies Abuja",
    "best solar installers",
    "solar panel cost Nigeria",
    "solar reviews Nigeria",
    "verified solar installers",
  ],
  authors: [{ name: "SolarCheck Nigeria" }],
  creator: "SolarCheck Nigeria",
  publisher: "SolarCheck Nigeria",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "SolarCheck Nigeria",
    title: "SolarCheck Nigeria — Find Trusted Solar Installers Near You",
    description:
      "Compare verified solar installers across Nigeria. Get free quotes, read real reviews, and find the best solar energy system for your home or business.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "SolarCheck Nigeria — Trusted Solar Installer Reviews & Quotes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolarCheck Nigeria — Find Trusted Solar Installers Near You",
    description:
      "Compare verified solar installers across Nigeria. Get free quotes, read real reviews, and find the best solar energy system.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "", // Add Google Search Console verification
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        {/* JSON-LD: Organization + WebSite + SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://solarcheckng.com/#organization",
                  name: "SolarCheck Nigeria",
                  url: "https://solarcheckng.com",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://solarcheckng.com/logo.png",
                  },
                  sameAs: [],
                  description:
                    "Nigeria's most trusted solar installer comparison platform. Find verified solar companies, read reviews, and get free quotes.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://solarcheckng.com/#website",
                  url: "https://solarcheckng.com",
                  name: "SolarCheck Nigeria",
                  publisher: {
                    "@id": "https://solarcheckng.com/#organization",
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate:
                        "https://solarcheckng.com/solar-installers?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
