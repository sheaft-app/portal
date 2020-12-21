<script>
  import ExternalRoutes from "./routes.js";
  import ProductDetailsStandalone from "./ProductDetailsStandalone.svelte";
  
  import Router from "svelte-spa-router";

  export let params = {};

  export const prefix = ExternalRoutes.Prefix;

  const routes = {};
  routes[ExternalRoutes.ProductDetails.SubPart] = ProductDetailsStandalone;

</script>

<Router {routes} {prefix} />
