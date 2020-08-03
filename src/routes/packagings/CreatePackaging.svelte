<script>
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import PackagingForm from "./PackagingForm.svelte";
  import { CREATE_PACKAGING } from "./mutations";
  import PackagingRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  export let isInModal = false, onClose, close;
  
  const graphQLInstance = GetGraphQLInstance();
  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();

  let isLoading = false;

  let packaging = { 
    name: "",
    description: "",
    vat: null,
    wholeSalePrice: null
  };

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(CREATE_PACKAGING, packaging, errorsHandler.Uuid);
    isLoading = false;

    if(!res.success){
      //TODO
      return;
    }

    if(isInModal)
      await handleClose(res);
    else
      routerInstance.goTo(PackagingRoutes.List);
  };
  
  const handleClose = async (res) => {
    close();

    if(onClose)
      await onClose(res);
  };
</script>

<svelte:head>
  <title>Créer une nouvelle consigne</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2">
    {#if !isInModal}
      <div class="mb-3">
        <button class="text-gray-600 items-center flex uppercase" on:click={() => routerInstance.goBack()}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Retour
        </button>
      </div>
    {/if}
    <h1 class="text-2xl mb-0 text-gray-700">Créer une nouvelle consigne</h1>
  </section>
  <PackagingForm
    isInModal={isInModal}
    submit={handleSubmit}
    packaging={packaging}
    isLoading={isLoading}
    close={handleClose} />
</TransitionWrapper>
