<script>
	import RegisterRoutes from "./routes.js";
	import Router from "svelte-spa-router";
	import RegisterChoose from "./RegisterChoose.svelte";
	import RegisterConsumer from "./RegisterConsumer.svelte";
	import RegisterOwner from "./RegisterOwner.svelte";
	import Meta from "../../components/Meta.svelte";

	export let params = {};

	export const prefix = RegisterRoutes.Prefix;

	const routes = {};
	routes[RegisterRoutes.Choose.SubPart] = RegisterChoose;
	routes[RegisterRoutes.Owner.SubPart] = RegisterOwner;
	routes[RegisterRoutes.Consumer.SubPart] = RegisterConsumer;

</script>

<Meta />
<Router {routes} {prefix} />
