/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#c5465f",
        secondary: "#f4a4aa",
        accent: "#78c2b7",
        blush: "#fff4f4",
        surface: "#fff8f7",
        ink: "#372a33",
        muted: "#8f7c87",
        border: "#f0d9dc",
        success: "#94c973",
        warning: "#f3de72",
        danger: "#f08a9a",
        lavender: "#ddb8d1"
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(197, 70, 95, 0.12)",
        panel: "0 10px 30px rgba(55, 42, 51, 0.08)"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(255,255,255,0.95), rgba(252,230,232,0.8), rgba(245,196,203,0.5))"
      }
    }
  },
  plugins: []
};
