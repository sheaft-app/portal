<script>
  import CartRoutes from "./routes.js";
  import Router from "svelte-spa-router";
  import CartResume from "./CartResume.svelte";
  import CartSuccess from "./CartSuccess.svelte";

  export let params = {};

  export const prefix = CartRoutes.Prefix;

  const routes = {};
  routes[CartRoutes.Resume.SubPart] = CartResume;
  routes[CartRoutes.Success.SubPart] = CartSuccess;
</script>

<Router {routes} {prefix} />
