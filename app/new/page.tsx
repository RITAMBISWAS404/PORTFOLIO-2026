import Hero from "@/sections/v3/Hero";
import FeaturedProject from "@/sections/v3/FeaturedProject";
import Projects from "@/sections/v3/Projects";
import About from "@/sections/v3/About";
import Process from "@/sections/v3/Process";
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
      background: "#222222",
    }} />
  );
}

export default function NewHome() {
  return (
    <main style={{ position: "relative" }}>
      <GridLines />
      <Hero />
      <Divider />
      <FeaturedProject />
      <Divider />
      <Projects />
      <Divider />
      <About />
      <Divider />
      <Process />
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
