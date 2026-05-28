import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Poppins", "sans-serif"] },
      colors: {
        bg:      "#0d0d0d",
        card:    "#121212",
        input:   "#111111",
        border:  "#222222",
        accent:  "#34a853",
        red:     "#f43f5e",
        yellow:  "#fbbc05",
        blue:    "#4285f4",
        t1:      "#ffffff",
        t2:      "#888888",
        t3:      "#555555",
      },
      borderRadius: {
        xs: "6px", sm: "8px", md: "12px", lg: "16px",
      },
      fontSize: {
        xs: "10px", sm: "12px", base: "14px", md: "16px",
      },
      maxWidth: { col: "720px" },
      spacing: {
        1: "4px",  2: "8px",  3: "12px", 4: "16px",
        5: "24px", 6: "32px", 7: "48px", 8: "64px",
        9: "96px", section: "64px",
      },
    },
  },
  plugins: [],
};
export default config;
