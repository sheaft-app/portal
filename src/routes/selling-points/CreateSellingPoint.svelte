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

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let isCreatingSellingPoint = false;

  let sellingPoint = { 
    name: "",
    kind: "",
    address: {
      line1: null,
      zipcode: null,
      city: null,
      latitude: null,
      longitude: null
    },
    openingHours: [
      {
        id: 0,
        days: [],
        from: null,
        to: null
      }
    ],
    lockOrderHoursBeforeDelivery: 0
  };

  const handleSubmit = async () => {
    isCreatingSellingPoint = true;

    var res = await graphQLInstance.mutate(CREATE_SELLING_POINT, sellingPoint, errorsHandler.Uuid);

    if (!res.success) {
      // todo
      return;
    }

    isCreatingSellingPoint = false;

    routerInstance.goTo(SellingPointRoutes.List);
  };
</script>

<svelte:head>
  <title>Ajouter un point de vente directe</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-300 border-solid md:pt-12 lg:pt-2">
    <div class="mb-3">
        <button class="text-gray-600 items-center flex uppercase" on:click={() => routerInstance.goBack()}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Retour
        </button>
    </div>
    <h1 class="text-2xl mb-0 text-gray-700">Ajouter un nouveau point de vente</h1>
  </section>
  <SellingPointForm
    submit={handleSubmit}
    initialValues={sellingPoint}
    isLoading={isCreatingSellingPoint} />
</TransitionWrapper>
