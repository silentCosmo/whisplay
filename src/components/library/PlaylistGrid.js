"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import usePersistentState from "@/lib/usePersistentState";

export default function PlaylistGrid() {
  const [playlists, setPlaylists] = usePersistentState("userPlaylists", []);
  const [showAll, setShowAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (playlists.length >= 10) return alert("🚫 Max 10 playlists allowed");

    const id = Date.now().toString();
    const newPlaylist = { id, name: newName.trim(), songs: [] };
    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);
    setNewName("");
    setModalOpen(false);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white/80 font-medium text-lg">Your Playlists</h3>
        {playlists.length > 6 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-rose-400 hover:underline text-sm font-semibold"
          >
            View All
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="text-rose-400 hover:underline text-sm font-semibold"
          >
            Show Less
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Create Playlist Card */}
        <div
          onClick={() => setModalOpen(true)}
          className="bg-white/5 hover:bg-rose-500/20 backdrop-blur rounded-xl text-white/80 p-4 flex flex-col items-start justify-center cursor-pointer transition"
        >
          <Plus className="mb-2" size={24} />
          <p className="font-semibold text-sm">Create Playlist</p>
        </div>

        {/* User Playlists */}
        {(showAll ? playlists : playlists.slice(0, 6)).map((pl) => (
          <div
            key={pl.id}
            onClick={() => router.push(`/library/playlists/${pl.id}`)}
            className="bg-white/5 p-4 rounded-xl text-white/80 hover:bg-white/10 transition cursor-pointer truncate"
            title={`${pl.name} - ${pl.songs.length} songs`}
          >
            <p className="font-semibold truncate">{pl.name}</p>
            <p className="text-xs text-white/50">{pl.songs.length} songs</p>
          </div>
        ))}
      </div>

      {/* Create Playlist Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] p-6 rounded-xl w-[90%] max-w-sm space-y-4">
            <h2 className="text-white text-lg font-semibold">Create Playlist</h2>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/70 hover:text-white px-4 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-rose-500 text-white px-4 py-1 rounded-md hover:bg-rose-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}