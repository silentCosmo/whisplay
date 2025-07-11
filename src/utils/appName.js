import { Alkatra, Amita, Baloo_2, Cherry_Swash, Dancing_Script, Eagle_Lake, Fredoka, Henny_Penny, Lobster, Macondo, Macondo_Swash_Caps, Moirai_One, Poppins, Quicksand, Sacramento } from 'next/font/google';
import React from 'react';
import usePersistentState from '@/lib/usePersistentState';

// Initialize fonts at the top level scope
export const moiraiOneFont = Moirai_One({
  weight: "400",
  subsets: ["latin"],
});

export const macondoFont = Macondo_Swash_Caps({
  weight: "400",
  subsets: ["latin"],
});

/* export const eagleLakeFont = Eagle_Lake({
  weight: "400",
  subsets: ["latin"],
});

export const poppinsFont = Poppins({
  weight: "400",
  subsets: ["latin"],
});

export const balooFont = Baloo_2({
  weight: "400",
  subsets: ["latin"],
}); */

export const hennyPennyFont = Henny_Penny({
  weight: "400",
  subsets: ["latin"],
});

export const quicksandFont = Quicksand({
  weight: "700",
  subsets: ["latin"],
});

export const sacramentoFont = Sacramento({
  weight: "400",
  subsets: ["latin"],
});

export const amitaFont = Amita({
  weight: "700",
  subsets: ["latin"],
});

export const alkatraFont = Alkatra({
  weight: "400",
  subsets: ["latin"],
});


export default function Whisplay({className}) {
  const [appName, setAppName] = usePersistentState("whisplay-app-name", "Whisplay");
  const [font, setFont] = usePersistentState("whisplay-font", "Macondo");

  // Determine the correct font class to apply based on the user's choice
  let fontClass;
  switch (font) {
    case "Macondo":
      fontClass = macondoFont.className;
      break;
    case "Henny_Penny":
      fontClass = hennyPennyFont.className;
      break;
    case "Moirai_One":
      fontClass = moiraiOneFont.className;
      break;
      case "Sacramento":
      fontClass = sacramentoFont.className;
      break;
      case "Amita":
        fontClass = amitaFont.className;
      break;
    case "Alkatra":
      fontClass = alkatraFont.className;
      break;
      default:
      fontClass = quicksandFont.className;
      
  }

  return (
    <span className={`${fontClass} ${className || ''}`}>
      {appName} {/* Dynamically render app name */}
    </span>
  );
}
