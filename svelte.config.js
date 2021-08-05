// svelte.config.js
const autoPreprocess = require('svelte-preprocess');

module.exports = {
    emitCss: true,
    preprocess: autoPreprocess({
        globalStyle: true,
        postcss: true,
        scss: true,
        typescript: true,
    }),		
};