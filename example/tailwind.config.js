/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.tsx"],
  theme: {
    extend: {
      colors: {
        // カスタムカラー（標準にはない色）
        brand: "#ff6600",
        subtle: "#f0e6ff",
      },
    },
  },
};
