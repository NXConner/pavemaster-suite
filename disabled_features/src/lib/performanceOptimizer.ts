import { performanceMonitor } from './performance';

export class PerformanceOptimizer {
  private imageObserver: IntersectionObserver | null = null;
  private prefetchCache = new Set<string>();

  constructor() {
    this.initializeLazyLoading();
    this.initializeResourcePrefetching();
    this.optimizeScrollPerformance();
  }

  private initializeLazyLoading(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              this.imageObserver?.unobserve(img);
              
              performanceMonitor.recordMetric('image-lazy-loaded', performance.now(), 'ms');
            }
          }
        });
      },
      { rootMargin: '50px 0px', threshold: 0.01 }
    );
  }

  private initializeResourcePrefetching(): void {
    if (typeof window === 'undefined') return;

    const prefetchOnHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !this.prefetchCache.has(link.href)) {
        this.prefetchResource(link.href);
        this.prefetchCache.add(link.href);
      }
    };

    document.addEventListener('mouseover', prefetchOnHover, { passive: true });
  }

  private prefetchResource(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);

    performanceMonitor.recordMetric('resource-prefetched', performance.now(), 'ms');
  }

  private optimizeScrollPerformance(): void {
    if (typeof window === 'undefined') return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          performanceMonitor.recordMetric('scroll-optimized', performance.now(), 'ms');
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  destroy(): void {
    this.imageObserver?.disconnect();
    this.prefetchCache.clear();
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
