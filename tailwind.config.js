/** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        sm: "1200px",
      },
    },
    extend: {},
    screens: {
      'sm': '640px',
      'xl': '1100px',
    },
  },
  plugins: [],
};
