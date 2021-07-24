<script>
	import RetrievalRoutes from "./routes.js";
	import ListRetrievals from "./ListRetrievals.svelte";
	import ListHistoryRetrievals from "./ListHistoryRetrievals.svelte";
	import RetrievalDetails from "./RetrievalDetails.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = RetrievalRoutes.Prefix;

	const routes = {};
	routes[RetrievalRoutes.List.SubPart] = ListRetrievals;
	routes[RetrievalRoutes.History.SubPart] = ListHistoryRetrievals;
	routes[RetrievalRoutes.Details.SubPart] = RetrievalDetails;
</script>

<Meta />
<Router {routes} {prefix} />
