<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import Loader from "./../../components/Loader.svelte";
  import { UPDATE_DELIVERY } from "./mutations";
  import { GET_DELIVERIES, GET_DELIVERY_DETAILS } from "./queries";
  import DeliveryForm from "./DeliveryForm.svelte";
  import DeleteDelivery from "./DeleteDelivery.svelte";
  import DeliveryRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const notificationsInstance = GetNotificationsInstance();

  export let params;

  let isUpdatingDelivery = false;
  let delivery = null;

  onMount(async () => {
    await fetchDelivery(params.id);
  });

  const fetchDelivery = async id => {
    var res = await graphQLInstance.query(
      GET_DELIVERY_DETAILS,
      { id: id },
      errorsHandler.Uuid
    );

    if (!res.success) {
      // todo
      routerInstance.goTo(DeliveryRoutes.List);
      return;
    }

    delivery = res.data;
  };

  const handleSubmit = async () => {
    isUpdatingDelivery = true;
    var res = await graphQLInstance.mutate(
      UPDATE_DELIVERY,
      delivery,
      errorsHandler.Uuid
    );

    isUpdatingDelivery = false;  
    
    if (!res.success) {
      // todo
      return;
    }
    notificationsInstance.success("Vos modifications ont bien été appliquées.");
    routerInstance.goTo(DeliveryRoutes.List);
  };

  const showDeleteModal = () => {
    open(DeleteDelivery, {
      delivery,
      onClose: async res => {
        if (res.success) {
          routerInstance.goTo(DeliveryRoutes.List);
          graphQLInstance.clearApolloCache(GET_DELIVERIES);
        }
      }
    });
  };

  onDestroy(() => (delivery = null));
</script>

<svelte:head>
  <title>Modifier vos horaires de livraison</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !delivery}
    <Loader />
  {:else}
  <section
  class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
  <div class="mb-3">
    <button
      class="text-gray-600 items-center flex uppercase"
      on:click={() => routerInstance.goTo(DeliveryRoutes.List)}>
      <Icon data={faChevronLeft} class="mr-2 inline" />
      Livraisons
    </button>
  </div>
  <div class="flex justify-between items-center">
    <h1 class="font-semibold uppercase mb-0">{delivery.name || "Modifier créneau de livraison"}</h1>
    {#if !delivery.available}
      <span
        class="rounded-full bg-orange-500 ml-2 mr-2 px-3 py-1 shadow uppercase
        font-semibold text-xs text-white my-2 h-6">
        Indisponible
      </span>
    {/if}
  </div>
  <div class="flex mt-2">
    <!-- <button
      class={`btn btn-lg bg-white border mr-2 hover:text-white ${delivery.available ? 'text-orange-500 border-orange-500 hover:bg-orange-500' : 'text-green-500 border-green-500 hover:bg-green-500'}`}
      on:click={showSetAvailabilityModal}>
      {delivery.available ? 'Désactiver' : 'Activer'}
    </button> -->
    <button
      class="btn btn-lg bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
      on:click={showDeleteModal}>
      Supprimer
    </button>
  </div>
</section>
    <DeliveryForm
      submit={handleSubmit}
      initialValues={delivery}
      isLoading={isUpdatingDelivery} />
  {/if}
</TransitionWrapper>
