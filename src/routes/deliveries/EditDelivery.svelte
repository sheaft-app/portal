<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import { CREATE_DELIVERY } from "./mutations";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import Loader from "./../../components/Loader.svelte";
  import { UPDATE_DELIVERY } from "./mutations";
  import { GET_DELIVERIES, GET_DELIVERY_DETAILS } from "./queries";
  import DeliveryForm from "./DeliveryForm.svelte";
  import { denormalizeOpeningHours } from "./../../helpers/app";
  import DeleteDelivery from "./DeleteDelivery.svelte";
  import DeliveryRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

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
      errorsHandler.Uuid,
      GET_DELIVERIES
    );

    isUpdatingDelivery = false;  
    
    if (!res.success) {
      // todo
      return;
    }
  
    await fetchDelivery(delivery.id);
  };

  const showDeleteModal = () => {
    open(DeleteDelivery, {
      delivery,
      onClose: async res => {
        if (res.success) {
          routerInstance.goTo(DeliveryRoutes.List);
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
      class="md:pt-12 lg:pt-2">
      <h1 class="font-semibold uppercase mb-0">Vos horaires de livraison magasin</h1>
      <span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>
    </section>
    <div class="mb-5 text-gray-600">
      <p>Cette section n'est utile pour vous que si vous souhaitez commercer avec des professionels. Elle sert à leur afficher vos horaires de livraison.</p>
      <p>Les particuliers ne voient pas ces informations.</p>
    </div>
    <DeliveryForm
      submit={handleSubmit}
      initialValues={delivery}
      isLoading={isUpdatingDelivery} />
  {/if}
</TransitionWrapper>
