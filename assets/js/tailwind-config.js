// Tailwind CSS Configuration
tailwind.config = {
	theme: {
		extend: {
			colors: {
				'forge-black': '#000000',
				'forge-dark': '#050505',
				'forge-card': 'rgba(10, 10, 10, 0.8)',
				'forge-border': '#333333',
				'forge-text': '#F0F0F0',
				'forge-muted': '#888888',
				'forge-accent': '#FFFFFF',
				'forge-accent-hover': '#CCCCCC',
				'forge-success': '#00FF00',
			},
			fontFamily: {
				'mono': ['IBM Plex Mono', 'monospace'],
				'sans': ['Inter', 'system-ui', 'sans-serif'],
			},
			letterSpacing: {
				'tightest': '-0.05em',
				'widest': '0.3em',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			}
		}
	}
}
