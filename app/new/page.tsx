import Hero from "@/sections/v3/Hero";
import FeaturedProject from "@/sections/v3/FeaturedProject";
import Projects from "@/sections/v3/Projects";
import About from "@/sections/v3/About";
import Process from "@/sections/v3/Process";
import Experience from "@/sections/v3/Experience";
import Contact from "@/sections/v3/Contact";
import Socials from "@/sections/v3/Socials";
import Footer from "@/sections/v3/Footer";

export default function NewHome() {
  return (
    <main className="r8">
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
