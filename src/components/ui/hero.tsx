"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, FileText } from "lucide-react";

const fadeInUpVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Hero() {
  const iconLinks = [
    {
      label: "GitHub",
      href: "https://github.com/tanmay-alpha",
      icon: Github,
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/tanmaymangal",
      icon: Linkedin,
    },
    {
      label: "Email",
      href: "mailto:mangaltanmay7@gmail.com",
      icon: Mail,
    },
    {
      label: "Resume",
      href: "/resume.pdf",
      icon: FileText,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center pt-12 md:pt-0">
      {/* Left: text content */}
      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="order-2 md:order-1"
      >
        <motion.h1
          variants={fadeInUpVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-[1.05] text-text-primary text-balance"
        >
          Tanmay Mangal
        </motion.h1>

        <motion.p
          variants={fadeInUpVariants}
          className="mt-6 font-mono text-xs md:text-sm uppercase tracking-wider text-text-secondary"
        >
          AI/ML Engineer · Full-Stack · Quant-adjacent
        </motion.p>

        <div className="mt-10 space-y-1 text-xl md:text-2xl lg:text-3xl font-normal text-text-primary text-pretty">
          <motion.p variants={fadeInUpVariants}>Build to understand.</motion.p>
          <motion.p variants={fadeInUpVariants}>Trade to learn.</motion.p>
          <motion.p variants={fadeInUpVariants}>Ship to compound.</motion.p>
        </div>

        {/* Icon buttons */}
        <motion.div
          variants={fadeInUpVariants}
          className="mt-12 flex flex-wrap gap-3"
        >
          {iconLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={link.label}
                className="flex items-center justify-center w-11 h-11 rounded-lg border border-border bg-white/[0.03] hover:bg-white/[0.06] hover:border-accent/40 transition-all duration-theme group"
              >
                <Icon className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors duration-theme" />
              </a>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Right: headshot placeholder */}
      <motion.div
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.2 }}
        className="order-1 md:order-2 flex justify-center md:justify-end"
      >
        <div
          className="relative w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full border border-border bg-surface flex items-center justify-center overflow-hidden"
          aria-label="Headshot placeholder"
        >
          <span className="font-mono text-3xl md:text-4xl lg:text-5xl text-text-secondary select-none">
            TM
          </span>
        </div>
      </motion.div>
    </div>
  );
}
