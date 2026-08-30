import type { CSSProperties } from "react";
export default function Image({ fill, priority, unoptimized: _unoptimized, style, ...props }: {
  fill?: boolean; priority?: boolean; unoptimized?: boolean; style?: CSSProperties;
  src: string; alt: string; sizes?: string; className?: string;
}) {
  return <img {...props} loading={priority ? "eager" : "lazy"} decoding="async"
    style={{ ...(fill ? { position: "absolute", inset: 0, height: "100%", width: "100%" } as CSSProperties : {}), ...style }} />;
}
