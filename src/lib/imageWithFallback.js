import { useState } from "react";
import Image from "next/image";

const ImageWithFallback = ({ src, alt, width, height, fallbackSrc, className = "", fill, style }) => {
  const [imageError, setImageError] = useState(false);
  //const [isFill,setIsFill] = useState({fill})
  console.log("fall", fallbackSrc);
  
  const [fallbackImage,setFallbackImage] = useState(!fallbackSrc?"/loading.jpg": fallbackSrc)

  //const fallbackImage = !fallbackSrc?"/loading.jpg": fallbackSrc;

  const handleImageError = () => {
    setImageError(true); // Set error state to true when image fails to load
  };

  return (
    <Image
      src={imageError ? fallbackImage : src}
      alt={alt}
      width={width}
      fill={fill}
      style={style}
      height={height}
      className={className}
      onError={handleImageError} // Trigger error handler
    />
  );
};

export default ImageWithFallback;
