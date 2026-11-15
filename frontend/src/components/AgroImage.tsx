import React, { useState } from "react";
import { getSvgCropFallback, AgroImageMeta } from "../utils/agroImages";

interface AgroImageProps {
  src?: string;
  alt?: string;
  crop?: AgroImageMeta;
  lang?: "en" | "bn" | string;
  fallbackSrc?: string;
  fallbackTitle?: string;
  fallbackColor?: string;
  className?: string;
  containerClassName?: string;
  aspect?: "square" | "video" | "wide" | string;
  aspectRatio?: string;
  loading?: "lazy" | "eager";
  badge?: string;
  badgeColor?: string;
  overlayGradient?: boolean;
}

export const AgroImage: React.FC<AgroImageProps> = ({
  src,
  alt,
  crop,
  lang = "en",
  fallbackSrc,
  fallbackTitle,
  fallbackColor,
  className = "w-full h-full object-cover",
  containerClassName = "relative overflow-hidden rounded-2xl bg-slate-100",
  aspect,
  aspectRatio,
  loading = "lazy",
  badge,
  badgeColor = "bg-slate-900/80 text-white border-white/20",
  overlayGradient = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Auto-resolve crop metadata if provided
  const resolvedSrc = src || (crop ? crop.url : "");
  const resolvedAlt =
    alt || (crop ? (lang === "bn" ? crop.altBn : crop.altEn) : "Agro Image");
  const resolvedColor =
    fallbackColor || (crop ? crop.accentColor : "#15803d");
  const resolvedFallbackTitle =
    fallbackTitle || resolvedAlt;

  // Aspect ratio helper
  let ratioClass = aspectRatio || "aspect-[16/10]";
  if (aspect === "square") ratioClass = "aspect-square";
  else if (aspect === "video") ratioClass = "aspect-video";
  else if (aspect === "wide") ratioClass = "aspect-[16/9]";

  const fallback =
    fallbackSrc ||
    getSvgCropFallback(resolvedFallbackTitle, resolvedColor);

  return (
    <div className={`${containerClassName} ${ratioClass} relative group`}>
      {/* Background Skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}

      {/* Main Image */}
      <img
        src={hasError ? fallback : resolvedSrc}
        alt={resolvedAlt}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} transition-all duration-500 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } group-hover:scale-105`}
      />

      {/* Optional Subtle Dark Gradient Overlay for Contrast */}
      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Optional Badge */}
      {badge && (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-xs ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
