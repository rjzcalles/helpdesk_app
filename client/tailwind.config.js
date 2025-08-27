/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'futuristic-background': '#0a192f', // Azul marino muy oscuro
        'futuristic-background-light': '#172a45',
        'futuristic-primary': '#ff4757', // Rojo vibrante
        'futuristic-secondary': '#00f5d4', // Cian/Turquesa brillante
        'futuristic-text-primary': '#e6f1ff', // Texto principal (blanco azulado)
        'futuristic-text-secondary': '#8892b0', // Texto secundario (gris azulado)
        'futuristic-glass': 'rgba(23, 42, 69, 0.6)', // Color para el efecto cristal
        'futuristic-border': 'rgba(0, 245, 212, 0.2)', // Borde de neón sutil
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'glow': 'glow 2s infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00f5d4, 0 0 10px #00f5d4' },
          '100%': { boxShadow: '0 0 20px #00f5d4, 0 0 30px #00f5d4' },
        },
      },
      boxShadow: {
        'neon-cyan': "0 0 5px theme('colors.futuristic-secondary'), 0 0 10px theme('colors.futuristic-secondary')",
        'neon-red': "0 0 5px theme('colors.futuristic-primary'), 0 0 10px theme('colors.futuristic-primary')",
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
