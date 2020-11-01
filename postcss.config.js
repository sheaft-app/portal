const tailwind = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssImport = require("postcss-import");
const purgecss = require("@fullhuman/postcss-purgecss")({
	whitelist: ['text-blue-500', 'bg-blue-500', 'text-green-500', 'bg-green-500', 'text-red-500','bg-red-500', 'text-gray-600', 'bg-gray-600'], // les orderStatusKind générés dynamiquement
	whitelistPatterns: [/svelte/, /fa/, /notyf/, /leaflet/, /ssp-/, /scal-/],
	content: ["./src/**/*.html", "./src/**/*.svelte"],
	defaultExtractor: (content) => {
		const regExp = new RegExp(/[\w-/:]+(?<!:)/g);

		const matchedTokens = [];

		let match = regExp.exec(content);

		while (match) {
			if (match[0].startsWith("class:")) {
				matchedTokens.push(match[0].substring(6));
			} else {
				matchedTokens.push(match[0]);
			}

			match = regExp.exec(content);
		}

		return matchedTokens;
	},
});

const production = !process.env.ROLLUP_WATCH;

module.exports = {
	parser: "postcss-scss",
	plugins: [
		postcssImport,
		tailwind(),
		autoprefixer,
		production && purgecss,
	].filter(Boolean),
	extract: true,
};
