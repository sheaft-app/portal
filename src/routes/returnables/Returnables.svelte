<script>
	import CreateReturnable from "./CreateReturnable.svelte";
	import EditReturnable from "./EditReturnable.svelte";
	import ListReturnables from "./ListReturnables.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";
	import ReturnableRoutes from "./routes";

	export let params;
	export const prefix = ReturnableRoutes.Prefix;

	const routes = {};
	routes[ReturnableRoutes.List.SubPart] = ListReturnables;
	routes[ReturnableRoutes.Create.SubPart] = CreateReturnable;
	routes[ReturnableRoutes.Details.SubPart] = EditReturnable;
</script>

<Meta />
<Router {routes} {prefix} />
