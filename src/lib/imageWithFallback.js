import { useState } from "react";
import Image from "next/image";

const ImageWithFallback = ({ src, alt, width, height, fallbackSrc, className = "", fill, style }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackImage,setFallbackImage] = useState(!fallbackSrc?"/loading.jpg": fallbackSrc)
  const handleImageError = () => {
    setImageError(true); 
  };

  return (
    <Image
      src={imageError ? fallbackImage : src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      placeholder="blur"
      blurDataURL={imageError ? fallbackImage : src}
      fill={fill}
      style={style}
      className={className}
      onError={handleImageError}
    />
  );
};

export default ImageWithFallback;
