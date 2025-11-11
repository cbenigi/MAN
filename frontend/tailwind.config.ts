import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bancolombia: {
          yellow: "#FDDA24",
          black: "#000000",
          "gray-dark": "#4A4A4A",
          "gray-light": "#F5F5F5",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
