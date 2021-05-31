const tailwind = require("tailwindcss");
const autoPrefixer = require("autoprefixer");
const cssImport = require("postcss-import");
const cssNesting = require("postcss-nesting");

const purgecss = require("@fullhuman/postcss-purgecss")({
	safelist: [/svelte/, /fa/, /notyf/, /swiper/, /leaflet/, /ssp-/, /scal-/, /tw-/, /bg-.*-[0-9]{3}/, /border-.*-[0-9]{3}/, /text-.*-[0-9]{3}/,/cropper-/,/line-/,/point-/,/dashed-/],
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
		cssImport,
		tailwind,
		cssNesting,
		production && autoPrefixer,
		production && purgecss,
	].filter(plugin => plugin)
};
