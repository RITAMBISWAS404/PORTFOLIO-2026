import { ThemeProvider } from "@/lib/ThemeContext";
import NavbarNew from "@/components/NavbarNew";

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <NavbarNew />
      {children}
    </ThemeProvider>
  );
}
