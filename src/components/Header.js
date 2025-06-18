// components/Header.jsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 border-b border-pinky bg-black/20 backdrop-blur sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-pinky">
        Whisplay ♫
      </Link>
      <nav className="space-x-4 text-sm">
        <Link href="/library" className="hover:text-pinky">Library</Link>
        <Link href="/settings" className="hover:text-pinky">Settings</Link>
      </nav>
    </header>
  );
}
