import { useState } from "react";
import { ImageOff } from "lucide-react";

type ProductImageProps = {
  src: string | null;
  alt: string;
  className?: string;
};

export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const showPlaceholder = !src || failedSrc === src;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-secondary/10 ${className}`}
    >
      {showPlaceholder ? (
        <ImageOff className="h-10 w-10 text-secondary/50" aria-hidden="true" />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
