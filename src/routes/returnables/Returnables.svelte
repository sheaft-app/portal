<script>
	import CreateReturnable from "./CreateReturnable.svelte";
	import EditReturnable from "./EditReturnable.svelte";
	import ListReturnables from "./ListReturnables.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params;
	export const prefix = "/returnables";
	const routes = {
		"/": ListReturnables,
		"/create": CreateReturnable,
		"/:id": EditReturnable
	};
</script>

<Meta/>
<Router {routes} {prefix} />
