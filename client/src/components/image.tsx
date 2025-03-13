
import { useState } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export function Image({ src, alt, className = "", fallbackSrc = "/images/placeholder.jpg" }: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
