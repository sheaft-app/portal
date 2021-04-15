<script>
	import SellingPointRoutes from "./routes.js";
	import ListSellingPoints from "./ListSellingPoints.svelte";
	import CreateSellingPoint from "./CreateSellingPoint.svelte";
	import EditSellingPoint from "./EditSellingPoint.svelte";

	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};

	export const prefix = SellingPointRoutes.Prefix;

	const routes = {};
	routes[SellingPointRoutes.List.SubPart] = ListSellingPoints;
	routes[SellingPointRoutes.Create.SubPart] = CreateSellingPoint;
	routes[SellingPointRoutes.Details.SubPart] = EditSellingPoint;

</script>

<Meta/>
<Router {routes} {prefix} />
