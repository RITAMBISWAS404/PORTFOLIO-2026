import Hero from "@/sections/v3/Hero";
import FeaturedProject from "@/sections/v3/FeaturedProject";
import Projects from "@/sections/v3/Projects";
import About from "@/sections/v3/About";
import Experience from "@/sections/v3/Experience";
import Contact from "@/sections/v3/Contact";
import Socials from "@/sections/v3/Socials";
import Footer from "@/sections/v3/Footer";
import GridLines from "@/components/GridLines";
import NavbarNew from "@/components/NavbarNew";
import { ThemeProvider } from "@/lib/ThemeContext";

function Divider() {
  return (
    <div style={{
      width: "100%",
      height: 1,
      background: "var(--color-border)",
    }} />
  );
}

export default function Home() {
  return (
    <ThemeProvider defaultTheme="light">
      <NavbarNew homePath="/" />
      <main style={{ position: "relative" }} className="v3-home">
        <GridLines />
        <Hero />
        <Divider />
        <FeaturedProject />
        <Divider />
        <Projects />
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
    </ThemeProvider>
  );
}
