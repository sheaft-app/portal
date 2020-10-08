<script>
  import DeliveryFrom from "../../enums/DeliveryKind";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
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
    }, 
    errorsHandler.Uuid,
    GET_DELIVERIES);

    isCreatingDelivery = false;

    if (!res.success) {
      // todo
      return;
    }

    routerInstance.goTo(DeliveryRoutes.List);
  };
</script>

<svelte:head>
  <title>Renseigner vos horaires de livraison</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="md:pt-12 lg:pt-2">
    <h1 class="font-semibold uppercase mb-0">Vos horaires de livraison magasin</h1>
    <span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>
  </section>
  <div class="mb-5">
    <p>Cette section n'est utile pour vous que si vous souhaitez commercer avec des professionels. Elle sert à leur afficher vos horaires de livraison.</p>
    <p>Les particuliers ne voient pas ces informations.</p>
  </div>
  <DeliveryForm
    submit={handleSubmit}
    initialValues={delivery}
    isLoading={isCreatingDelivery} />
</TransitionWrapper>
