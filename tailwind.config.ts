import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { border: "#e7e7e5", ink: "#171716", muted: "#70706b", canvas: "#f7f7f5", brand: { DEFAULT: "#5b5bd6", dark: "#4848bd", soft: "#eeeeff" } },
    boxShadow: { soft: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.04)" },
    borderRadius: { xl: "0.75rem", "2xl": "1rem" }
  } }, plugins: []
} satisfies Config;
