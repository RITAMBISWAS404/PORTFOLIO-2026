"use client";
// Gate for the landing page: gives it its OWN readiness state (a nested AppReadyProvider, so the root layout's timer-based ready never reaches this page) and mounts the asset-readiness loader, which
// reveals the page as soon as the required assets are ready and, whatever they are doing, no later than 5 seconds after the page was requested. app/layout.tsx's LoadingScreen steps aside on "/"
// (see the pathname guard there). Remove this wrapper from app/page.tsx (and the "/" in that guard) to revert to the timer loader.
import { AppReadyProvider } from "@/lib/AppReadyContext";
import ReadinessLoader from "@/components/readiness/ReadinessLoader";
import { HOME_READINESS } from "@/lib/home/readinessConfig";

export default function HomeGate({ children }: { children: React.ReactNode }) {
  return (
    <AppReadyProvider>
      <ReadinessLoader config={HOME_READINESS} />
      {children}
    </AppReadyProvider>
  );
}
