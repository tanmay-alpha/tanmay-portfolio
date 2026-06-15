"use client";

import { useEffect, useRef, useState } from "react";
import { Github, Linkedin, Mail, Code2, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { TurnstileWidget } from "./turnstile-widget";

// Cloudflare Turnstile site key. The widget is ONLY rendered when this
// is set — in that case the server-side handler also requires the
// matching TURNSTILE_SECRET and rejects any submit without a valid
// token. When the env var is absent, the form runs without captcha
// (and the honeypot + rate limit + origin check still hold).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Status = "idle" | "sending" | "sent" | "error";

const CONTACT_EMAIL = "mangaltanmay7@gmail.com";
const DISCORD_USER = "trader_tanmay_29382";

// Minimal X (Twitter) glyph — lucide doesn't ship a "Twitter X" yet.
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.658l-5.214-6.817-5.97 6.817H1.677l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.16 17.52h1.833L7.084 4.126H5.117L17.084 19.77Z" />
    </svg>
  );
}

type Link = {
  label: string;
  href?: string;
  user: string;
  icon: React.ComponentType<{ className?: string }>;
  copyOnClick?: string;
};

const PROFILE_LINKS: ReadonlyArray<Link> = [
  { label: "GitHub", href: "https://github.com/tanmay-alpha", user: "@tanmay-alpha", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/tanmaymangal", user: "@tanmaymangal", icon: Linkedin },
  { label: "X", href: "https://x.com/TanmayEquity", user: "@TanmayEquity", icon: XIcon },
  { label: "Discord", user: DISCORD_USER, icon: Copy, copyOnClick: DISCORD_USER },
  { label: "LeetCode", href: "https://leetcode.com/u/tanmay-alpha", user: "@tanmay-alpha", icon: Code2 },
  { label: "Email", href: `mailto:${CONTACT_EMAIL}`, user: CONTACT_EMAIL, icon: Mail },
];

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const showCopyToast = () => {
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 1500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Reveal animation for the section.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    targets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // If Turnstile is configured, block submit until the user has a
    // valid token. The widget calls onToken("") on expiry / error, so
    // the only "valid" state is a non-empty token.
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("error");
      setErrorMsg("Please complete the captcha first.");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          website: honeypot,
          turnstileToken: TURNSTILE_SITE_KEY ? turnstileToken : undefined,
        }),
      });
      const data: { ok: boolean; error?: string; fallbackMailto?: string } = await res.json();

      if (data.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => setStatus("idle"), 3000);
        return;
      }

      if (res.status === 503 && data.fallbackMailto) {
        window.location.href = buildMailto(name, email, message);
        setStatus("error");
        setErrorMsg(
          "Contact form isn't configured yet — opening your email client instead.",
        );
        return;
      }
      setStatus("error");
      setErrorMsg(data.error ?? "Couldn't send. Email me instead.");
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't reach the server. Email me instead.");
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full border-t border-border py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          <div data-reveal className="col-span-12 md:col-span-5">
            <span className="eyebrow">Contact</span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading mt-3"
            >
              Get in touch
            </motion.h2>
            <p className="mt-6 max-w-md text-[15px] leading-[1.75] text-text-2">
              Reach me at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-text-1 underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:decoration-accent"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              — or use the form below. I reply within 24 hours.
            </p>
            <a
              href="https://www.linkedin.com/in/tanmaymangal"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block font-mono text-xs text-text-2 underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:text-text-1 hover:decoration-accent"
            >
              Or message on LinkedIn →
            </a>
          </div>

          {/* Form */}
          <div data-reveal className="col-span-12 md:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/*
                Honeypot — hidden from humans, visible to dumb bots.
                Belt and suspenders: positioned off-screen, removed from
                the tab order, hidden from assistive tech, and visually
                inert. If a bot fills it, the server treats the submit
                as spam and silently rejects.
              */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  pointerEvents: "none",
                  opacity: 0,
                }}
              >
                <label htmlFor="website-hp">Website (leave blank)</label>
                <input
                  id="website-hp"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <Field
                label="Name"
                htmlFor="name"
                value={name}
                onChange={setName}
                required
              />
              <Field
                label="Email"
                htmlFor="email"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label="Message"
                htmlFor="message"
                value={message}
                onChange={setMessage}
                textarea
                required
              />

              {TURNSTILE_SITE_KEY && (
                <div data-reveal>
                  <TurnstileWidget
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={setTurnstileToken}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={
                    status === "sending" ||
                    (!!TURNSTILE_SITE_KEY && !turnstileToken)
                  }
                  className="btn-submit"
                >
                  {status === "sending"
                    ? "Sending…"
                    : status === "sent"
                      ? "Sent ✓"
                      : "Send"}
                </button>
                {status === "error" && (
                  <a
                    href={buildMailto(name, email, message)}
                    className="font-mono text-xs text-text-2 underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:text-text-1 hover:decoration-accent"
                  >
                    {errorMsg || "Couldn't send. Email me instead."}
                  </a>
                )}
              </div>
              <p className="text-[12px] text-text-3">
                I get an email at mangaltanmay7@gmail.com when you send. I
                usually reply within 24 hours.
              </p>
            </form>
          </div>
        </div>

        {/* Profile links */}
        <div data-reveal className="mt-20 grid-12">
          <div className="col-span-12 md:col-span-10 md:col-start-3">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-6">
              {PROFILE_LINKS.map((link) => (
                <ProfileLink key={link.label} link={link} onCopy={showCopyToast} />
              ))}
            </ul>
            <CopyToast visible={toastVisible} message="Copied ✓" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  type = "text",
  value,
  onChange,
  textarea = false,
  required = false,
}: {
  label: string;
  htmlFor: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="eyebrow block">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      {textarea ? (
        <textarea
          id={htmlFor}
          name={htmlFor}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={5}
          className="form-textarea mt-2"
        />
      ) : (
        <input
          id={htmlFor}
          name={htmlFor}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="form-input mt-2"
        />
      )}
    </label>
  );
}

