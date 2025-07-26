import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import MiniPlayer from "@/components/MiniPlayer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";

const quickSand = Quicksand({
  weight:"500",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Whisplay",
  description: "Born of silence and tuned in love. 🎶💿✨",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icon-192.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${quickSand.className}  antialiased bg-[red] overflow-hidden`}
      >
        <main className="max-w-4xl mx-auto md:p-6 pb-10">{children}</main>

        <div id="animation-root" className="fixed inset-0 pointer-events-none z-[10]" />
        <MiniPlayer/>
        <GlobalAudioPlayer/>
        <NavBar/>
      </body>
    </html>
  );
}
