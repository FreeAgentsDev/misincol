import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      colors: {
        brand: {
          50: "#fef8f3",
          100: "#fbeede",
          200: "#f6d8bb",
          300: "#edb58c",
          400: "#df8c5b",
          500: "#c26b3a",
          600: "#a5532d",
          700: "#864024",
          800: "#66331f",
          900: "#4c2719"
        },
        sand: {
          50: "#f9f5ef",
          100: "#f0e6d8",
          200: "#e2d1ba",
          300: "#d4bb9b",
          400: "#c4a178",
          500: "#aa8760",
          600: "#8a6b4d",
          700: "#6c523c",
          800: "#4f392a",
          900: "#32231a"
        },
        cocoa: {
          50: "#f7f4f1",
          100: "#e7dfd8",
          200: "#cfc0b1",
          300: "#b09b85",
          400: "#927963",
          500: "#755d4c",
          600: "#5c493c",
          700: "#45362d",
          800: "#2d231d",
          900: "#1a1411"
        }
      },
      boxShadow: {
        card: "0 22px 55px rgba(18, 15, 10, 0.12)",
        soft: "0 12px 30px rgba(117, 93, 76, 0.16)"
      },
      backgroundImage: {
        "grain-overlay":
          "linear-gradient(120deg, rgba(255,255,255,0.65), rgba(249,245,239,0.85)), radial-gradient(circle at 20% 20%, rgba(194,107,58,0.12), transparent 45%), radial-gradient(circle at 80% 0%, rgba(140,102,75,0.18), transparent 42%)"
      },
      borderRadius: {
        "3xl": "1.75rem"
      }
    }
  },
  plugins: []
};

export default config;

