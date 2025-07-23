"use client";

import { useState } from "react";
import { Sun, Moon, Info, Trash2, Volume2 } from "lucide-react";
import usePersistentState from "@/lib/usePersistentState";
import { Moirai_One, Macondo, Eagle_Lake } from "next/font/google";
import useSongStore from "@/lib/songStore";
import Whisplay from "@/utils/appName";
import { getThemeColor } from "@/utils/getThemeColor";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = usePersistentState("whisplay-theme", true);
  const [volume, setVolume] = usePersistentState("volume", 0.8);
  const [font, setFont] = usePersistentState("whisplay-font", "Quicksand");
  const [theme, setTheme] = usePersistentState("theme", "dynamic");
  const {currentSong} = useSongStore()
  const themeColor = getThemeColor(currentSong);
  const [appName, setAppName] = usePersistentState(
    "whisplay-app-name",
    "Whisplay"
  );

  const toggleTheme = () => setDarkMode(!darkMode);

  const clearStorage = () => {
    if (confirm("Clear all app data from this device?")) {
      localStorage.clear();
      location.reload();
    }
  };

  const handleFontChange = (e) => {
    setFont(e.target.value);
  };

  const handleNameChange = (e) => {
    setAppName(e.target.value);
  };

  const handleNameBlur = () => {
    if (appName.trim() === "") {
      setAppName("Whisplay"); // fallback default
    }
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div className="max-w-screen-md h-[93dvh] overflow-auto mx-auto p-6 space-y-4 text-white">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Theme Section */}
      {/* <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <h2 className="text-lg font-medium">Appearance</h2>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition"
          >
            {darkMode ? "Dark" : "Light"} Mode
          </button>
        </div>
      </section> */}


      {/* Theme Section */}
      <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">Theme</h2>
          </div>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition"
          >
            <option value="dynamic" defaultValue>Dynamic</option>
            <option value="light" disabled>Light</option>
            <option value="dark" disabled>Dark</option>
          </select>
        </div>
      </section>

      {/* Playback Settings */}
      <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Volume2 size={20} />
            <h2 className="text-lg font-medium">Default Volume</h2>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 accent-pink-500"
            style={{accentColor: themeColor}}
          />
        </div>
      </section>

      <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Font & App Name</h2>
        </div>

        {/* Font Selection */}
        <div className="mt-4">
          <label className="block text-sm mb-2">Choose a Font</label>
          <select
            value={font}
            onChange={handleFontChange}
            className="w-full px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition"
          >
            <option value="Quicksand">Quicksand</option>
            <option value="Macondo">Macondo</option>
            <option value="Henny_Penny">Henny Penny</option>
            <option value="Moirai_One">Moirai One</option>
            <option value="Sacramento">Sacramento</option>
            <option value="Amita">Amita</option>
            <option value="Cherry_Swash">Cherry Swash</option>
          </select>
        </div>

        {/* App Name Input */}
        <div className="mt-4">
          <label className="block text-sm mb-2">App Name</label>
          <input
            type="text"
            value={appName}
            maxLength={12}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className="w-full px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition"
            placeholder="Enter Display Name for App"
          />
        </div>
      </section>

      {/* Storage / Reset */}
      <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trash2 size={20} />
            <h2 className="text-lg font-medium">Clear App Data</h2>
          </div>
          <button
            onClick={clearStorage}
            className="px-4 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/40 rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </section>

      {/* About */}
      <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10 ">
        <div className="flex items-center gap-3 mb-2">
          <Info size={20} />
          <h2 className="text-lg font-medium text-white/90">About <span style={{color: themeColor}}><Whisplay/> </span></h2>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          Whisplay is your cozy sound lounge — a minimal and elegant music
          platform handcrafted for lovers of vibes and vision. Built with love,
          motion, and many late-night debugging snacks. 💖
        </p>
        <p className="mt-4 text-xs text-white/40">
          v1.0.0 – Made with 💜 by SilentCosmo
        </p>
      </section>
    </div>
  );
}
