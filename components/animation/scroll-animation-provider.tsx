"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/language-provider";
import { ensureScrollUnlocked, SCROLL_EFFECTS_REFRESH_EVENT } from "@/lib/scroll-effects";

export function ScrollAnimationProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let fallback = 0;
    let refreshFrame = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let showAllTimer: ReturnType<typeof setTimeout> | null = null;

    const revealVisibleElements = (elements: HTMLElement[]) => {
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          element.classList.add("is-revealed");
        }
      }
    };

    document.documentElement.classList.add("scroll-reveal-ready");

    const observe = () => {
      ensureScrollUnlocked();

      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-reveal]")
      );

      if (!elements.length) {
        observer?.disconnect();
        observer = null;
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        observer?.disconnect();
        observer = null;
        for (const element of elements) {
          element.classList.add("is-revealed");
        }
        return;
      }

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
            }
          }
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      for (const element of elements) {
        observer.observe(element);
      }

      cancelAnimationFrame(fallback);
      fallback = requestAnimationFrame(() => revealVisibleElements(elements));

      if (showAllTimer) clearTimeout(showAllTimer);
      showAllTimer = setTimeout(() => {
        for (const element of elements) {
          element.classList.add("is-revealed");
        }
      }, 1400);
    };

    const scheduleObserve = () => {
      cancelAnimationFrame(refreshFrame);
      if (refreshTimer) clearTimeout(refreshTimer);

      refreshFrame = requestAnimationFrame(() => {
        observe();
        refreshTimer = setTimeout(observe, 0);
      });
    };

    scheduleObserve();

    const mutationObserver = new MutationObserver(() => {
      scheduleObserve();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener(SCROLL_EFFECTS_REFRESH_EVENT, scheduleObserve);

    return () => {
      cancelAnimationFrame(fallback);
      cancelAnimationFrame(refreshFrame);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (showAllTimer) clearTimeout(showAllTimer);
      window.removeEventListener(SCROLL_EFFECTS_REFRESH_EVENT, scheduleObserve);
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, [language, pathname]);

  return <>{children}</>;
}
