import { ThemeProvider } from "@/lib/ThemeContext";
import NavbarV2 from "@/components/NavbarV2";

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <NavbarV2 />
      {children}
    </ThemeProvider>
  );
}
