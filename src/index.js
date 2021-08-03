import App from "./App.svelte";

const app = new App({
	target: document.body,
});

export default app;

// recreate the whole app if an HMR update touches this module
