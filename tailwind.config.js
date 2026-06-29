const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: c("--background"),
        foreground: c("--foreground"),
        card: { DEFAULT: c("--card"), muted: c("--card-muted") },
        primary: { DEFAULT: c("--primary"), foreground: c("--primary-foreground") },
        secondary: { DEFAULT: c("--secondary"), foreground: c("--secondary-foreground") },
        muted: { DEFAULT: c("--muted"), foreground: c("--muted-foreground") },
        accent: c("--accent"),
        destructive: c("--destructive"),
        border: c("--border"),
        input: c("--input"),
        ring: c("--ring"),
        signal: {
          go: c("--signal-go"),
          warn: c("--signal-warn"),
          stop: c("--signal-stop"),
          info: c("--signal-info"),
        },
        sidebar: {
          DEFAULT: c("--sidebar"),
          foreground: c("--sidebar-foreground"),
          muted: c("--sidebar-muted"),
          primary: c("--sidebar-primary"),
          accent: c("--sidebar-accent"),
          border: c("--sidebar-border"),
        },
      },
      fontFamily: {
        sans: ["Atkinson_400Regular"],
        "sans-bold": ["Atkinson_700Bold"],
        display: ["BigShoulders_700Bold"],
        "display-medium": ["BigShoulders_500Medium"],
        "display-black": ["BigShoulders_900Black"],
        mono: ["JetBrains_400Regular"],
        "mono-medium": ["JetBrains_500Medium"],
        "mono-semibold": ["JetBrains_600SemiBold"],
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
