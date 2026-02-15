/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 50px rgba(15, 23, 42, 0.20)",
      },
    },
  },
  plugins: [],
};
