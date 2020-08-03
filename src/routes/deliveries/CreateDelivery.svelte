<script>
  import DeliveryFrom from "../../enums/DeliveryKind";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import { CREATE_DELIVERY } from "./mutations";
  import DeliveryForm from "./DeliveryForm.svelte";
  import DeliveryRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let isCreatingDelivery = false;

  let delivery = { 
    openingHours: [
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
    lockOrderHoursBeforeDelivery: 0
  };

  const handleSubmit = async () => {
    isCreatingDelivery = true;
    var res = await graphQLInstance.mutate(CREATE_DELIVERY, {
      name: "",
      kind: DeliveryKind.ProducerToStore.Value,
      ...delivery
    }, errorsHandler.Uuid);

    if (!res.success) {
      // todo
      return;
    }

    isCreatingDelivery = false;

    routerInstance.goTo(DeliveryRoutes.List);
  };
</script>

<svelte:head>
  <title>Renseigner vos horaires de livraison</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2">
    <h1 class="text-2xl mb-0 text-gray-700">Renseignez vos horaires de livraison</h1>
  </section>
  <DeliveryForm
    submit={handleSubmit}
    initialValues={delivery}
    isLoading={isCreatingDelivery} />
</TransitionWrapper>
