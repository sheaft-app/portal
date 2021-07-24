<script>
	import StoreRoutes from "./routes.js";
	import ListStoreTraceability from "./ListStoreTraceability.svelte";
	
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = StoreRoutes.Prefix;

	const routes = {};
	routes[StoreRoutes.List.SubPart] = ListStoreTraceability;
</script>

<Meta />
<Router {routes} {prefix} />
