<script>
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import ProductForm from "./ProductForm.svelte";
  import { CREATE_PRODUCT } from "./mutations.js";
  import { GET_PRODUCTS } from "./queries.js";
  import ProductRoutes from "./routes.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
	import ConditioningKind from "../../enums/ConditioningKind";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const notificationsInstance = new GetNotificationsInstance();

  let isLoading = false;

  let product = {
    reference: null,
    unit: null,
    quantityPerUnit: null,
    vat: null,
    name: null,
    conditioning: ConditioningKind.Bulk.Value,
    returnableId: null,
    description: null,
    picture: null,
    tags: [],
    available: true,
    visibleToStores: true,
    visibleToConsumers: true,
    catalogs:[]
  };

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(CREATE_PRODUCT, {
      description: product.description,
      name: product.name,
      catalogs: product.catalogs.map((c) => ({
        id: c.id,
        wholeSalePricePerUnit: c.wholeSalePricePerUnit
      })),
      returnableId: product.returnable ? product.returnable.id : null,
      quantityPerUnit: product.quantityPerUnit,
      unit: product.unit,
      conditioning: product.conditioning,
      reference: product.reference,
      picture: product.picture ? product.picture : null,
      originalPicture: product.originalPicture ? product.originalPicture : null,
      tags: product.tags.map(i => i.id),
      vat: product.vat,
      available: product.available
    }, errorsHandler.Uuid, GET_PRODUCTS);

    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

    notificationsInstance.success("Le produit a bien été ajouté à votre catalogue");
    routerInstance.goTo(ProductRoutes.List);
  };
</script>

<svelte:head>
  <title>Créer un produit</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2">
    <div class="mb-3">
      <button
        class="text-gray-600 items-center flex uppercase"
        on:click={routerInstance.goBack}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Produits
      </button>
    </div>
    <h1 class="font-semibold uppercase mb-0">Créer un nouveau produit</h1>
  </section>
  <ProductForm
    submit={handleSubmit}
    {product}
    {isLoading} />
</TransitionWrapper>
