import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PalletProvider } from "@/lib/context/PalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "House of Alex - Wholesale & Clearance Stock Supplier",
    template: "%s · House of Alex",
  },
  description:
    "Authenticated, original premium wholesale stock - perfumes, cosmetics, clothing and electronics - sold by the pallet with automated volume pricing.",
  verification: {
    google: "rcH05F7rFmdlBqxZzLo1WwVCSxDTdEWoQpC8Ruz60Yk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <PalletProvider>{children}</PalletProvider>
      </body>
    </html>
  );
}
