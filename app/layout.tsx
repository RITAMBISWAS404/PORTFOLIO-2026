import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { AppReadyProvider } from "@/lib/AppReadyContext";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata: Metadata = {
  title: "Ritam Biswas — Product & UX/UI Designer",
  description: "Product & UX/UI Designer with 2+ years building mobile-first experiences for data-heavy digital products.",
  openGraph: {
    title: "Ritam Biswas — Product & UX/UI Designer",
    description: "Product & UX/UI Designer with 2+ years building mobile-first experiences.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('portfolio-theme');document.documentElement.setAttribute('data-theme',t||'dark');})();` }} />
      </head>
      <body>
        <ThemeProvider>
          <AppReadyProvider>
            <LoadingScreen />
            <Navbar />
            {children}
          </AppReadyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
