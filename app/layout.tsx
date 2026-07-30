import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import LoadingScreen from "@/components/LoadingScreen";
import { AppReadyProvider } from "@/lib/AppReadyContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ritamhere.me"),
  title: "Ritam Biswas | Product & UX/UI Designer",
  description: "Product & UX/UI Designer with 2+ years building mobile-first experiences for data-heavy digital products.",
  openGraph: {
    title: "Ritam Biswas | Product & UX/UI Designer",
    description: "Product & UX/UI Designer with 2+ years building mobile-first experiences for data-heavy digital products.",
    type: "website",
    url: "https://www.ritamhere.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ritam Biswas | Product & UX/UI Designer",
    description: "Product & UX/UI Designer with 2+ years building mobile-first experiences for data-heavy digital products.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Raw, unprocessed CSS — Tailwind v4's Lightning CSS build step strips
            `corner-shape` since it doesn't yet recognize the property, so this
            bypasses the pipeline entirely. Chromium-only; other browsers ignore
            it and keep the normal circular-arc corner (safe no-op fallback). */}
        <style>{`
          * { corner-shape: squircle; }
          .pill-radius { corner-shape: round; }
        `}</style>
        <AppReadyProvider>
          <LoadingScreen />
          <ConditionalNavbar />
          {children}
        </AppReadyProvider>
        <Analytics />
      </body>
    </html>
  );
}
