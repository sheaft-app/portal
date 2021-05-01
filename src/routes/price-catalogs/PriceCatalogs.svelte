<script>
	import CreateCatalog from "./CreateCatalog.svelte";
	import EditCatalog from "./EditCatalog.svelte";
	import ListCatalogs from "./ListCatalogs.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params;
	export const prefix = "/price-catalogs";

	const routes = {
		"/": ListCatalogs,
		"/create": CreateCatalog,
		"/:id": EditCatalog
	};
</script>

<Meta/>
<Router {routes} {prefix} />
