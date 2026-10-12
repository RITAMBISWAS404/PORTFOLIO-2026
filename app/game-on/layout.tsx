import type { Metadata } from "next";

// /game-on is a local-only preview: it is not linked from anywhere and is kept out of search indexes until it is approved for the public portfolio.
export const metadata: Metadata = {
  title: "GameON | Ritam Biswas",
  robots: { index: false, follow: false },
};

export default function GameOnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
