import Link from "next/link";

export default function SongCard({ song }) {
  return (
    <Link href={`/player/${song.id}`} className="group">
      <div className="bg-black/40 backdrop-blur-lg rounded-xl p-3 shadow hover:scale-105 transition-all">
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-40 object-cover rounded-lg"
        />
        <h3 className="mt-2 font-bold">{song.title}</h3>
        <p className="text-sm text-pinky">{song.artist}</p>
      </div>
    </Link>
  );
}
