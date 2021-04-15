<script>
	import PurchaseOrderRoutes from "./routes.js";
	import ListPurchaseOrders from "./ListPurchaseOrders.svelte";
	import PurchaseOrderDetails from "./PurchaseOrderDetails.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = PurchaseOrderRoutes.Prefix;

	const routes = {};
	routes[PurchaseOrderRoutes.List.SubPart] = ListPurchaseOrders;
	routes[PurchaseOrderRoutes.Details.SubPart] = PurchaseOrderDetails;
</script>

<Meta/>
<Router {routes} {prefix} />
