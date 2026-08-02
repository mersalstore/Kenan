import type { Metadata } from "next";
import Script from "next/script";
import "material-symbols/outlined.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kenan4saftey.com"),
  title: "شركة كنان لأنظمة الأمن والسلامة ومكافحة الحريق بالمملكة | Kanan Safety",
  description: "شركة كنان متخصصة في توريد، تركيب، وتشغيل أنظمة الأمن والسلامة ومكافحة الحريق، والمعاينة المجانية، والصيانة الدورية للمنشآت في المملكة العربية السعودية.",
  keywords: [
    "كنان للسلامة",
    "أنظمة أمن وسلامة",
    "مكافحة الحريق",
    "إنذار حريق",
    "صيانة أنظمة السلامة",
    "الدفاع المدني السعودية",
    "توريد أنظمة السلامة",
    "شركة سلامة بالرياض",
  ],
  authors: [{ name: "شركة كنان للسلامة" }],
  creator: "شركة كنان للسلامة",
  publisher: "شركة كنان للسلامة",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://kenan4saftey.com",
  },
  verification: {
    google: "google739000ffe29a8762",
    other: {
      "msvalidate.01": "A950C4212B293492A56F5EB617FCD3F3",
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/kenan-icon.png",
  },
  openGraph: {
    title: "شركة كنان لأنظمة الأمن والسلامة ومكافحة الحريق",
    description: "ننفّذ ونشغّل أنظمة الحماية من أول معاينة إلى آخر تقرير صيانة معتمد من الدفاع المدني.",
    url: "https://kenan4saftey.com",
    siteName: "كنان للسلامة والحلول الهندسية",
    images: [
      {
        url: "/images/service-poster-1.png",
        width: 1200,
        height: 630,
        alt: "شركة كنان لأنظمة الأمن والسلامة",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "شركة كنان لأنظمة الأمن والسلامة",
    description: "حلول هندسية متكاملة في مجال الأمن والسلامة ومكافحة الحريق في المملكة.",
    images: ["/images/service-poster-1.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "شركة كنان لأنظمة الأمن والسلامة",
    image: "https://kenan4saftey.com/kenan-logo.png",
    "@id": "https://kenan4saftey.com",
    url: "https://kenan4saftey.com",
    telephone: "+966574590198",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "الرياض",
      addressLocality: "الرياض",
      addressRegion: "الرياض",
      postalCode: "11564",
      addressCountry: "SA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 24.7136,
      longitude: 46.6753,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Saturday"
      ],
      opens: "08:00",
      closes: "18:00",
    },
    sameAs: [
      "https://wa.me/966574590198"
    ],
  };

  return (
    <html lang="ar" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
