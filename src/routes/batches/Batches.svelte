<script>
	import BatchesRoutes from "./routes.js";
	import ListBatches from "./ListBatches.svelte";
	import BatchDetails from "./BatchDetails.svelte";
	
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = BatchesRoutes.Prefix;

	const routes = {};
	routes[BatchesRoutes.List.SubPart] = ListBatches;
	routes[BatchesRoutes.BatchDetails.SubPart] = BatchDetails;
</script>

<Meta />
<Router {routes} {prefix} />
