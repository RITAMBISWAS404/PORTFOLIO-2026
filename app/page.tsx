import "./home.css";
import Hero from "@/sections/home/Hero";
import FeaturedProject from "@/sections/home/FeaturedProject";
import Projects from "@/sections/home/Projects";
import About from "@/sections/home/About";
import DeviPaksha from "@/sections/home/DeviPaksha";
import Experience from "@/sections/home/Experience";
import Contact from "@/sections/home/Contact";
import Socials from "@/sections/home/Socials";
import Footer from "@/sections/home/Footer";
import LogoMarquee from "@/components/home/LogoMarquee";
import GridLines from "@/components/home/GridLines";
import NavbarNew from "@/components/home/NavbarNew";
import OrangeCursor from "@/components/home/OrangeCursor";
import Courier from "@/components/home/Courier";
import { ThemeProvider } from "@/lib/home/ThemeContext";

// The production landing page. It is an independent copy of the approved /experiment-live implementation (namespace: components/home, sections/home,
// lib/home, data/home-content.ts, app/home.css; CSS classes use the `hm-` prefix), so later experiments on /experiment-live cannot change it.
// Previous production page: sections/v3 + components/{GridLines,NavbarNew} (untouched; restore the old app/page.tsx from git to roll back).

function Divider() {
  return <div className="hm-divider" />;
}

export default function Home() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="hm-scope hm-flat-b">
        <OrangeCursor />
        <NavbarNew homePath="/" />
        <main style={{ position: "relative" }} className="hm-v3-home">
          <GridLines />
          <Courier />
          <Hero />
          <Divider />
          <LogoMarquee />
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
