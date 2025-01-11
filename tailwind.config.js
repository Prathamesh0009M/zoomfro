// tailwind.config.js
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      inter: ['Inter', 'sans-serif'],
      'edu-sa': ['Edu SA Beginner', 'cursive'],
      mono: ['Roboto Mono', 'monospace'],
    },
    colors: {
      ...colors, // This includes all default Tailwind colors
      white: '#fff',
      black: '#000',
      transparent: 'transparent',
      richblack: {
        5: '#F1F2FF',
        25: '#B0DDEA',
        50: '#C5C7D4',
        100: '#AFB9C8',
        200: '#99A3B4',
        300: '#83908F',
        400: '#5B5369',
        500: '#424853',
        600: '#2A343D',
        700: '#161D29',
        800: '#080814',
        900: '#000014',
      },
      // Define any custom colors or override default ones
      richblue: {
        5: '#ECF5FF',
        25: '#C6D6E1',
        50: '#A8D7C3',
        100: '#7A98A6',
        200: '#53798F',
        300: '#2D5A6A',
        400: '#064534',
        500: '#063534',
        600: '#052A30',
        700: '#04233A',
        800: '#021223',
        900: '#001122',
      },
      blue: {
        5: '#EAF5FF',
        25: '#BADAEC',
        50: '#7EC0D9',
        100: '#47A5C5',
        200: '#11A8B2',
        300: '#0F79A9',
        400: '#0C6A87',
        500: '#0A5480',
        600: '#084D75',
        700: '#083284',
        800: '#021228',
        900: '#00181D',
      },
      caribbeangreen: {
        5: '#C1FFFD',
        25: '#83F1DE',
        700:"#00cc99"
      },
    },
    extend: {
      maxWidth: {
        maxContent: '1260px',
        maxContentTab: '650px',
      },
    },
  },
  plugins: [],
};
