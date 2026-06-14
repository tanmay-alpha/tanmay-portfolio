"use client";

import { useEffect, useRef, useState } from "react";
import { Github, Linkedin, Mail, Code2, Copy } from "lucide-react";
import { motion } from "framer-motion";

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
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCopyToast = () => {
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 1500);
  };

  // Clean up the timer on unmount.
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website: honeypot }),
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

      // 503 = env vars not set — fall back to mailto.
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
      id="contact"
      className="relative w-full border-t border-zinc-800 py-24 md:py-32"
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              Contact
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 font-serif italic text-display-lg font-light text-paper"
            >
              Say hi<span className="text-accent">.</span>
            </motion.h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-300 md:text-lg">
              Reach me at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-paper underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:decoration-accent"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              — or use the form below. I reply within 24 hours.
            </p>
            <a
              href={buildLinkedInHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block font-mono text-xs text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
            >
              Or message on LinkedIn →
            </a>
          </div>

          {/* Form */}
          <div className="col-span-12 md:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Honeypot — hidden from humans, visible to dumb bots. */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -9999,
                  top: "auto",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                <label htmlFor="website-hp">Website</label>
                <input
                  id="website-hp"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
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

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-md border border-accent bg-transparent px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-accent transition-colors duration-200 hover:bg-accent hover:text-bg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending..." : status === "sent" ? "Sent." : "Send"}
                </button>
                {status === "error" && (
                  <a
                    href={buildMailto(name, email, message)}
                    className="font-mono text-xs text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
                  >
                    {errorMsg || "Couldn't send. Email me instead."}
                  </a>
                )}
              </div>
              <p className="font-sans text-xs text-zinc-500">
                I get an email at mangaltanmay7@gmail.com when you send. I usually reply within 24 hours.
              </p>
            </form>
          </div>
        </div>

        {/* Profile links */}
        <div className="mt-20 grid-12">
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
  const baseClass =
    "mt-1 w-full rounded-md border border-zinc-800 bg-surface px-3 py-2.5 font-sans text-base text-zinc-100 placeholder:text-zinc-600 transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
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
          className={baseClass}
        />
      ) : (
        <input
          id={htmlFor}
          name={htmlFor}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={baseClass}
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

function buildLinkedInHref(): string {
  // LinkedIn's prefill compose URL is gated — fall back to profile if it
  // doesn't work for the user, the form is the primary path.
  return "https://www.linkedin.com/in/tanmaymangal";
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
        // Fallback for non-secure contexts / older browsers.
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
      // Clipboard denied. Fail silently — the chip is still visible.
    }
  };

  // Discord chip: the only special-cased one. Renders a button-styled
  // chip with the username + a small copy icon. Other links render
  // the standard icon+label column.
  if (link.copyOnClick) {
    return (
      <li>
        <button
          type="button"
          onClick={handleClick}
          aria-label={`Copy ${link.user} to clipboard`}
          className="group flex flex-col items-center gap-2 text-center"
        >
          <span className="flex h-11 items-center gap-2 rounded-md border border-zinc-800 bg-[#111111] px-3 text-zinc-400 transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
            {copied ? (
              <Code2 className="h-[14px] w-[14px] text-accent" />
            ) : (
              <Icon className="h-[14px] w-[14px]" />
            )}
            <span className="font-mono text-[11px] text-zinc-300 group-hover:text-zinc-100">
              {link.user}
            </span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition-colors duration-200 group-hover:text-zinc-300">
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
        className="group flex flex-col items-center gap-2 text-center"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition-colors duration-200 group-hover:text-zinc-300">
          {link.label}
        </span>
        <span className="font-mono text-[10px] text-zinc-500">
          {link.user}
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
      className={`pointer-events-none fixed bottom-6 right-6 z-50 rounded-md border border-zinc-800 bg-[#111111] px-4 py-2 font-mono text-xs text-zinc-100 transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
