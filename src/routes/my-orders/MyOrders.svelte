<script>
	import MyOrderRoutes from "./routes";
	import ListMyOrders from "./ListMyOrders.svelte";
	import MyOrderDetails from "./MyOrderDetails.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = MyOrderRoutes.Prefix;

	const routes = {};
	routes[MyOrderRoutes.List.SubPart] = ListMyOrders;
	routes[MyOrderRoutes.Details.SubPart] = MyOrderDetails;

</script>

<Meta />
<Router {routes} {prefix} />
