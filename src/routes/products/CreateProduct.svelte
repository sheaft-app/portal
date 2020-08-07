<script>
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import ProductForm from "./ProductForm.svelte";
  import { CREATE_PRODUCT } from "./mutations.js";
  import ChangeImage from "./ChangeImage.svelte";
  import ProductRoutes from "./routes.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let isLoading = false;

  let product = {
    reference: null,
    wholeSalePricePerUnit: null,
    unit: null,
    quantityPerUnit: null,
    vat: null,
    name: null,
    packagingId: null,
    description: null,
    picture: null,
    tags: [],
    available: true
  };

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(CREATE_PRODUCT, {
      description: product.description,
      name: product.name,
      packagingId: product.packaging ? product.packaging.id : null,
      wholeSalePricePerUnit: product.wholeSalePricePerUnit,
      quantityPerUnit: product.quantityPerUnit,
      unit: product.unit,
      reference: product.reference,
      picture: product.picture ? product.picture : null,
      tags: product.tags.map(i => i.id),
      vat: product.vat,
      available: product.available
    }, errorsHandler.Uuid);

    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

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
    <h1 class="text-2xl mb-0 text-gray-700">Créer un nouveau produit</h1>
  </section>
  <ProductForm
    submit={handleSubmit}
    {product}
    {isLoading} />
</TransitionWrapper>
