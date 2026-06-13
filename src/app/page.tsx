import { Navigation } from "@/components/ui/navigation";
import { Hero } from "@/components/ui/hero";
import { AboutSection } from "@/components/ui/about-section";
import { WorkSection } from "@/components/ui/work-section";
import { ExperienceSection } from "@/components/ui/experience-section";
import { StackSection } from "@/components/ui/stack-section";
import { ContactSection } from "@/components/ui/contact-section";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <AboutSection />
      <WorkSection />
      <ExperienceSection />
      <StackSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