function buildMailto(name: string, email: string, message: string): string {
  const subject = encodeURIComponent(
    name ? `[portfolio] ${name}` : "[portfolio] hello",
  );
  const body = encodeURIComponent(
    message
      ? `${message}\n\n— ${name}${email ? ` <${email}>` : ""}`
      : `Hi Tanmay,\n\n— ${name}${email ? ` <${email}>` : ""}`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function ProfileLink({
  link,
  onCopy,
}: {
  link: Link;
  onCopy: () => void;
}) {
  const Icon = link.icon;
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
    if (!link.copyOnClick) return;
    e.preventDefault();
    const text = link.copyOnClick;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied.
    }
  };

  if (link.copyOnClick) {
    return (
      <li>
        <button
          type="button"
          onClick={handleClick}
          title={link.user}
          aria-label={`Copy ${link.user} to clipboard`}
          className="group flex flex-col items-center gap-2 text-center"
        >
          <span className="flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-text-2 transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
            {copied ? (
              <Code2 className="h-[14px] w-[14px] text-accent" />
            ) : (
              <Icon className="h-[14px] w-[14px]" />
            )}
            <span className="font-mono text-[11px] text-text-2 group-hover:text-text-1">
              {link.user}
            </span>
          </span>
          <span className="eyebrow transition-colors duration-200 group-hover:text-text-2">
            {link.label}
          </span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        title={link.user}
        aria-label={link.label}
        className="group flex flex-col items-center gap-2 text-center"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-2 transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="eyebrow transition-colors duration-200 group-hover:text-text-2">
          {link.label}
        </span>
      </a>
    </li>
  );
}

function CopyToast({ visible, message }: { visible: boolean; message: string }) {
  return (
    <div
      aria-live="polite"
      aria-atomic
      className={`pointer-events-none fixed bottom-6 right-6 z-50 rounded-md border border-border bg-surface px-4 py-2 font-mono text-xs text-text-1 transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
