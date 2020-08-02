<script>
  import JobDetails from "./JobDetails.svelte";
  import ListJobs from "./ListJobs.svelte";
  import JobRoutes from "./routes";
  import Router from "svelte-spa-router";

  export let params = {};
  export const prefix = JobRoutes.Prefix;

  const routes = {};
  routes[JobRoutes.List.SubPart] = ListJobs;
  routes[JobRoutes.Details.SubPart] = JobDetails;

</script>

<Router {routes} {prefix} />
