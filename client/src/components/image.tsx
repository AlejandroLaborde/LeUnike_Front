
import { useState } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function Image({ src, alt, fallbackSrc = "/images/fallback.jpg", className, ...props }: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  
  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
