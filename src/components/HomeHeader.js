import Whisplay from "@/utils/appName";
import { Festive } from "next/font/google";
import { useEffect, useState } from "react";

const festive = Festive({
  weight: '400',
  subsets: ["latin"],
});

export function Header() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("Good night");
    else if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else if (hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  return (
    <div className="flex justify-between items-center pt-5 px-5 fixed w-full top-0 z-50 rounded-b-3xl backdrop-blur-m bg-gradient-to-b from-black to-transparent">
      <h1 /* className={`text-2xl font-bold text-white/70 tracking-tight`} */>
        <Whisplay className={`text-2xl font-extrabold text-white/70 tracking-tight`}/>
      </h1>
      <span className="text-sm md:text-base text-white/60">{greeting}!</span>
      
    </div>
  );
}
