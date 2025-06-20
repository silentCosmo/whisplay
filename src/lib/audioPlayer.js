import { Howl } from "howler";

let howlInstance = null;

export function loadAndPlaySong(song, onEndCallback = () => {}) {
  if (howlInstance) {
    howlInstance.stop();
    howlInstance.unload();
  }

  howlInstance = new Howl({
  src: [
    song.url,              // primary source
    song.url.replace(".flac", ".mp3"), // fallback if available
  ],
  html5: true,
  onend: onEndCallback,
  onloaderror: (id, err) => {
    console.error("Audio load error:", err);
  },
    onplayerror: (id, err) => {
      console.error("Audio play error:", err);
      howlInstance.once("unlock", () => {
        howlInstance.play();
      });
    },
    onload: () => {
      howlInstance.play();
    },
  });
}

export function togglePlayPause() {
  if (!howlInstance) return;

  if (howlInstance.playing()) {
    howlInstance.pause();
  } else {
    howlInstance.play();
  }
}

export function isPlaying() {
  return howlInstance?.playing() || false;
}

export function getSeek() {
  return howlInstance ? howlInstance.seek() : 0;
}

export function setSeek(value) {
  if (howlInstance) {
    howlInstance.seek(value);
  }
}

export function getDuration() {
  return howlInstance ? howlInstance.duration() : 0;
}

export function setVolume(vol) {
  if (howlInstance) {
    howlInstance.volume(vol);
  }
}

export function stopPlayback() {
  if (howlInstance) {
    howlInstance.stop();
  }
}

export function unloadSong() {
  if (howlInstance) {
    howlInstance.unload();
    howlInstance = null;
  }
}
