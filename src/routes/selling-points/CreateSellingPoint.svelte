<script>
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import { CREATE_SELLING_POINT } from "./mutations";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import SellingPointForm from "./SellingPointForm.svelte";
  import SellingPointRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
import { GET_SELLING_POINTS } from "./queries";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const notificationsInstance = new GetNotificationsInstance();

  let isCreatingSellingPoint = false;

  let sellingPoint = { 
    name: "",
    kind: "",
    address: null,
    maxPurchaseOrdersPerTimeSlot: null,
    autoAcceptRelatedPurchaseOrder: false,
    autoCompleteRelatedPurchaseOrder: false,
    openingHours: [
      {
        id: 0,
        days: [],
        from: null,
        to: null
      }
    ],
    lockOrderHoursBeforeDelivery: null
  };

  const handleSubmit = async () => {
    isCreatingSellingPoint = true;

    var res = await graphQLInstance.mutate(
      CREATE_SELLING_POINT, 
      {
        ...sellingPoint,
        available: true,
        address: {
          ...sellingPoint.address,
          country: "FR"
        }
      }, 
      errorsHandler.Uuid,
      GET_SELLING_POINTS);

    isCreatingSellingPoint = false;

    if (!res.success) {
      // todo
      return;
    }
    
    notificationsInstance.success(
      "Votre point de vente a bien été créé."
    );

    routerInstance.goTo(SellingPointRoutes.List);
  };
</script>

<svelte:head>
  <title>Ajouter un point de vente directe</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
    <div class="mb-3">
        <button class="text-gray-600 items-center flex uppercase" on:click={() => routerInstance.goBack()}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Points de vente
        </button>
    </div>
        <h1 class="font-semibold uppercase mb-0">Créer un nouveau point de vente</h1>
  </section>
  <SellingPointForm
    submit={handleSubmit}
    initialValues={sellingPoint}
    isLoading={isCreatingSellingPoint} />
</TransitionWrapper>
