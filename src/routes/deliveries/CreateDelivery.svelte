<script>
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
  import { CREATE_DELIVERY } from "./mutations";
  import { GET_DELIVERIES } from "./queries";
  import DeliveryForm from "./DeliveryForm.svelte";
  import DeliveryRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import DeliveryKind from "../../enums/DeliveryKind.js";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const notificationsInstance = GetNotificationsInstance();

  let isCreatingDelivery = false;

  let delivery = { 
    deliveryHours: [
      {
        id: 0,
        days: [],
        start: {
          hours: 0,
          minutes: 0
        },
        end: {
          hours: 0,
          minutes: 0
        }
      }
    ],
    available: true,
    lockOrderHoursBeforeDelivery: 0,
    autoAcceptRelatedPurchaseOrder:false,
    autoCompleteRelatedPurchaseOrder:false
  };


  const handleSubmit = async () => {
    isCreatingDelivery = true;
    var res = await graphQLInstance.mutate(CREATE_DELIVERY, {
      kind: DeliveryKind.ProducerToStore.Value,
      ...delivery
    }, 
    errorsHandler.Uuid,
    GET_DELIVERIES);

    isCreatingDelivery = false;

    if (!res.success) {
      // todo
      return;
    }
    notificationsInstance.success("Vos informations de livraisons ont bien été enregistrées.");
    routerInstance.goTo(DeliveryRoutes.List);
  };
</script>

<svelte:head>
  <title>Renseigner vos horaires de livraison</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
    <div class="mb-3">
        <button class="text-gray-600 items-center flex uppercase" on:click={() => routerInstance.goBack()}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Livraisons
        </button>
    </div>
        <h1 class="font-semibold uppercase mb-0">Créer un créneau de livraison magasin</h1>
  <DeliveryForm
    submit={handleSubmit}
    initialValues={delivery}
    isLoading={isCreatingDelivery} />
</TransitionWrapper>
