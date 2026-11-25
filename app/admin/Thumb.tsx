"use client";

import { useState } from "react";

/**
 * Plain <img>, not next/image: a photo saved a minute ago exists on GitHub but not on the live site
 * until the redeploy finishes, so show a placeholder instead of a broken image.
 */
export default function Thumb({ src, className = "" }: { src?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-navy/10 text-center text-[10px] leading-tight text-muted ${className}`}>
        {src ? "Deploying…" : "No photo"}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
