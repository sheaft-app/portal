<script>
	import MyRecallsRoutes from "./routes.js";
	import ListMyRecalls from "./ListMyRecalls.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = MyRecallsRoutes.Prefix;

	const routes = {};
	routes[MyRecallsRoutes.List.SubPart] = ListMyRecalls;
</script>

<Meta />
<Router {routes} {prefix} />
