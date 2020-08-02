<script>
  import RegisterRoutes from "./routes.js";
  import Router from "svelte-spa-router";
  import RegisterChoose from "./RegisterChoose.svelte";
  import RegisterConsumer from "./RegisterConsumer.svelte";
  import RegisterOwner from "./RegisterOwner.svelte";

  export let params = {};

  export const prefix = RegisterRoutes.Prefix;

  const routes = {};
  routes[RegisterRoutes.Choose.SubPart] = RegisterChoose;
  routes[RegisterRoutes.Owner.SubPart] = RegisterOwner;
  routes[RegisterRoutes.Consumer.SubPart] = RegisterConsumer;
</script>

<Router {routes} {prefix} />
