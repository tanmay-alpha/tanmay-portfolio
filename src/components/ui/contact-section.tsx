"use client";

import { useState } from "react";
import { Github, Linkedin, Mail, Code2 } from "lucide-react";
import { motion } from "framer-motion";

type Status = "idle" | "sending" | "sent" | "error";

const CONTACT_EMAIL = "mangaltanmay7@gmail.com";

const PROFILE_LINKS = [
  { label: "GitHub", href: "https://github.com/tanmay-alpha", user: "@tanmay-alpha", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/tanmaymangal", user: "@tanmaymangal", icon: Linkedin },
  { label: "LeetCode", href: "https://leetcode.com/u/tanmay-alpha", user: "@tanmay-alpha", icon: Code2 },
  { label: "Email", href: `mailto:${CONTACT_EMAIL}`, user: CONTACT_EMAIL, icon: Mail },
] as const;

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
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
            </form>
          </div>
        </div>

        {/* Profile links */}
        <div className="mt-20 grid-12">
          <div className="col-span-12 md:col-span-10 md:col-start-3">
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {PROFILE_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-2 text-center"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 transition-all duration-200 group-hover:border-accent group-hover:text-accent">
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
              })}
            </ul>
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
