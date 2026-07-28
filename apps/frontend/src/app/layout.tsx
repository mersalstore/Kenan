import type { Metadata } from "next";
import Script from "next/script";
import "material-symbols/outlined.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "نظام كنان لإدارة المشاريع ومكافحة الحريق | Kanan ERP",
  description: "نظام كنان لإدارة المشاريع وتتبع مراحل التنفيذ والمواقع وعروض الأسعار والتقارير المعتمدة.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
