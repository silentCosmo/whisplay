import Header from "@/components/Header";

export default function Settings() {
  return (
    <>
      <Header />
      <div className="p-6 max-w-xl mx-auto space-y-4 text-center">
        <h2 className="text-2xl font-bold">⚙️ Settings</h2>
        <p className="text-glow/70">Made with love for Hi-Res audiophiles and nostalgic dreamers.</p>
        <p className="text-xs text-pinky">By silentCosmo, in ❤️ with every FLAC.</p>
      </div>
    </>
  );
}
