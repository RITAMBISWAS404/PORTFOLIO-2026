// Light/dark toggle is implemented but temporarily disabled.
// To re-enable, wrap children in ThemeProvider + NavbarV2:
//
//   import { ThemeProvider } from "@/lib/ThemeContext";
//   import NavbarV2 from "@/components/NavbarV2";
//   return (
//     <ThemeProvider>
//       <NavbarV2 />
//       {children}
//     </ThemeProvider>
//   );
//
// All implementation lives in:
//   lib/ThemeContext.tsx       — theme context + localStorage persistence
//   components/NavbarV2.tsx   — navbar with Sun/Moon toggle
//   lib/tokensV2.ts            — CSS-variable-based token object
//   app/globals.css            — [data-theme="light"] overrides

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
