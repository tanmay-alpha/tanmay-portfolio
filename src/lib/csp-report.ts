const URL_LIKE_FIELDS: Record<string, true> = {
  "blocked-uri": true,
  "document-uri": true,
  "original-policy": true,
  "source-file": true,
  blockedURL: true,
  documentURL: true,
  originalPolicy: true,
  referrer: true,
  sourceFile: true,
  url: true,
};

function sanitizeReport(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeReport);
  if (!value || typeof value !== "object") return value;

  const sanitized: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string" && URL_LIKE_FIELDS[key]) {
      try {
        const url = new URL(raw);
        sanitized[key] = `${url.origin}${url.pathname}`;
      } catch {
        sanitized[key] = raw;
      }
    } else {
      sanitized[key] = sanitizeReport(raw);
    }
  }
  return sanitized;
}

/**
 * Produce a bounded, log-safe CSP report summary.
 *
 * CSP reports can contain full page URLs, blocked URLs, and source-file URLs.
 * Those URLs may include search params with tokens or email addresses, so logs
 * keep only origin + path. Plain text bodies are deliberately not echoed.
 */
export function summarizeCspReport(report: unknown): string {
  if (typeof report === "string") {
    return `[non-json report: ${new TextEncoder().encode(report).byteLength} bytes]`;
  }
  return JSON.stringify(sanitizeReport(report)).slice(0, 2000);
}
