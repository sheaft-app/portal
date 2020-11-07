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
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import SellingPointRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
  import SetSellingPointAvailability from "./SetSellingPointAvailability.svelte";

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const notificationsInstance = new GetNotificationsInstance();
  const routerInstance = GetRouterInstance();

  export let params;

  let isUpdatingSellingPoint = false;
  let sellingPoint = null;

  onMount(async () => {
    await fetchSellingPoint(params.id);
  });

  const fetchSellingPoint = async id => {
    var res = await graphQLInstance.query(
      GET_SELLING_POINT_DETAILS,
      {
        id: id
      },
      errorsHandler.Uuid
    );

    if (!res.success) {
      //TODO
      routerInstance.goTo(SellingPointRoutes.List);
      return;
    }

    sellingPoint = res.data;
  };

  const handleSubmit = async () => {
    isUpdatingSellingPoint = true;

    var res = await graphQLInstance.mutate(
      UPDATE_SELLING_POINT,
      {
        ...sellingPoint,
        address: {
          ...sellingPoint.address,
          country: "FR"
        }
      },
      errorsHandler.Uuid
    );

    if (!res.success) {
      // todo
      isUpdatingSellingPoint = false;
      return;
    }

    notificationsInstance.success(
      "Vos modifications ont bien été appliquées."
    );

    isUpdatingSellingPoint = false;
    routerInstance.goTo(SellingPointRoutes.List);
  };

  const showDeleteModal = () => {
    open(DeleteSellingPoint, {
      onClose: async res => {
        if (res.success) {
          graphQLInstance.clearApolloCache(GET_SELLING_POINTS);
          routerInstance.goTo(SellingPointRoutes.List);
        }
      },
      sellingPoint
    });
  };

  const showSetAvailabilityModal = () => {
    open(SetSellingPointAvailability, {
      onClose: async res => {
        if (res.success) {
          graphQLInstance.clearApolloCache(GET_SELLING_POINTS);
          routerInstance.goTo(SellingPointRoutes.List);
        }
      },
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
      class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2">
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
    <SellingPointForm
      submit={handleSubmit}
      initialValues={sellingPoint}
      isLoading={isUpdatingSellingPoint} />
  {/if}
</TransitionWrapper>
