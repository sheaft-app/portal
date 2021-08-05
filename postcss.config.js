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
		require("postcss-import"),
		require("tailwindcss"),
		require("postcss-nested"),
		require('postcss-preset-env')({
			features: { 'nesting-rules': false }
		}),
		require('postcss-nested-ancestors'),
		production && require("autoprefixer"),
		production && purgecss,
	].filter(plugin => plugin)
};
