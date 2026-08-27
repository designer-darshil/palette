/**
 * Lightweight, non-blocking telemetry & event tracking for Google Tag Manager / GA4.
 * Fails safely and silently if GTM/GA4 is not configured in the environment.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Initialize Google Tag Manager or GA4 if environment variable is present.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  const gtmId = (import.meta as any).env?.VITE_GTM_ID;
  const gaId = (import.meta as any).env?.VITE_GA_ID;

  // Initialize dataLayer safely
  window.dataLayer = window.dataLayer || [];

  // Google Tag Manager
  if (gtmId && !document.getElementById('gtm-script')) {
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);

    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
  }

  // Google Analytics 4 (Only if GTM is not used to prevent duplicate hits)
  if (!gtmId && gaId && !document.getElementById('ga4-script')) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: false });
  }
}

/**
 * Track a custom user engagement event.
 */
export function trackEvent(name: string, payload: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  const eventData: AnalyticsEvent = {
    event: name,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  if (window.dataLayer) {
    window.dataLayer.push(eventData);
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
  }
}

/**
 * Common high-value engagement tracking shortcuts.
 */
export const Analytics = {
  trackColorCopy: (hex: string, format: string, colorName?: string) => {
    trackEvent('color_copied', { hex, format, color_name: colorName });
  },
  trackPaletteCopy: (paletteTitle: string, hexList: string[]) => {
    trackEvent('palette_copied', { palette_title: paletteTitle, swatch_count: hexList.length });
  },
  trackSpecimenSave: (type: string, id: string, title: string) => {
    trackEvent('specimen_saved', { specimen_type: type, specimen_id: id, specimen_title: title });
  },
  trackContrastCheck: (fg: string, bg: string, ratio: number, rating: string) => {
    trackEvent('contrast_checked', { fg, bg, ratio, rating });
  },
  trackBrandKitExport: (kitName: string, exportFormat: string) => {
    trackEvent('brand_kit_exported', { kit_name: kitName, format: exportFormat });
  },
  trackSearch: (query: string, resultCount: number) => {
    trackEvent('search_performed', { search_query: query, result_count: resultCount });
  },
  trackToolInteraction: (toolName: string, actionName: string) => {
    trackEvent('tool_interaction', { tool_name: toolName, action_name: actionName });
  },
};
