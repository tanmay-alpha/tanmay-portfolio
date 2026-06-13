"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Navigation } from "@/components/ui/navigation";
import { AuroraOrb } from "@/components/ui/aurora-orb";
import { Hero } from "@/components/ui/hero";

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

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure the UI doesn't mismatch the server-side theme
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // No render until client-side hydration
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="relative z-10">
        {/* Header with nav */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <Navigation />
        </header>

        {/* Hero section */}
        <section id="top" className="min-h-screen flex items-center justify-center pt-20">
          <div className="relative">
            <AuroraOrb />
            <motion.div
              className="container mx-auto px-4"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeInUpVariants}>
                <Hero />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Empty section placeholders */}
        <section id="projects" className="min-h-[60vh] py-20">
          <div className="h-px" />
        </section>

        <section id="experience" className="min-h-[60vh] py-20">
          <div className="h-px" />
        </section>

        <section id="contact" className="min-h-[60vh] py-20">
          <div className="h-px" />
        </section>
      </div>
    </main>
  );
}
