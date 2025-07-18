"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Settings } from "lucide-react";
import { FaCog, FaHome, FaMusic, FaSearch, FaUser } from "react-icons/fa";
import useSongStore from "@/lib/songStore";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={20} /> },
  { href: "/search", label: "Search", icon: <Search size={20} /> },
  { href: "/library", label: "Library", icon: <Library size={20} /> },
  { href: "/settings", label: "Settings", icon: <Settings size={20} /> },
];


export default function NavBar() {
  const pathname = usePathname();
  const {currentSong} = useSongStore()

  const themeColor = currentSong?.theme?.vibrant || "#e91e63";
  

  if(pathname.startsWith(`/player/`)){
    return
  }
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 text-white">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              prefetch={true}
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs transition ${
                active ? `text-[${themeColor}] font-bold scale-105` : "text-white/60"
              }`}
              style={{color: active&&themeColor}}
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
