"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaMusic, FaUser } from "react-icons/fa";

const navItems = [
  { href: "/", label: "Home", icon: <FaHome /> },
  { href: "/library", label: "Library", icon: <FaMusic /> },
];

export default function NavBar() {
  const pathname = usePathname();

  if(pathname.startsWith(`/player/`)){
    return
  }
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 text-white md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs transition ${
                active ? "text-pink-400 font-bold scale-105" : "text-white/60"
              }`}
            >
              <span className="text-lg mb-0.5">{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
