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
  import { GET_PRODUCT_DETAILS, GET_PRODUCTS } from "./queries.js";
  import { UPDATE_PRODUCT } from "./mutations.js";
  import ProductRoutes from "./routes.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
  import DeleteProducts from "./DeleteProducts.svelte";
  import SetProductsAvailability from "./SetProductsAvailability.svelte";

  export let params = {};

  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const errorsHandler = new SheaftErrors();
  const notificationsInstance = new GetNotificationsInstance();
  
  let product = null;
  let isLoading = false;

  onMount(async () => {
    await getProduct();
  });
  
	const showDeleteModal = () => {
		open(DeleteProducts, {
			selectedItems: [product],
			onClose: async (res) => {
				if (res.success) {
          graphQLInstance.clearApolloCache(GET_PRODUCTS);
					routerInstance.goTo(ProductRoutes.List);
				}
			},
		});
  };
  
  const showSetAvailabilityModal = (status) => {
		open(SetProductsAvailability, {
			selectedItems: [product],
			status: !product.available,
			onClose: async (res) => {
				if (res.success) {
          graphQLInstance.clearApolloCache(GET_PRODUCT_DETAILS);
					routerInstance.goTo(ProductRoutes.List);
				}
			},
		});
  };
  
  const getProduct = async () => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PRODUCT_DETAILS, {
      id: params.id
    }, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      notificationsInstance.warning("Le produit est introuvable");
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
      returnableId: product.returnable ? product.returnable.id : null,
      wholeSalePricePerUnit: product.wholeSalePricePerUnit,
      quantityPerUnit: product.quantityPerUnit,
      unit: product.unit,
      conditioning: product.conditioning,
      reference: product.reference,
      picture: product.picture ? product.picture : null,
      tags: product.tags.map(i => i.id),
      vat: product.vat,
      available: product.available,
      visibleToStores: product.visibleToStores,
      visibleToConsumers: product.visibleToConsumers
    }, errorsHandler.Uuid, GET_PRODUCTS);
    isLoading = false;

    if (!res.success) {
      //TODO
        return;
    }

    notificationsInstance.success(
      "Vos modifications ont bien été appliquées."
    );

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
          class={`btn btn-lg bg-white border mr-2 hover:text-white ${product.available ? 'text-orange-500 border-orange-500 hover:bg-orange-500' : 'text-green-500 border-green-500 hover:bg-green-500'}`}
          on:click={showSetAvailabilityModal}>
          {product.available ? 'Désactiver' : 'Activer'}
        </button>
        <button
          class="btn btn-lg bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
          on:click={showDeleteModal}>
          Supprimer
        </button>
      </div>
    </section>
    <ProductForm
      submit={handleSubmit}
      {product}
      {isLoading} />
  {/if}
</TransitionWrapper>
