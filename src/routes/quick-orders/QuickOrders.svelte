<script>
	import QuickOrderRoutes from "./routes.js";
	import QuickOrderPurchase from "./QuickOrderPurchase.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = QuickOrderRoutes.Prefix;

	const routes = {};
	routes[QuickOrderRoutes.Purchase.SubPart] = QuickOrderPurchase;

</script>

<Meta />
<Router {routes} {prefix} />
