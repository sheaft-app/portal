<script>
  import Loader from "./../../components/Loader.svelte";
  import ChangeImage from "./ChangeImage.svelte";
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import ProductForm from "./ProductForm.svelte";
  import { GET_PRODUCT_DETAILS } from "./queries.js";
  import { UPDATE_PRODUCT } from "./mutations.js";
  import ProductRoutes from "./routes.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  export let params = {};

  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const errorsHandler = new SheaftErrors();

  let product = null;
  let isLoading = false;

  onMount(async () => {
    await getProduct();
  });

  const getProduct = async () => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PRODUCT_DETAILS, {
      id: params.id
    }, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      //TODO
      routerInstance.goTo(ProductRoutes.List);
      return;
    }

    product = res.data;
  };

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(UPDATE_PRODUCT, {
      id: product.id,
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
  <title>Éditer un produit</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !product}
    <Loader />
  {:else}
    <section class="mb-4 pb-4 border-b border-gray-400 border-solid">
      <div class="mb-3">
        <button
          class="text-gray-600 items-center flex uppercase"
          on:click={() => routerInstance.goBack()}>
          <Icon data={faChevronLeft} scale=".9" class="mr-2 inline" />
          Produits
        </button>
      </div>
      <div class="flex">
        <h1 class="text-2xl mb-0">{product.name}</h1>
        {#if !product.available}
          <div
            class="rounded-full bg-orange-300 ml-2 px-3 py-1 shadow uppercase
            font-semibold text-xs text-white mt-1 h-6">
            Désactivé
          </div>
        {/if}
      </div>
      <h3 class="text-gray-600">#{product.reference}</h3>
      <div class="text-sm leading-5 text-gray-600">
        <RatingStars rating={product.rating} />
        {#if product.ratingsCount > 0}
          <a href="javascript:void(0)" on:click={() => routerInstance.goTo(ProductRoutes.Ratings, {id: product.id})}>
            Voir les {product.ratingsCount} avis
          </a>
        {/if}
      </div>
    </section>
    <ProductForm
      submit={handleSubmit}
      {product}
      {isLoading} />
  {/if}
</TransitionWrapper>
