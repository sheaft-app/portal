<script>
	import PickingRoutes from "./routes.js";
	import ListPickings from "./ListPickings.svelte";
	import ListPickingHistory from "./ListPickingHistory.svelte";
	import PickingSummary from "./PickingSummary.svelte";
	import EditPicking from "./EditPicking.svelte";
	import Process from "./process/Process.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = PickingRoutes.Prefix;

	const routes = {};
	routes[PickingRoutes.List.SubPart] = ListPickings;
	routes[PickingRoutes.Summary.SubPart] = PickingSummary;
	routes[PickingRoutes.History.SubPart] = ListPickingHistory;
	routes[PickingRoutes.Edit.SubPart] = EditPicking;
	routes[PickingRoutes.Process.SubPart] = Process;
</script>

<Meta />
<Router {routes} {prefix} />
