<script>
  import Loader from "./../../components/Loader.svelte";
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import ProductForm from "./ProductForm.svelte";
  import { GET_PRODUCT_DETAILS, GET_PRODUCTS } from "./queries.js";
  import { UPDATE_PRODUCT } from "./mutations.js";
  import ProductRoutes from "./routes.js";
  import ExternalRoutes from "./../external/routes.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import DeleteProducts from "./DeleteProducts.svelte";
  import { normalizeUpdateProduct } from "./productForm";

  export let params = {};

  const { open } = getContext("modal");
  const { query, mutate } = getContext("api");
  const routerInstance = GetRouterInstance();
  const errorsHandler = new SheaftErrors();

  let product = null;

  onMount(async () => {
    product = await query({
      query: GET_PRODUCT_DETAILS,
      variables: { id: params.id }, 
      errorsHandler,
      error: () => routerInstance.goTo(ProductRoutes.List),
			errorNotification: "Le produit auquel vous essayez d'accéder n'existe plus."
    });
  });

  const handleSubmit = async () => {
    return mutate({
			mutation: UPDATE_PRODUCT,
			variables: normalizeUpdateProduct(product),
			errorsHandler,
			success: () => routerInstance.goTo(ProductRoutes.List),
			successNotification: "Le produit a bien été modifié",
			errorNotification: "Impossible de mettre à jour les informations de ce produit",
			clearCache: [GET_PRODUCTS]
    });
  };

	const showDeleteModal = () => {
		open(DeleteProducts, {
			selectedItems: [product],
			onClose: () => {
				routerInstance.goTo(ProductRoutes.List);
			},
		});
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
          on:click={() => routerInstance.goTo(ProductRoutes.List)}>
          <Icon data={faChevronLeft} scale=".9" class="mr-2 inline" />
          Produits
        </button>
      </div>
      <div class="flex justify-between items-center">
        <div>
          <h1 class="font-semibold uppercase mb-0">{product.name}</h1>
          <span>
          <RatingStars rating={product.rating} />
          {#if product.ratingsCount > 0}
            <a href="javascript:void(0)" on:click={() => routerInstance.goTo(ProductRoutes.Ratings, {id: product.id})}>
              Voir les {product.ratingsCount} avis
            </a>
          {/if}
          </span>
          {#if !product.available}
            <span
              class="rounded-full bg-orange-500 ml-2 mr-2 px-3 py-1 shadow uppercase
              font-semibold text-xs text-white my-2 h-6">
              Indisponible
            </span>
          {/if}
          {#if !product.visibleToConsumers}
            <span
              class="rounded-full bg-orange-500 px-3 py-1 shadow uppercase
              font-semibold text-xs text-white my-2 h-6">
              Masqué aux consommateurs
            </span>
          {/if}
          {#if !product.visibleToStores}
            <span
              class="rounded-full bg-orange-500 px-3 py-1 shadow uppercase
              font-semibold text-xs text-white my-2 h-6">
              Masqué aux magasins
            </span>
          {/if}
        </div>
      </div>
      <div class="flex mt-2">
        <button
          class="btn btn-lg bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
          on:click={showDeleteModal}>
          Supprimer
        </button>
        <button
          class="btn btn-lg bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white ml-2"
          on:click={() => routerInstance.goTo(ExternalRoutes.ProductDetails, {
            id: params.id
          })}>
          Voir dans votre boutique
        </button>
      </div>
    </section>
    <ProductForm
      submit={handleSubmit}
      bind:product
      {errorsHandler} />
  {/if}
</TransitionWrapper>
