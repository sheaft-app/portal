import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";
import babel from "rollup-plugin-babel";
import svelteSVG from "rollup-plugin-svelte-svg";
import { generateSW } from "rollup-plugin-workbox";
import alias from "rollup-plugin-alias";
import define from "rollup-plugin-define";
import serve from "rollup-plugin-serve";
import { livereload } from "./livereload";
import nodePolyfills from 'rollup-plugin-polyfill-node';

const svelteConfig = require('./svelte.config.js');
const isNollup = !!process.env.NOLLUP;
const isWatch = !!process.env.ROLLUP_WATCH;
const isLiveReload = !!process.env.LIVERELOAD;

const isDev = isWatch || isLiveReload;
const production = !isDev;

export default {
	input: [
		"src/index.js",
		"src/configs/config.production.js",
		"src/configs/config.staging.js",
		"src/configs/config.sprint.js",
		"src/configs/config.docker.js",
		"src/configs/config.js",
	],
	output: [
		{
			dir: "public",
			format: "es",
			chunkFileNames: "[name]-[hash].js",
			sourcemap: isNollup || !production,
			compact: production,
		},
	],
	manualChunks(id) {
		if (id.includes("node_modules")) return "vendor";

		if (id.includes("src/configs/config.production.js")) return "config.production";
		else if (id.includes("src/configs/config.remote.js")) return "config.remote";
		else if (id.includes("src/configs/config.sprint.js")) return "config.sprint";
		else if (id.includes("src/configs/config.docker.js")) return "config.docker";
		else if (id.includes("src/configs/config.js")) return "config";

		if (
			id.includes("src/routes") ||
			id.includes("src/components") ||
			id.includes("src/services") ||
			id.includes("src/enums") ||
			id.includes("src/helpers") ||
			id.includes("src/stores") ||
			id.includes("src/App.svelte")
		) {
			return "app";
		}
	},
	plugins: [
		nodePolyfills({ include: ["util"] }),
		alias({
			forms: __dirname + "vendors/svelte-forms",
		}),
		del({
			targets: ["public/app-*", "public/vendor-*", "public/config*"],
			runOnce: true,
		}),
		define({
			replacements: {
				"process.env.NODE_ENV": production ? JSON.stringify("production") : JSON.stringify("development"),
				__buildDate__: () => JSON.stringify(new Date()),
			},
		}),
		// typescript({
		// 	removeComments: production,
		// 	sourceMap: !production,
		// }),
		svelte({
			compilerOptions: {
				dev: !production,
			},
			emitCss: svelteConfig.emitCss,
			preprocess: svelteConfig.preprocess,
		}),
		svelteSVG(),
		postcss(),
		production &&
			babel({
				extensions: [".ts", ".js", ".mjs", ".html", ".svelte"],
				runtimeHelpers: true,
				sourceMap: !production,
				include: ["src/**/*", "node_modules/svelte/**"],
				presets: [
					[
						"@babel/preset-env",
						{
							loose: false,
							debug: !production,
							modules: false,
							targets: {
								browsers: ["last 2 versions", "Firefox ESR", "> 1%"],
							},
						},
					],
				],
				plugins: [
					"@babel/plugin-proposal-export-default-from",
					"@babel/plugin-proposal-export-namespace-from",
					"@babel/plugin-proposal-class-properties",
					"@babel/plugin-proposal-object-rest-spread",
					"@babel/plugin-proposal-async-generator-functions",
					"@babel/plugin-transform-async-to-generator",
					"@babel/plugin-transform-shorthand-properties",
					"@babel/plugin-transform-function-name",
					"@babel/plugin-transform-for-of",
					"@babel/plugin-transform-duplicate-keys",
					"@babel/plugin-transform-spread",
					"@babel/plugin-transform-destructuring",
					"@babel/plugin-transform-computed-properties",
					"@babel/plugin-transform-block-scoped-functions",
					"@babel/plugin-transform-block-scoping",
					"@babel/plugin-transform-instanceof",
					"@babel/plugin-transform-new-target",
					"@babel/plugin-transform-object-super",
					"@babel/plugin-transform-parameters",
					"@babel/plugin-transform-sticky-regex",
					"@babel/plugin-transform-template-literals",
					"@babel/plugin-transform-property-mutators",
					[
						"@babel/plugin-transform-classes",
						{
							loose: true,
						},
					],
					"@babel/plugin-transform-named-capturing-groups-regex",
					["@babel/plugin-transform-arrow-functions", { spec: true }],
					"@babel/plugin-syntax-dynamic-import",
					[
						"@babel/plugin-transform-runtime",
						{
							corejs: 3,
							regenerator: true,
						},
					],
				],
			}),
		resolve({
			browser: true,
			dedupe: ["svelte"],
		}),
		commonjs(),
		production &&
			generateSW({
				swDest: "public/sw.js",
				globDirectory: "public",
				globPatterns: ["**/*.html"],
				mode: production ? "production" : "debug",
				runtimeCaching: [
					{
						handler: "NetworkFirst",
						urlPattern: new RegExp("^https://api.sheaft.com/.*", "iyg"),
						options: {
							cacheName: "sheaftapi-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://content.sheaft.com/pictures/.*", "iyg"),
						options: {
							cacheName: "sheaftcontent-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://app.sheaft.com/assets/.*", "iyg"),
						options: {
							cacheName: "sheaftassets-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://app.sheaft.com/img/.*", "iyg"),
						options: {
							cacheName: "sheaftimg-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://app.sheaft.com/dist/vendor-.*", "iyg"),
						options: {
							cacheName: "sheaftvendor-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://api.insee.fr/.*", "iyg"),
						options: {
							cacheName: "insee-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://api-adresse.data.gouv.fr/.*", "iyg"),
						options: {
							cacheName: "addressgouv-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://fonts.googleapis.com/.*", "iyg"),
						options: {
							cacheName: "google-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp("^https://api.maptiler.com/.*", "iyg"),
						options: {
							cacheName: "leaflet-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp(/^https:\/\/app.sheaft.com\/[assets|img]+\/.*/, "iyg"),
						options: {
							cacheName: "local-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						handler: "CacheFirst",
						urlPattern: new RegExp(/^https:\/\/images.unsplash.com.*/, "iyg"),
						options: {
							cacheName: "local-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			}),
		!isNollup && isDev && serve({ contentBase: "public", port: 4200 }),
		isDev && livereload("public"),
		production &&
			terser({
				module: false,
			}),
	],
	watch: {
		clearScreen: false,
	},
};
