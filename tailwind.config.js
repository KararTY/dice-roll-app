const defaultTheme = require('tailwindcss/defaultTheme')

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  plugins: [
  ],
  purge: {
    content: [
     "./src/**/*",
    ],
    enabled: production // disable purge in dev
  },
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sometimes', ...defaultTheme.fontFamily.sans]
      }
    },
  },
  variants: {
    extend: {},
  },
};