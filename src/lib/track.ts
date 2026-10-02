/**
 * One place to send a GA4 event (2026-10-02). Safe during pre-rendering and when
 * the tag has not loaded. Counts only: never pass a name, email or free text.
 *
 * Events added for The Field Manual, read daily into the warehouse
 * (fact_site_event, by page):
 *   calculator_used     a reader moved the bottleneck calculator (once per page view)
 *   calculator_result   the full calculator showed a result
 *   door_click          a chapter or essay "door" button was clicked
 *   newsletter_signup   the email sign-up on /writing or an essay succeeded
 *   starter_kit_signup  the Starter Kit form on /os was accepted
 *   starter_kit_download the confirmed Starter Kit download started
 */
export function track(name: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined' || typeof (window as any).gtag !== 'function') return;
  try {
    (window as any).gtag('event', name, { page_path: window.location.pathname, ...params });
  } catch {
    /* never let measurement break the page */
  }
}
