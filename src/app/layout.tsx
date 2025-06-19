import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/utils/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Classroom",
  description: "AI Classroom",
  icons: {
    icon: "/commerciallogo.png",
    shortcut: "/commerciallogo.png",
    apple: "/commerciallogo.png",
  },
  openGraph: {
    title: "AI Classroom",
    description: "AI Classroom",
    url: "https://aiclassroom.com",
    siteName: "AI Classroom",
    images: [
      {
        url: "/commerciallogo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Classroom",
    description: "AI Classroom",
    images: ["/commerciallogo.png"],
    creator: "@aiclassroom",
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Classroom",
    startupImage: [
      {
        url: "/commerciallogo.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
        {/* Force desktop layout on mobile */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
