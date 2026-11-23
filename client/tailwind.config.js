/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper, #FAFAF7)',
        ink: 'var(--ink, #0A0A0A)',
        'ink-2': 'var(--ink-2, #3B3B38)',
        'ink-3': 'var(--ink-3, #5E5E59)',
        rule: 'var(--rule, #0A0A0A)',
        'rule-soft': 'var(--rule-soft, #D6D6D0)',
        tint: 'var(--tint, #EFEFEA)',
        signal: 'var(--signal, #C00018)',
        'signal-ink': 'var(--signal-ink, #FFFFFF)',
        cobalt: 'var(--cobalt, #1F3FD6)',
        amber: 'var(--amber, #FFC400)',
        forest: 'var(--forest, #0B6B3A)'
      },
      borderRadius: {
        none: '0px'
      }
    },
  },
  plugins: [],
}
