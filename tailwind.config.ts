import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0f",
        panel: "#15151c",
        line: "#2a2a35",
        bone: "#f2efe8",
        muted: "#a9a6b3",
        siren: "#ff3b4f",
        alarm: "#ffd23f",
        acid: "#3ddc84",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
