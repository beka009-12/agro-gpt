"use client";

import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;

    let frameId = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateViewport = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const height = viewport?.height ?? window.innerHeight;
        const offsetTop = viewport?.offsetTop ?? 0;

        /*
         * Safari во время анимации клавиатуры иногда отдаёт
         * временную неправильную высоту — например 80–150px.
         */
        if (height < 250) return;

        document.documentElement.style.setProperty(
          "--app-height",
          `${Math.round(height)}px`,
        );

        document.documentElement.style.setProperty(
          "--app-offset-top",
          `${Math.round(offsetTop)}px`,
        );
      });
    };

    const updateAfterKeyboardAnimation = () => {
      updateViewport();

      clearTimeout(timeoutId);

      timeoutId = setTimeout(updateViewport, 100);
      setTimeout(updateViewport, 300);
      setTimeout(updateViewport, 500);
    };

    updateViewport();

    viewport?.addEventListener("resize", updateAfterKeyboardAnimation);
    viewport?.addEventListener("scroll", updateViewport);

    window.addEventListener("resize", updateAfterKeyboardAnimation);
    window.addEventListener("orientationchange", updateAfterKeyboardAnimation);

    document.addEventListener("focusin", updateAfterKeyboardAnimation);
    document.addEventListener("focusout", updateAfterKeyboardAnimation);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);

      viewport?.removeEventListener("resize", updateAfterKeyboardAnimation);
      viewport?.removeEventListener("scroll", updateViewport);

      window.removeEventListener("resize", updateAfterKeyboardAnimation);
      window.removeEventListener(
        "orientationchange",
        updateAfterKeyboardAnimation,
      );

      document.removeEventListener("focusin", updateAfterKeyboardAnimation);
      document.removeEventListener("focusout", updateAfterKeyboardAnimation);
    };
  }, []);
}
