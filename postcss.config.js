const tailwind = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssImport = require("postcss-import");
const purgecss = require("@fullhuman/postcss-purgecss")({
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
