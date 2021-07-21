<script>
	import BillingRoutes from "./routes.js";
	import ListBillings from "./ListBillings.svelte";
	import ListHistoryBillings from "./ListHistoryBillings.svelte";
	import BillingDetails from "./BillingDetails.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = BillingRoutes.Prefix;

	const routes = {};
	routes[BillingRoutes.List.SubPart] = ListBillings;
	routes[BillingRoutes.History.SubPart] = ListHistoryBillings;
	routes[BillingRoutes.Details.SubPart] = BillingDetails;
</script>

<Meta />
<Router {routes} {prefix} />
