import "./experiment.css";
import Hero from "@/sections/experiment/Hero";
import FeaturedProject from "@/sections/experiment/FeaturedProject";
import Projects from "@/sections/experiment/Projects";
import About from "@/sections/experiment/About";
import DeviPaksha from "@/sections/experiment/DeviPaksha";
import Experience from "@/sections/experiment/Experience";
import Contact from "@/sections/experiment/Contact";
import Socials from "@/sections/experiment/Socials";
import Footer from "@/sections/experiment/Footer";
import GridLines from "@/components/experiment/GridLines";
import NavbarNew from "@/components/experiment/NavbarNew";
import { ThemeProvider } from "@/lib/experiment/ThemeContext";

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
    <ThemeProvider defaultTheme="light">
      <div className="exp-scope">
        <NavbarNew homePath="/experiment-live" />
        <main style={{ position: "relative" }} className="exp-v3-home">
          <GridLines />
          <Hero />
          <Divider />
          <FeaturedProject />
          <Divider />
          <Projects />
          <Divider />
          <DeviPaksha />
          <Divider />
          <About />
          <Divider />
          <Experience />
          <Divider />
          <Contact />
          <Divider />
          <Socials />
          <Footer />
        </main>
      </div>
    </ThemeProvider>
  );
}
