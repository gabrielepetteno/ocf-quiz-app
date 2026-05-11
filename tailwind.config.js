/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cool fintech surfaces — never pure white
        paper: {
          DEFAULT: "#f7f8fa",
          50: "#fbfcfd",
          100: "#f7f8fa",
          200: "#eef2f7",
          300: "#e2e8f0",
          400: "#cbd5e1",
          500: "#94a3b8",
        },
        // Midnight navy ink scale
        ink: {
          DEFAULT: "#0a1f33",
          50: "#eef2f7",
          100: "#dde4ee",
          200: "#b9c5d6",
          300: "#8a9bb3",
          400: "#5b6b7e",
          500: "#3b4a5f",
          600: "#24344a",
          700: "#152538",
          800: "#0a1f33",
          900: "#04101e",
        },
        // Deep cobalt — fintech primary, not Tailwind-default blue
        accent: {
          50: "#eff4fb",
          100: "#dbe6f5",
          200: "#b6cdea",
          300: "#86a9d8",
          400: "#5180c1",
          500: "#2e5fa8",
          600: "#1e40af",
          700: "#1a368f",
          800: "#172d75",
          900: "#0f1e4f",
        },
        // Legacy alias
        brand: {
          50: "#eff4fb",
          100: "#dbe6f5",
          200: "#b6cdea",
          300: "#86a9d8",
          400: "#5180c1",
          500: "#2e5fa8",
          600: "#1e40af",
          700: "#1a368f",
          800: "#172d75",
          900: "#0f1e4f",
        },
        success: {
          50: "#e6f1ec",
          500: "#0fa56c",
          600: "#0a7b5a",
          700: "#085f47",
        },
        danger: {
          50: "#fae8e6",
          500: "#cf3a31",
          600: "#b3261e",
          700: "#8c1e18",
        },
        warn: {
          50: "#fbf0e0",
          500: "#d97f1f",
          600: "#b86412",
        },
      },
      fontFamily: {
        sans: [
          '"IBM Plex Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          '"IBM Plex Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      letterSpacing: {
        tightest: "-0.035em",
        editorial: "-0.02em",
        eyebrow: "0.14em",
      },
      lineHeight: {
        display: "1.02",
        editorial: "1.1",
      },
      maxWidth: {
        prose: "68ch",
        editorial: "72rem",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "14px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.165, 0.84, 0.44, 1)",
      },
    },
  },
  plugins: [],
};
