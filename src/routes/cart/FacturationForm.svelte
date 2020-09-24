<script>
	import LegalsForm from "../../components/forms/LegalsForm.svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import GetRouterInstance from "../../services/SheaftRouter";
  import CartRoutes from "./routes";
  
  export let user, errorsHandler = null;

  const routerInstance = GetRouterInstance();
  $: console.log(user);
</script>

<LegalsForm bind:user {errorsHandler} canFlex={false}>
  <section slot="header" class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2 px-5 lg:px-0">
    <div class="mb-3">
      <button
        class="text-gray-600 items-center flex uppercase"
        on:click={() => routerInstance.goTo(CartRoutes.Resume)}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Revenir au panier
      </button>
    </div>
    <h1 class="text-2xl mb-0 text-gray-700">Informations de facturation</h1>
  </section>
</LegalsForm>