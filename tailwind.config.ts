import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        xs: "480px", // Add extra small breakpoint
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // RTL Nederland brand colors
        "rtl-primary": {
          DEFAULT: "hsl(var(--rtl-primary))",
          foreground: "hsl(var(--rtl-primary-foreground))",
        },
        "rtl-secondary": {
          DEFAULT: "hsl(var(--rtl-secondary))",
          foreground: "hsl(var(--rtl-secondary-foreground))",
        },
        "rtl-tertiary": {
          DEFAULT: "hsl(var(--rtl-tertiary))",
          foreground: "hsl(var(--rtl-tertiary-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.foreground"),
            "--tw-prose-headings": theme("colors.foreground"),
            "--tw-prose-lead": theme("colors.muted.foreground"),
            "--tw-prose-links": "hsl(var(--rtl-secondary))",
            "--tw-prose-bold": theme("colors.foreground"),
            "--tw-prose-counters": theme("colors.muted.foreground"),
            "--tw-prose-bullets": theme("colors.muted.foreground"),
            "--tw-prose-hr": theme("colors.border"),
            "--tw-prose-quotes": theme("colors.foreground"),
            "--tw-prose-quote-borders": "hsl(var(--rtl-secondary))",
            "--tw-prose-captions": theme("colors.muted.foreground"),
            "--tw-prose-code": theme("colors.foreground"),
            "--tw-prose-pre-code": theme("colors.foreground"),
            "--tw-prose-pre-bg": theme("colors.muted.DEFAULT"),
            "--tw-prose-th-borders": theme("colors.border"),
            "--tw-prose-td-borders": theme("colors.border"),

            // Base element styles
            color: "var(--tw-prose-body)",
            lineHeight: "1.75",
            maxWidth: "65ch",
            fontSize: "1.125rem",

            // Update the link styling to be more prominent
            a: {
              color: "var(--tw-prose-links)",
              textDecoration: "underline",
              fontWeight: "600",
              transition: "color 0.2s ease-in-out",
              "&:hover": {
                color: "color-mix(in srgb, var(--tw-prose-links) 80%, white)",
                textDecoration: "none",
              },
            },
            blockquote: {
              fontWeight: "500",
              fontStyle: "italic",
              color: "var(--tw-prose-quotes)",
              borderLeftWidth: "0.25rem",
              borderLeftColor: "var(--tw-prose-quote-borders)",
              paddingLeft: "1em",
              marginTop: "1.6em",
              marginBottom: "1.6em",
              paddingTop: "0.5em",
              paddingBottom: "0.5em",
            },
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.625em",
              marginTop: "1.25em",
              marginBottom: "1.25em",
            },
            ol: {
              listStyleType: "decimal",
              paddingLeft: "1.625em",
              marginTop: "1.25em",
              marginBottom: "1.25em",
            },
            li: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            img: {
              marginTop: "2em",
              marginBottom: "2em",
              borderRadius: theme("borderRadius.md"),
            },
            figure: {
              marginTop: "2em",
              marginBottom: "2em",
            },
            figcaption: {
              color: "var(--tw-prose-captions)",
              fontSize: "0.875em",
              marginTop: "0.75em",
              textAlign: "center",
            },
            hr: {
              marginTop: "3em",
              marginBottom: "3em",
              borderColor: "var(--tw-prose-hr)",
            },
            table: {
              width: "100%",
              tableLayout: "auto",
              textAlign: "left",
              marginTop: "2em",
              marginBottom: "2em",
              fontSize: "0.875em",
            },
            thead: {
              borderBottomWidth: "1px",
              borderBottomColor: "var(--tw-prose-th-borders)",
            },
            th: {
              color: "var(--tw-prose-headings)",
              fontWeight: "600",
              padding: "0.75em",
              verticalAlign: "bottom",
            },
            td: {
              padding: "0.75em",
              verticalAlign: "top",
            },
            "tbody tr": {
              borderBottomWidth: "1px",
              borderBottomColor: "var(--tw-prose-td-borders)",
            },
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
