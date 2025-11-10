import { useState, useEffect, useRef, RefObject } from "react";

export interface UseScrollSpyOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  offset?: number;
}

export function useScrollSpy(
  sectionIds: string[],
  options: UseScrollSpyOptions = {}
): string | null {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0.5,
    offset = 0,
  } = options;

  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const adjustedRootMargin = offset ? `-${offset}px 0px 0px 0px` : rootMargin;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          return a.boundingClientRect.top - b.boundingClientRect.top;
        });

      if (visibleSections.length > 0) {
        const topSection = visibleSections[0];
        if (topSection) {
          setActiveId(topSection.target.id);
        }
      }
    };

    observer.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin: adjustedRootMargin,
      threshold,
    });

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && observer.current) {
        observer.current.observe(element);
      }
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [sectionIds, root, rootMargin, threshold, offset]);

  return activeId;
}

export function useElementInView<T extends Element>(
  elementRef: RefObject<T>,
  options: UseScrollSpyOptions = {}
): boolean {
  const { root = null, rootMargin = "0px", threshold = 0 } = options;

  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !elementRef.current) {
      return;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        setIsInView(entry.isIntersecting);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, root, rootMargin, threshold]);

  return isInView;
}

export function useScrollDirection(
  threshold: number = 10
): "up" | "down" | null {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        ticking.current = false;
        return;
      }

      setScrollDirection(scrollY > lastScrollY.current ? "down" : "up");
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrollDirection;
}

export function useScrollPosition(): { x: number; y: number } {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updatePosition = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener("scroll", updatePosition, { passive: true });
    updatePosition();

    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  return scrollPosition;
}
