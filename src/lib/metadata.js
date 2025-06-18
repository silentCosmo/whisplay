import { parseBlob } from "music-metadata-browser";

export async function extractSongMetadata(file) {
  try {
    const metadata = await parseBlob(file);
    const { title, artist } = metadata.common;
    const picture = metadata.common.picture?.[0];

    const cover = picture
      ? `data:${picture.format};base64,${Buffer.from(picture.data).toString("base64")}`
      : "/default.jpg";

    return {
      title: title || file.name,
      artist: artist || "Unknown Artist",
      cover,
      file,
    };
  } catch (error) {
    console.error("Metadata read failed:", error);
    return {
      title: file.name,
      artist: "Unknown Artist",
      cover: "/default.jpg",
      file,
    };
  }
}
