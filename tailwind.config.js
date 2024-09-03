/** @type {import('tailwindcss').Config} */

const forms = require('@tailwindcss/forms');
module.exports = {
  content: [
    'src/**/*.tsx'
  ],
  theme: {
    extend: {},
  },
  plugins: [forms({ strategy: 'class' })],
}

