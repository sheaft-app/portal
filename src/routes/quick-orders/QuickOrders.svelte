<script>
	import QuickOrderRoutes from "./routes.js";
	import ListQuickOrders from "./ListQuickOrders.svelte";
	import CreateQuickOrder from "./CreateQuickOrder.svelte";
	import EditQuickOrder from "./EditQuickOrder.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = QuickOrderRoutes.Prefix;

	const routes = {};
	routes[QuickOrderRoutes.List.SubPart] = ListQuickOrders;
	routes[QuickOrderRoutes.Create.SubPart] = CreateQuickOrder;
	routes[QuickOrderRoutes.Edit.SubPart] = EditQuickOrder;
</script>

<Meta />
<Router {routes} {prefix} />
