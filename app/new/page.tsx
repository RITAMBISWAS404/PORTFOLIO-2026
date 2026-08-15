import Hero from "@/sections/v3/Hero";
import FeaturedProject from "@/sections/v3/FeaturedProject";
import Projects from "@/sections/v3/Projects";
import About from "@/sections/v3/About";
import DeviPaksha from "@/sections/v3/DeviPaksha";
import Experience from "@/sections/v3/Experience";
import Contact from "@/sections/v3/Contact";
import Socials from "@/sections/v3/Socials";
import Footer from "@/sections/v3/Footer";
import GridLines from "@/components/GridLines";

function Divider() {
  return (
    <div style={{
      width: "100%",
      height: 1,
      background: "var(--exp-grid-border, var(--color-border))",
    }} />
  );
}

export default function NewHome() {
  return (
    <main style={{ position: "relative", background: "var(--exp-bg)" }} className="new-palette">
      <GridLines />
      <Hero />
      <Divider />
      <FeaturedProject />
      <Divider />
      <Projects />
      <Divider />
      <About />
      <Divider />
      <DeviPaksha />
      <Divider />
      <Experience />
      <Divider />
      <Contact />
      <Divider />
      <Socials />
      <Footer />
    </main>
  );
}
