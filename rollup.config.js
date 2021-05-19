import svelte from "rollup-plugin-svelte-hot";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import {terser} from "rollup-plugin-terser";
import del from "rollup-plugin-delete";
import babel from "rollup-plugin-babel";
import svelteSVG from "rollup-plugin-svelte-svg";
import {generateSW} from "rollup-plugin-workbox";
import autoPreprocess from "svelte-preprocess";
import alias from "rollup-plugin-alias";
import define from 'rollup-plugin-define';
import hmr from 'rollup-plugin-hot';
import postcss from 'rollup-plugin-postcss';

const buildDir = "public/dist";
const isNollup = !!process.env.NOLLUP
const isWatch = !!process.env.ROLLUP_WATCH
const isLiveReload = !!process.env.LIVERELOAD

const isDev = isWatch || isLiveReload
const production = !isDev

const isHot = isWatch && !isLiveReload

function serve() {
	let server

	function toExit() {
		if (server) server.kill(0)
	}

	return {
		name: 'svelte/template:serve',
		writeBundle() {
			if (server) return
			server = require('child_process').spawn(
				'npm',
				['run', 'start', '--', '--dev'],
				{
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true,
				}
			)

			process.on('SIGTERM', toExit)
			process.on('exit', toExit)
		},
	}
}

export default {
	input: "src/index.js",
	output: [
		!production ? {
			format: 'iife',
			name: 'dev',
			file: 'public/dist/index.js',
			sourcemap: !production,
			compact: production,
		} : {
			name: "prod",
			dir: `${buildDir}`,
			format: "es",
			sourcemap: !production,
			compact: production,
		},
	],
	manualChunks(id) {
		if (production && id.includes("node_modules")) {
			return "vendor";
		}
	},
	plugins: [
		alias({
			forms: __dirname + "vendors/svelte-forms",
		}),
		production && del({
			targets: "public/dist/*",
			runOnce: true,
		}),
		define({
			replacements: {
				'process.env.NODE_ENV': production ? JSON.stringify('production') : JSON.stringify('development'),
				__buildDate__: () => JSON.stringify(new Date()),
			}
		}),
		// typescript({
		// 	removeComments: production,
		// 	sourceMap: !production,
		// }),
		svelte({
			compilerOptions: {
				dev: !production
			},
			emitCss: true,
			preprocess: autoPreprocess({
				globalStyle: true,
				postcss: true,
				scss: true,
				sourceMap: !production
			}),
			hot: isHot && {
				optimistic: true,
				preserveLocalState: true
			}
		}),
		svelteSVG(),
		postcss(),
		production && babel({
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
				["@babel/plugin-transform-arrow-functions", {spec: true}],
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
		isDev && !isNollup && serve(),
		isLiveReload && livereload('public'),
		production && terser(),
		hmr({
			public: 'public',
			inMemory: true,
			compatModuleHot: !isHot,
		}),
		production && generateSW({
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
					urlPattern: new RegExp(
						"^https://content.sheaft.com/pictures/.*",
						"iyg"
					),
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
					urlPattern: new RegExp(
						"^https://app.sheaft.com/dist/vendor-.*",
						"iyg"
					),
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
					urlPattern: new RegExp(
						/^https:\/\/app\.sheaft\.com\/[assets|img]+\/.*/,
						"iyg"
					),
					options: {
						cacheName: "local-cache",
						cacheableResponse: {
							statuses: [0, 200],
						},
					},
				},
				{
					handler: "CacheFirst",
					urlPattern: new RegExp(/^https:\/\/images\.unsplash\.com.*/, "iyg"),
					options: {
						cacheName: "local-cache",
						cacheableResponse: {
							statuses: [0, 200],
						},
					},
				},
			],
		})
	],
	watch: {
		clearScreen: false,
	},
};
