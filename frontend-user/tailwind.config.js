/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 禅意主题色系
        zen: {
          // 米白 - 主背景色
          cream: {
            50: '#FEFDFB',
            100: '#FDF9F3',
            200: '#FAF3E7',
            300: '#F5EAD6',
            400: '#EFE0C5',
            500: '#E8D5B3',
            DEFAULT: '#F5EAD6',
          },
          // 浅灰 - 次要背景和边框
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            DEFAULT: '#E0E0E0',
          },
          // 淡蓝 - 强调色和选中状态
          blue: {
            50: '#F0F7FA',
            100: '#E1EFF5',
            200: '#C3DFEB',
            300: '#A5CFE1',
            400: '#87BFD7',
            500: '#69AFCD',
            DEFAULT: '#A5CFE1',
          },
          // 竹青 - 点缀色和成功状态
          bamboo: {
            50: '#F2F7F4',
            100: '#E5EFE9',
            200: '#CBDFD3',
            300: '#B1CFBD',
            400: '#97BFA7',
            500: '#7DAF91',
            600: '#639F7B',
            DEFAULT: '#97BFA7',
          },
        },
      },
      fontFamily: {
        zen: [
          '"Noto Serif SC"',
          '"Source Han Serif CN"',
          'serif',
        ],
        sans: [
          '"Noto Sans SC"',
          '"Source Han Sans CN"',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        'zen': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'zen-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'zen-lg': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'zen': '0.75rem',
      },
      animation: {
        'scroll-unfold': 'scrollUnfold 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out',
      },
      keyframes: {
        scrollUnfold: {
          '0%': { opacity: '0', transform: 'scaleY(0.8)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
