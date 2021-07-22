<script>
	import ExpectedDeliveriesRoutes from "./routes.js";
	import ListExpectedDeliveries from "./ListExpectedDeliveries.svelte";
	import ListHistoryExpectedDeliveries from "./ListHistoryExpectedDeliveries.svelte";
	import ExpectedDeliveryDetails from "./ExpectedDeliveryDetails.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = ExpectedDeliveriesRoutes.Prefix;

	const routes = {};
	routes[ExpectedDeliveriesRoutes.List.SubPart] = ListExpectedDeliveries;
	routes[ExpectedDeliveriesRoutes.History.SubPart] = ListHistoryExpectedDeliveries;
	routes[ExpectedDeliveriesRoutes.Details.SubPart] = ExpectedDeliveryDetails;
</script>

<Meta />
<Router {routes} {prefix} />
