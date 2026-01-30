"use client";

import { useEffect, useState } from "react";

const OVERLAY =
  "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))";
const INTERVAL_MS = 5000;
const FADE_DURATION_MS = 1200;

export default function HeroBackgroundCarousel({
  images,
}: {
  images: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {images.map((url, index) => (
        <div
          key={url + index}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity ease-in-out"
          style={{
            backgroundImage: `${OVERLAY}, url("${url}")`,
            opacity: index === activeIndex ? 1 : 0,
            transitionDuration: `${FADE_DURATION_MS}ms`,
          }}
          aria-hidden={index !== activeIndex}
        />
      ))}
    </div>
  );
}
