import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: 'none',
  					color: 'hsl(var(--foreground))',
  					a: {
  						color: 'hsl(var(--primary))',
  						textDecoration: 'none',
  						fontWeight: '500',
  						'&:hover': {
  							color: 'hsl(var(--primary))',
  							textDecoration: 'underline',
  						},
  					},
  					h1: {
  						color: 'hsl(var(--foreground))',
  					},
  					h2: {
  						color: 'hsl(var(--foreground))',
  					},
  					h3: {
  						color: 'hsl(var(--foreground))',
  					},
  					h4: {
  						color: 'hsl(var(--foreground))',
  					},
  					p: {
  						color: 'hsl(var(--foreground))',
  					},
  					li: {
  						color: 'hsl(var(--foreground))',
  					},
  					blockquote: {
  						color: 'hsl(var(--muted-foreground))',
  						borderLeftColor: 'hsl(var(--border))',
  					},
  					code: {
  						color: 'hsl(var(--foreground))',
  						backgroundColor: 'hsl(var(--muted))',
  						borderRadius: '0.25rem',
  						padding: '0.25rem',
  					},
  					pre: {
  						backgroundColor: 'hsl(var(--muted))',
  						code: {
  							backgroundColor: 'transparent',
  							padding: '0',
  						},
  					},
  					hr: {
  						borderColor: 'hsl(var(--border))',
  					},
  					strong: {
  						color: 'hsl(var(--foreground))',
  					},
  					thead: {
  						borderBottomColor: 'hsl(var(--border))',
  						th: {
  							color: 'hsl(var(--foreground))',
  						},
  					},
  					tbody: {
  						tr: {
  							borderBottomColor: 'hsl(var(--border))',
  						},
  						td: {
  							color: 'hsl(var(--foreground))',
  						},
  					},
  				},
  			},
  			dark: {
  				css: {
  					color: 'hsl(var(--foreground))',
  					a: {
  						color: 'hsl(var(--primary))',
  					},
  					blockquote: {
  						color: 'hsl(var(--muted-foreground))',
  						borderLeftColor: 'hsl(var(--border))',
  					},
  					code: {
  						backgroundColor: 'hsl(var(--muted))',
  					},
  					pre: {
  						backgroundColor: 'hsl(var(--muted))',
  					},
  				},
  			},
  		},
  	}
  },
  plugins: [animate, typography],
} satisfies Config;
