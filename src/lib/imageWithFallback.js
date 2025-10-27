import { useState } from "react";
import Image from "next/image";

const ImageWithFallback = ({
  src,
  alt,
  width,
  height,
  fallbackSrc,
  className = "",
  fill,
  style
}) => {
  const [imageError, setImageError] = useState(false);

  // If no fallbackSrc is provided, use default /loading.jpg
  const fallbackImage = fallbackSrc || "/loading.jpg";

  // Transform Google Drive URL to use your proxy
  const getProxiedSrc = (src) => {
    if (!src) return fallbackImage;

    // Only proxy Google Drive URLs
    if (src.includes("drive.google.com")) {
      return `/api/drive-image?url=${encodeURIComponent(src)}`;
    }
    return src;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const finalSrc = imageError ? fallbackImage : getProxiedSrc(src);

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      placeholder="blur"
      blurDataURL={finalSrc}
      fill={fill}
      style={style}
      className={className}
      onError={handleImageError}
      unoptimized={true} // important: disable Vercel image optimization
    />
  );
};

export default ImageWithFallback;
