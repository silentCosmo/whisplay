"use client";
import { useEffect, useRef, useState } from "react";

export default function SyncStatus() {
  const [logs, setLogs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [force, setForce] = useState(false);
  const logRef = useRef(null);

  const startSync = () => {
    if (syncing) return;
    setLogs([]);
    setSyncing(true);

    const eventSource = new EventSource(
      `/api/sync${force ? "?force=true" : ""}`
    );

    eventSource.onmessage = (e) => {
      setLogs((prev) => [...prev, e.data]);

      // Auto-scroll to bottom
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }

      // Close if sync is complete
      if (e.data.startsWith("🎉") || e.data.startsWith("❌")) {
        eventSource.close();
        setSyncing(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ Sync error", err);
      setLogs((prev) => [...prev, "❌ Connection lost or failed."]);
      eventSource.close();
      setSyncing(false);
    };
  };

  return (
    <div className="p-4 text-pink-300 bg-black rounded max-w-xl mx-auto space-y-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          onClick={startSync}
          className={`px-4 py-2 rounded font-semibold transition ${
            syncing
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-pink-600 hover:bg-pink-500"
          } text-white`}
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "Start Sync"}
        </button>

        <label className="flex items-center gap-1 text-sm text-pink-400">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            className="accent-pink-500"
            disabled={syncing}
          />
          Force Sync
        </label>
      </div>

      <pre
        ref={logRef}
        className="bg-black/80 border border-pink-500 rounded p-4 text-sm h-64 overflow-auto whitespace-pre-wrap"
      >
        {logs.map((line, idx) => (
          <div
            key={idx}
            className={
              line.startsWith("❌")
                ? "text-red-400"
                : line.startsWith("✅")
                ? "text-green-400"
                : line.startsWith("📀") || line.startsWith("🎉")
                ? "text-blue-400 font-semibold"
                : ""
            }
          >
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
}
