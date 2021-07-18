<script>
	import PreparationRoutes from "./routes.js";
	import ListPreparations from "./ListPreparations.svelte";
	import EditPreparation from "./EditPreparation.svelte";
	import Process from "./process/Process.svelte";
	import ProcessProduct from "./process/ProcessProduct.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = PreparationRoutes.Prefix;

	const routes = {};
	routes[PreparationRoutes.List.SubPart] = ListPreparations;
	routes[PreparationRoutes.Edit.SubPart] = EditPreparation;
	routes[PreparationRoutes.Process.SubPart] = Process;
	routes[PreparationRoutes.ProcessProduct.SubPart] = ProcessProduct;
</script>

<Meta />
<Router {routes} {prefix} />
