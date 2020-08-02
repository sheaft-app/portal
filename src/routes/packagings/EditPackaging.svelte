<script>
  import { onMount, getContext } from "svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import Loader from "./../../components/Loader.svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import { UPDATE_PACKAGING } from "./mutations";
  import { GET_PACKAGING_DETAILS } from "./queries";
  import PackagingForm from "./PackagingForm.svelte";
  import DeletePackaging from "./DeletePackaging.svelte";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import PackagingRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  export let params;

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let isLoading = false;
  let packaging = null;

  onMount(async () => {
    await getPackaging(params.id);
  });

  const getPackaging = async (id) => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PACKAGING_DETAILS, {
      id: id
    }, errorsHandler.Uuid);
    isLoading = false;

    if(!res.success){
      //TODO
      routerInstance.goTo(PackagingRoutes.List);
      return;
    }

    packaging = res.data;
  }

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(UPDATE_PACKAGING, packaging, errorsHandler.Uuid);
    isLoading = false;

    if(!res.success){
      //TODO
      return;
    }

    routerInstance.goTo(PackagingRoutes.List);
  };

  const showDeleteModal = () => {
    open(DeletePackaging, {      
      packaging,
      onClose: async res => {
        if(res.success){
          routerInstance.goTo(PackagingRoutes.List);
        }
      }
    });
  }
</script>

<svelte:head>
  <title>Modifier la consigne</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !packaging}
    <Loader />
  {:else}
    <section
        class="mb-4 pb-4 border-b border-gray-300 border-solid md:pt-12 lg:pt-2">
        <div class="mb-3">
            <button class="text-gray-600 items-center flex uppercase" on:click={() => routerInstance.goBack()}>
            <Icon data={faChevronLeft} class="mr-2 inline" />
            Retour
            </button>
        </div>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl mb-0">Modifier la consigne</h1>
          <button class="btn btn-lg bg-red-500 text-white" on:click={() => showDeleteModal()}>Supprimer</button>
        </div>
    </section>
    <PackagingForm
        submit={handleSubmit}
        packaging={packaging}
        isLoading={isLoading} />
   {/if}   
</TransitionWrapper>
