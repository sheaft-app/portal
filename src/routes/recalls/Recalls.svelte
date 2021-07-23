<script>
	import RecallsRoutes from "./routes.js";
	import ListRecalls from "./ListRecalls.svelte";
	import CreateRecall from "./CreateRecall.svelte";
	import EditRecall from "./EditRecall.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = RecallsRoutes.Prefix;

	const routes = {};
	routes[RecallsRoutes.List.SubPart] = ListRecalls;
	routes[RecallsRoutes.Create.SubPart] = CreateRecall;
	routes[RecallsRoutes.Edit.SubPart] = EditRecall;
</script>

<Meta />
<Router {routes} {prefix} />
