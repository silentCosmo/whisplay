"use client";
import GoogleLoginButton from "@/components/admin/adminLogin";
import { useEffect, useRef, useState } from "react";
import { AiOutlineSync } from "react-icons/ai";
import { ImSpinner3 } from "react-icons/im";

export default function SyncStatus() {
  const [logs, setLogs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [force, setForce] = useState(false);
  const [currentSongInfo, setCurrentSongInfo] = useState(""); // For mini display
  const [reconnecting, setReconnecting] = useState(false); // New state for reconnecting status
  const logRef = useRef(null);

  const startSync = () => {
    if (syncing) return;
    setLogs([]);
    setSyncing(true);
    setCurrentSongInfo("");
    setReconnecting(false); // Reset reconnecting status

    const eventSource = new EventSource(
      `/api/sync${force ? "?force=true" : ""}`
    );

    eventSource.onmessage = (e) => {
      const data = e.data;

      setLogs((prev) => [...prev, data]);

      // Auto-scroll to bottom
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }

      // Update current song info for mini-display
      if (data.startsWith("🎼 Syncing")) {
        setCurrentSongInfo(data.replace("🎼 ", ""));
      }

      // Close if sync is complete
      if (
        data.startsWith("🎉") ||
        data.startsWith("❌ Failed") ||
        data.includes("❌ Sync error")
      ) {
        eventSource.close();
        setSyncing(false);
        setCurrentSongInfo("");
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ Sync error", err);
      setLogs((prev) => [...prev, "❌ Sync error: Connection lost."]);
      setReconnecting(true); // Set reconnecting status
      eventSource.close();
      setSyncing(false);
      setCurrentSongInfo("");
    };
  };

  const highlightColor = (line) => {
    if (line.startsWith("❌")) return "text-red-400";
    if (line.startsWith("⚠️")) return "text-rose-500";
    if (line.startsWith("✅")) return "text-green-400";
    if (line.startsWith("🎨")) return "text-yellow-400";
    if (line.startsWith("🎼")) return "text-slate-200";
    if (line.startsWith("🎧")) return "text-purple-300";
    if (line.startsWith("🧠")) return "text-emerald-300";
    if (line.startsWith("💾")) return "text-cyan-300";
    if (line.startsWith("🗑️")) return "text-orange-400";
    if (line.startsWith("📐")) return "text-lime-300";
    if (line.startsWith("📤")) return "text-fuchsia-300";
    if (line.startsWith("📀") || line.startsWith("🎉"))
      return "text-blue-400 font-semibold";
    return "text-white";
  };

  return (
    <div className="p-4 min-h-[100dvh] text-pink-300 bg-gradient-to-br from-black via-black to-zinc-900 rounded-xl max-w-2xl mx-auto shadow-2xl border border-pink-800/40 font-mono space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={startSync}
          className={`px-5 py-2.5 rounded-md font-semibold transition-all duration-200 shadow ${
            syncing
              ? "bg-neutral-800 cursor-not-allowed animate-pulse"
              : "bg-pink-600 hover:bg-pink-500 hover:scale-105"
          } text-white`}
          disabled={syncing}
        >
          {syncing ? (
            <span className="flex items-center gap-1">
              <ImSpinner3 size={22} className="animate-spin" />{" "}
              <p>Syncing...</p>
            </span>
          ) : (
            "Start Sync"
          )}
        </button>

        <GoogleLoginButton syncing={syncing} />

        <label className="flex items-center gap-2 text-sm text-pink-400">
          <input
            type="checkbox"
            checked={force}
            style={{ cursor: syncing && "wait" }}
            onChange={(e) => {
              if (e.target.checked) {
                const pass = prompt(
                  "Enter admin passcode to enable force sync:"
                );
                if (pass === "sugarPlay") {
                  setForce(true);
                } else {
                  alert("❌ Incorrect passcode.");
                }
              } else {
                setForce(false);
              }
            }}
            className="accent-pink-500"
            disabled={syncing}
          />
          Force Sync
        </label>
      </div>

      {/* Terminal Display */}
      <pre
        ref={logRef}
        className="bg-black/90 border border-pink-500 rounded-lg p-4 text-sm h-[60dvh] overflow-auto whitespace-pre-wrap backdrop-blur"
      >
        {logs.map((line, idx) => (
          <div
            key={idx}
            className={`${highlightColor(line)} transition font-mono`}
          >
            <span className="">
              {line.startsWith("🎼") && (
                <hr className="border-dashed my-2 w-96 overflow-x-hidden" />
              )}
              {line}
            </span>
          </div>
        ))}
      </pre>

      {/* Mini Progress */}
      {currentSongInfo && (
        <div className="text-xs text-pink-400 bg-pink-800/10 border border-pink-500/50 px-3 py-2 rounded transition-all duration-300">
          <span className="text-pink-300">🎼</span> {currentSongInfo}
        </div>
      )}

      {/* Reconnecting Notice */}
      {reconnecting && (
        <div className="text-sm text-red-400">
          <ImSpinner3 size={18} className="animate-spin inline-block" />{" "}
          Reconnecting...
        </div>
      )}
    </div>
  );
}
