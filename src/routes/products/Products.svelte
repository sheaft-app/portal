<script>
	import ProductRoutes from "./routes.js";
	import EditProduct from "./EditProduct.svelte";
	import ListProducts from "./ListProducts.svelte";
	import CreateProduct from "./CreateProduct.svelte";
	import ProductRatings from "./ProductRatings.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = ProductRoutes.Prefix;

	const routes = {};
	routes[ProductRoutes.List.SubPart] = ListProducts;
	routes[ProductRoutes.Create.SubPart] = CreateProduct;
	routes[ProductRoutes.Details.SubPart] = EditProduct;
	routes[ProductRoutes.Ratings.SubPart] = ProductRatings;

</script>

<Meta/>
<Router {routes} {prefix} />
