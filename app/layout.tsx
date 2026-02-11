import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import "./globals.css";

const sfPro = localFont({
  src: "./fonts/sf-pro-display-bold.otf",
  variable: "--font-sf-pro",
});

export const metadata: Metadata = {
  title: {
    default: "MeetingIntel - AI-Powered Meeting Intelligence",
    template: "%s | MeetingIntel",
  },
  description: "Never miss a follow-up again. Record meetings, get instant AI transcriptions, summaries, action items, and auto-generated follow-up emails.",
  keywords: [
    "meeting transcription",
    "AI meeting notes",
    "meeting intelligence",
    "sales call recording",
    "meeting summary",
    "action items",
    "follow-up emails",
  ],
  authors: [{ name: "MeetingIntel" }],
  creator: "MeetingIntel",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meetingintel.com",
    siteName: "MeetingIntel",
    title: "MeetingIntel - AI-Powered Meeting Intelligence",
    description: "Never miss a follow-up again. Record meetings, get instant AI transcriptions, summaries, action items, and auto-generated follow-up emails.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MeetingIntel - AI Meeting Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetingIntel - AI-Powered Meeting Intelligence",
    description: "Never miss a follow-up again. AI transcription, summaries & action items.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${sfPro.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
