/** @type {import('postcss-load-config').Config} */

// const config = {
//   plugins: [
//     "postcss-flexbugs-fixes",
//     [
//       "postcss-preset-env",
//       {
//         autoprefixer: {
//           flexbox: "no-2009",
//         },
//         stage: 3,
//         features: {
//           "custom-properties": false,
//         },
//       },
//     ],
//   ],
// };
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
