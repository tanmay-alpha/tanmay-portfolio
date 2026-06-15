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
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      // Plausible analytics script (only loaded when env var is set)
      "script-src 'self' 'unsafe-inline'" + (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? " https://plausible.io" : ""),
      // Allow connection to Plausible events endpoint when configured
      "connect-src 'self'" + (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? " https://plausible.io" : ""),
      // WebGL shader compilation in the aurora orb
      "worker-src 'self' blob:",
      // Vercel live regions, OG image generator
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
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
