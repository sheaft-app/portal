<script>
	import ExternalRoutes from "./routes.js";
	import ProductDetailsStandalone from "./ProductDetailsStandalone.svelte";
	import ProducerDetailsStandalone from "./ProducerDetailsStandalone.svelte";
	import StoreDetailsStandalone from "./StoreDetailsStandalone.svelte";

	import Router from "svelte-spa-router";

	export let params = {};

	export const prefix = ExternalRoutes.Prefix;

	const routes = {};
	routes[ExternalRoutes.ProductDetails.SubPart] = ProductDetailsStandalone;
	routes[ExternalRoutes.ProducerDetails.SubPart] = ProducerDetailsStandalone;
	routes[ExternalRoutes.StoreDetails.SubPart] = StoreDetailsStandalone;

</script>

<Router {routes} {prefix} />
