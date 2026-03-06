import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "~/components/Navbar";

export const metadata: Metadata = {
  title: "HomeoPharm BD – Trusted Homeopathic Pharmacy",
  description: "Bangladesh's trusted online homeopathic pharmacy. Shop remedies, mother tinctures, biochemic tablets and topical ointments with fast delivery.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: ["homeopathy", "homeopathic pharmacy", "Bangladesh", "remedies", "mother tinctures", "biochemic"],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
