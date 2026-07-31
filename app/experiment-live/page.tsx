import "./experiment.css";
import Hero from "@/sections/experiment/Hero";
import FeaturedProject from "@/sections/experiment/FeaturedProject";
import Projects from "@/sections/experiment/Projects";
import About from "@/sections/experiment/About";
import Process from "@/sections/experiment/Process";
import Experience from "@/sections/experiment/Experience";
import Contact from "@/sections/experiment/Contact";
import Socials from "@/sections/experiment/Socials";
import Footer from "@/sections/experiment/Footer";
import GridLines from "@/components/experiment/GridLines";
import NavbarNew from "@/components/experiment/NavbarNew";

function Divider() {
  return (
    <div style={{
      width: "100%",
      height: 1,
      background: "var(--color-border)",
    }} />
  );
}

export default function ExperimentLivePage() {
  return (
    <div className="exp-scope">
      <NavbarNew homePath="/experiment-live" />
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
    </div>
  );
}
