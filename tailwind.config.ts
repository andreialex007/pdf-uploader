import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/client/index.html", "./src/**/*.{js,ts,jsx,tsx,mdx,html}"],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#E5EBFF",
          100: "#AFBDFE",
          700: "#0038FF",
        },
        gray: {
          50: "#E9EEF3",
        },
        yellow: {
          50: "#FEFBEB",
        },
        brown: {
          900: "#BB5E14",
        },
        red: {
          500: "#EF4243",
        },
      },
    },
  },
  plugins: [],
}
export default config
