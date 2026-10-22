import type { ReactNode } from "react";

import { ScrollEngine } from "@/features/scroll/scroll-engine";
import { WorldCanvas } from "@/features/world/world-canvas";
import { WorldFallback } from "@/features/world/world-fallback";

/**
 * Route-group layout for `/` and `/podgotovka`. It mounts the single fixed
 * WebGL world behind the content and the shared scroll engine. Because this
 * layout persists across the two routes, the camera glides between pages
 * instead of remounting.
 */
export default function WorldLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="world-layer" aria-hidden="true">
        <WorldFallback />
        <WorldCanvas />
      </div>
      <div className="world-content relative z-[1]">{children}</div>
      <ScrollEngine />
    </>
  );
}
