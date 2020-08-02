<script>
  import CreatePackaging from "./CreatePackaging.svelte";
  import EditPackaging from "./EditPackaging.svelte";
  import ListPackagings from "./ListPackagings.svelte";
  import Router from "svelte-spa-router";

  import { onMount } from "svelte";

  export let params;
  export const prefix = "/packagings";
  const routes = {
    "/": ListPackagings,
    "/create": CreatePackaging,
    "/:id": EditPackaging
  };
</script>

<Router {routes} {prefix} />