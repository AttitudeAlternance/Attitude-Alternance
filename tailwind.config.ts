import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1D29",
        paper: "#F7F7F4",
        primary: {
          DEFAULT: "#2B3A67",
          50: "#EEF1F8",
          100: "#DCE2F0",
          200: "#B3BEDD",
          400: "#4E5D93",
          500: "#2B3A67",
          600: "#232F54",
          700: "#1B2441",
        },
        accent: {
          DEFAULT: "#FF7A47",
          50: "#FFF1EA",
          100: "#FFE0D1",
          400: "#FF965F",
          500: "#FF7A47",
          600: "#E4602F",
        },
        success: {
          DEFAULT: "#2F9E60",
          50: "#EAF7EF",
          500: "#2F9E60",
        },
        warn: {
          DEFAULT: "#D99B2B",
          50: "#FBF3E4",
          500: "#D99B2B",
        },
        danger: {
          DEFAULT: "#D64545",
          50: "#FBEAEA",
          500: "#D64545",
        },
        muted: "#6B7280",
        line: "#E6E4DE",
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,29,41,0.04), 0 8px 24px -8px rgba(26,29,41,0.08)",
        pop: "0 12px 32px -8px rgba(43,58,103,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
