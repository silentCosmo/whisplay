import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <div className="p-6 text-center space-y-6">
        <h1 className="text-4xl font-bold text-pinky">Welcome to Whisplay</h1>
        <p className="text-glow/80 text-lg">
          A soft, nostalgic hi-res player built with care 💿
        </p>
        <Link href="/library">
          <button className="px-6 py-2 mt-4 bg-pinky text-black rounded-full font-semibold hover:scale-105 transition">
            🎧 Browse Music
          </button>
        </Link>
      </div>
    </>
  );
}
