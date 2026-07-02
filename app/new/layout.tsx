import { ThemeProvider } from "@/lib/ThemeContext";

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}
