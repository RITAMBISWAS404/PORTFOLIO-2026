import Hero from "@/sections/Hero";
import FeaturedProject from "@/sections/FeaturedProject";
import Projects from "@/sections/Projects";
import Process from "@/sections/Process";
import Experience from "@/sections/Experience";
import Stack from "@/sections/Stack";
import Contact from "@/sections/Contact";
import Socials from "@/sections/Socials";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProject />
      <Projects />
      <Process />
      <Experience />
      <Stack />
      <Contact />
      <Socials />
      <Footer />
    </main>
  );
}
