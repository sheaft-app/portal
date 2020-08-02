<script>
  import DeliveryRoutes from "./routes.js";
  import EditDelivery from "./EditDelivery.svelte";
  import ListDeliveries from "./ListDeliveries.svelte";
  import CreateDelivery from "./CreateDelivery.svelte";
  
  import Router from "svelte-spa-router";

  export let params = {};

  export const prefix = DeliveryRoutes.Prefix;

  const routes = {};
  routes[DeliveryRoutes.List.SubPart] = ListDeliveries;
  routes[DeliveryRoutes.Create.SubPart] = CreateDelivery;
  routes[DeliveryRoutes.Details.SubPart] = EditDelivery;

</script>

<Router {routes} {prefix} />
