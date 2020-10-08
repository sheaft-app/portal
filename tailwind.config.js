module.exports = {
	corePlugins: {},
	theme: {
		extend: {
			transitionProperty: {
				height: "height",
				width: "width",
			},
		},
		fontSize: {
		 'xxs': '.65rem',
		 'xs': '.75rem',
		 'sm': '.875rem',
		 'tiny': '.875rem',
		 'base': '1rem',
		 'lg': '1.125rem',
		 'xl': '1.25rem',
		 '2xl': '1.4rem',
		 '3xl': '1.875rem',
		 '4xl': '2.25rem',
		 '5xl': '3rem'
		},
		backgroundColor: theme => ({
			...theme('colors'),
			'primary': '#009688',
			'secondary': '#ffed4a',
			'danger': '#e3342f',
			'accent': '#ff4081'
		})
	},
	variants: {
		width: ["responsive", "hover", "focus"],
		height: ["responsive", "hover", "focus"],
	},
	plugins: [],
};
