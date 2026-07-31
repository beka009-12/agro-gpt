"use client";

import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    let frameId: number;

    const updateHeight = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const height =
          window.visualViewport?.height ??
          document.documentElement.clientHeight ??
          window.innerHeight;

        document.documentElement.style.setProperty(
          "--app-height",
          `${Math.round(height)}px`,
        );
      });
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    window.visualViewport?.addEventListener("resize", updateHeight);
    window.visualViewport?.addEventListener("scroll", updateHeight);

    return () => {
      cancelAnimationFrame(frameId);

      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);

      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("scroll", updateHeight);
    };
  }, []);
}
