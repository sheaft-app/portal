<script>
	import AccountingRoutes from "./routes.js";
	import ListAccountings from "./ListAccountings.svelte";
	import AccountingDetails from "./AccountingDetails.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = AccountingRoutes.Prefix;

	const routes = {};
	routes[AccountingRoutes.List.SubPart] = ListAccountings;
	routes[AccountingRoutes.Details.SubPart] = AccountingDetails;
</script>

<Meta />
<Router {routes} {prefix} />
