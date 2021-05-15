<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import Loader from "./../../components/Loader.svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import { UPDATE_SELLING_POINT } from "./mutations";
  import { GET_SELLING_POINTS, GET_SELLING_POINT_DETAILS } from "./queries";
  import SellingPointForm from "./SellingPointForm.svelte";
  import DeleteSellingPoint from "./DeleteSellingPoint.svelte";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import SellingPointRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import SetSellingPointAvailability from "./SetSellingPointAvailability.svelte";
  import { normalizeSellingPoint } from "./sellingPointForm";

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const { query, mutate } = getContext("api");
  const routerInstance = GetRouterInstance();

  export let params;

  let sellingPoint = null;

  onMount(async () => {
    sellingPoint = await query({
      query: GET_SELLING_POINT_DETAILS,
      variables: { id: params.id }, 
      errorsHandler,
      error: () => routerInstance.goTo(SellingPointRoutes.List),
			errorNotification: "Le point de vente auquel vous essayez d'accéder n'existe plus."
    });
  });

  const handleSubmit = async () => {
    return mutate({
			mutation: UPDATE_SELLING_POINT,
			variables: normalizeSellingPoint(sellingPoint),
			errorsHandler,
			success: () => routerInstance.goTo(SellingPointRoutes.List),
			successNotification: "Vos modifications ont bien été appliquées au point de vente",
			errorNotification: "Impossible de modifier le point de vente",
			clearCache: [GET_SELLING_POINTS]
    });
  };

  const showDeleteModal = () => {
    open(DeleteSellingPoint, {
      onClose: () => routerInstance.goTo(SellingPointRoutes.List),
      sellingPoint
    });
  };

  const showSetAvailabilityModal = () => {
    open(SetSellingPointAvailability, {
      onClose: () => routerInstance.goTo(SellingPointRoutes.List),
      sellingPoint
    });
  };

  onDestroy(() => (sellingPoint = null));
</script>

<svelte:head>
  <title>Modifier un point de vente directe</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !sellingPoint}
    <Loader />
  {:else}
    <section
      class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
      <div class="mb-3">
        <button
          class="text-gray-600 items-center flex uppercase"
          on:click={() => routerInstance.goTo(SellingPointRoutes.List)}>
          <Icon data={faChevronLeft} class="mr-2 inline" />
          Points de vente
        </button>
      </div>
      <div class="flex justify-between items-center">
        <h1 class="font-semibold uppercase mb-0">{sellingPoint.name || "Modifier point de vente"}</h1>
        {#if !sellingPoint.available}
          <span
            class="rounded-full bg-orange-500 ml-2 mr-2 px-3 py-1 shadow uppercase
            font-semibold text-xs text-white my-2 h-6">
            Indisponible
          </span>
        {/if}
      </div>
      <div class="flex mt-2">
        <button
          class={`btn btn-lg bg-white border mr-2 hover:text-white ${sellingPoint.available ? 'text-orange-500 border-orange-500 hover:bg-orange-500' : 'text-green-500 border-green-500 hover:bg-green-500'}`}
          on:click={showSetAvailabilityModal}>
          {sellingPoint.available ? 'Désactiver' : 'Activer'}
        </button>
        <button
          class="btn btn-lg bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
          on:click={showDeleteModal}>
          Supprimer
        </button>
      </div>
    </section>
    <SellingPointForm submit={handleSubmit} bind:sellingPoint />
  {/if}
</TransitionWrapper>
