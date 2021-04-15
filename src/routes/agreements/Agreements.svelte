<script>
	import AgreementRoutes from "./routes.js";
	import Router from "svelte-spa-router";
	import AgreementDetails from "./AgreementDetails.svelte";
	import ListAgreements from "./ListAgreements.svelte";
	import Meta from "../../components/Meta.svelte";

	export let params = {};

	export const prefix = AgreementRoutes.Prefix;

	const routes = {};
	routes[AgreementRoutes.List.SubPart] = ListAgreements;
	routes[AgreementRoutes.Details.SubPart] = AgreementDetails;
</script>

<Meta/>
<Router {routes} {prefix} />
