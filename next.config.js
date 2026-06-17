/** @type {import('next').NextConfig} */

// Allowlist of domains that Next/Image's optimizer may fetch from. Empty
// for now because the only image on the site is /tanmay.jpg (self-hosted).
// Add patterns here if/when external images are introduced — never leave
// it unset, since the default has changed across Next versions and an
// unset value historically allowed arbitrary remote hosts (SSRF surface).
const IMAGE_REMOTE_PATTERNS = [];

// Security headers applied to every response. CSP is strict on scripts
// (self + Plausible if configured) but allows inline styles so Tailwind's
// generated utility classes (and the theme initializer) keep working.
// X-Frame-Options DENY blocks clickjacking. Referrer-Policy keeps our
// outbound referrer headers from leaking full URLs to third parties.
const SECURITY_HEADERS = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: (() => {
      // CSP design — the trade-offs explained:
      //
      // script-src 'unsafe-inline' — REQUIRED for Next.js 15 App Router.
      // Next emits multiple inline <script> tags per page for React
      // Server Components streaming (`self.__next_f.push(...)` chunks
      // and the `self.__next_s.push(...)` theme-initializer wrapper).
      // The chunks are content- and route-specific, so a SHA-256
      // allowlist would need to enumerate every page's payload —
      // impractical. The two real alternatives are (a) nonce every
      // script, which requires patching Next's emit pipeline, or
      // (b) Trusted Types, which requires major app refactor. For a
      // portfolio, the XSS risk is mitigated by the lack of any
      // user-controlled HTML rendering — every string inserted into
      // the DOM is React-escaped. Logged as a follow-up for if/when
      // we add a CMS or user input that lands in the DOM as HTML.
      //
      // style-src 'unsafe-inline' — REQUIRED for Tailwind utility
      // classes that emit dynamic inline `style=` attributes (Framer
      // Motion's transform/translateY props, the data-reveal reveal
      // animations, the aurora orb's WebGL position). Without
      // 'unsafe-inline' here, ~50 console errors fire on every
      // page load and the reveal animations stop working.
      //
      // What we DO lock down:
      //   - no remote script sources by default (Plausible and
      //     Turnstile are opt-in via env var)
      //   - no remote styles, no remote frames
      //   - frame-ancestors 'none' (clickjacking blocked)
      //   - base-uri 'self' (no <base> hijacking)
      //   - form-action 'self' (forms can only POST back to us)
      //   - object-src 'none' (no Flash, no Java applets)
      //   - report-uri sends violations to /api/csp-report

      const plausibleHost = "https://plausible.io";
      const turnstileHost = "https://challenges.cloudflare.com";
      const hasPlausible = !!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
      const hasTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

      const scriptSrc = [
        "'self'",
        "'unsafe-inline'",
        hasPlausible ? plausibleHost : null,
        hasTurnstile ? turnstileHost : null,
      ].filter(Boolean).join(" ");

      const styleSrc = ["'self'", "'unsafe-inline'"].join(" ");

      const connectSrc = [
        "'self'",
        hasPlausible ? plausibleHost : null,
        hasTurnstile ? turnstileHost : null,
      ].filter(Boolean).join(" ");

      const frameSrc = (hasTurnstile ? [turnstileHost] : ["'none'"]).join(" ");

      return [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        `script-src ${scriptSrc}`,
        `style-src ${styleSrc}`,
        `connect-src ${connectSrc}`,
        `frame-src ${frameSrc}`,
        // WebGL shader compilation in the aurora orb
        "worker-src 'self' blob:",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // Send CSP violations to the report endpoint. Browsers will POST
        // application/csp-report when a directive is violated; the route
        // accepts and logs them (no PII echo back to the client).
        "report-uri /api/csp-report",
      ].join("; ");
    })(),
  },
];

const nextConfig = {
  reactStrictMode: true,

  images: {
    // Explicit empty allowlist: the only image on the site is /tanmay.jpg
    // in /public. No remote images → no SSRF surface via /_next/image.
    remotePatterns: IMAGE_REMOTE_PATTERNS,
    // No formats array — let Next pick based on Accept header. Less to
    // mis-configure.
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

module.exports = nextConfig;
