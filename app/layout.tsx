import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { AppReadyProvider } from "@/lib/AppReadyContext";

export const metadata: Metadata = {
  title: "Ritam Biswas | Product & UX/UI Designer",
  description: "Product & UX/UI Designer with 2+ years building mobile-first experiences for data-heavy digital products.",
  openGraph: {
    title: "Ritam Biswas | Product & UX/UI Designer",
    description: "Product & UX/UI Designer with 2+ years building mobile-first experiences for data-heavy digital products.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppReadyProvider>
          <LoadingScreen />
          <Navbar />
          {children}
        </AppReadyProvider>
      </body>
    </html>
  );
}
