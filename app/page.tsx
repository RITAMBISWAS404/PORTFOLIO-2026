import Hero from "@/sections/v2/Hero";
import FeaturedProject from "@/sections/v2/FeaturedProject";
import Projects from "@/sections/v2/Projects";
import About from "@/sections/v2/About";
import Process from "@/sections/v2/Process";
import Experience from "@/sections/v2/Experience";
import Contact from "@/sections/v2/Contact";
import Socials from "@/sections/v2/Socials";
import Footer from "@/sections/v2/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProject />
      <Projects />
      <About />
      <Process />
      <Experience />
      <Contact />
      <Socials />
      <Footer />
    </main>
  );
}
