/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // colors: {
    //   // Primary
    //   primary: {
    //     50: "#f4f9ff",
    //     100: "#e9f3ff",
    //     200: "#c8e1ff",
    //     300: "#a6ceff",
    //     400: "#63aaff",
    //     500: "#2086ff",
    //     600: "#1d78e6",
    //     700: "#144f99",
    //     800: "#0f3b73",
    //     900: "#0a2850",
    //   },

    //   // Secondary
    //   secondary: {
    //     50: "#f8f8f8",
    //     100: "#f1f1f1",
    //     200: "#dcdcdc",
    //     300: "#c7c7c7",
    //     400: "#9e9e9e",
    //     500: "#757575",
    //     600: "#6a6a6a",
    //     700: "#474747",
    //     800: "#353535",
    //     900: "#232323",
    //   },

    //   // Tertiary
    //   tertiary: {
    //     50: "#f5f8f8",
    //     100: "#ebeeee",
    //     200: "#ccd1d1",
    //     300: "#adb6b6",
    //     400: "#708080",
    //     500: "#335a5a",
    //     600: "#2f5151",
    //     700: "#203535",
    //     800: "#182727",
    //     900: "#101a1a",
    //   },

    //   // Neutral
    //   neutral: {
    //     50: "#f9f9f9",
    //     100: "#f3f3f3",
    //     200: "#e0e0e0",
    //     300: "#cdcdcd",
    //     400: "#a6a6a6",
    //     500: "#808080",
    //     600: "#737373",
    //     700: "#4d4d4d",
    //     800: "#3b3b3b",
    //     900: "#292929",
    //   },
    // },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
