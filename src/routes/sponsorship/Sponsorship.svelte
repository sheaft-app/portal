<script>
	import SponsorshipRoutes from "./routes.js";
	import ShareCode from "./ShareCode.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};

	export const prefix = SponsorshipRoutes.Prefix;

	const routes = {};
	routes[SponsorshipRoutes.Share.SubPart] = ShareCode;

</script>

<Meta />
<Router {routes} {prefix} />
