import { Hero } from "@/components/ui/hero";
import { WorkSection } from "@/components/ui/work-section";
import { MoreWorkSection } from "@/components/ui/more-work-section";
import { ServicesSection } from "@/components/ui/services-section";
import { ExperienceSection } from "@/components/ui/experience-section";
import { MarketsSection } from "@/components/ui/markets-section";
import { AboutSection } from "@/components/ui/about-section";
import { EducationSection } from "@/components/ui/education-section";
import { NowSection } from "@/components/ui/now-section";
import { StackSection } from "@/components/ui/stack-section";
import { ContactSection } from "@/components/ui/contact-section";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <WorkSection />
      <MoreWorkSection />
      <ServicesSection />
      <ExperienceSection />
      <MarketsSection />
      <AboutSection />
      <EducationSection />
      <StackSection />
      <NowSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
