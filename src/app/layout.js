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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${quickSand.className}  antialiased bg-[red]`}
      >
        <main className="max-w-4xl mx-auto md:p-6 mb-3">{children}</main>
        <MiniPlayer/>
        <GlobalAudioPlayer/>
        <NavBar/>
      </body>
    </html>
  );
}
