<script>
  import ExternalRoutes from "./routes.js";
  import ProductDetailsStandalone from "./ProductDetailsStandalone.svelte";
  import ProducerDetailsStandalone from "./ProducerDetailsStandalone.svelte";
  
  import Router from "svelte-spa-router";

  export let params = {};

  export const prefix = ExternalRoutes.Prefix;

  const routes = {};
  routes[ExternalRoutes.ProductDetails.SubPart] = ProductDetailsStandalone;
  routes[ExternalRoutes.ProducerDetails.SubPart] = ProducerDetailsStandalone;

</script>

<Router {routes} {prefix} />
