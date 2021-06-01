<script>
	import JobDetails from "./JobDetails.svelte";
	import ListJobs from "./ListJobs.svelte";
	import JobRoutes from "./routes";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = JobRoutes.Prefix;

	const routes = {};
	routes[JobRoutes.List.SubPart] = ListJobs;
	routes[JobRoutes.Details.SubPart] = JobDetails;

</script>

<Meta />
<Router {routes} {prefix} />
