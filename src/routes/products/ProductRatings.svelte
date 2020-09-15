<script>
  import Loader from "./../../components/Loader.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import { GET_PRODUCT_RATINGS } from "./queries.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  export let params = {};

  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const errorsHandler = new SheaftErrors();

  let isLoading = false;
  let product = null;

  const getProduct = async id => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PRODUCT_RATINGS, { id }, errorsHandler.Uuid);
    isLoading = false;

    if(!res.success){
      //TODO
      routerInstance.goBack();
      return;
    }

    product = {
      ...res.data,
      ratings: res.data.ratings.nodes
    };
  };

  onMount(async () => {
    await getProduct(params.id);
  });

</script>

<svelte:head>
  <title>Avis du produit</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !product}
    <Loader />
  {:else}
      <section class="mb-4 pb-4 border-b border-gray-400 border-solid">
        <div class="mb-3">
          <button class="btn-link items-center flex uppercase" on:click={() => routerInstance.goBack()}>
            <Icon data={faChevronLeft} scale=".9" class="mr-2 inline" />
            Détails
          </button>
        </div>
        <h1 class="text-2xl mb-0">
          Avis pour {product.name}
        </h1>
        <div class="mb-2">
          <span class="font-semibold">{product.rating} &bull</span>
          <RatingStars rating={product.rating} />
          <p class="text-gray-700">{product.ratingsCount} avis</p>
        </div>
        <hr />
        {#each product.ratings as rating}
          <div class="flex items-start py-4">
            <div class="flex-shrink-0">
              <div class="inline-block relative">
                <div class="relative w-16 h-16 rounded-full overflow-hidden">
                  <img
                    class="absolute top-0 left-0 w-full h-full bg-cover
                    object-fit object-cover"
                    src={rating.user.picture}
                    alt={rating.user.name} />
                  <div
                    class="absolute top-0 left-0 w-full h-full rounded-full
                    shadow-inner" />
                </div>
              </div>
            </div>
            <div class="ml-6">
              <span class="font-light block text-sm text-gray-500">
                {format(new Date(rating.createdOn), 'PP', { locale: fr })}
              </span>
              <p class="flex items-baseline">
                <span class="text-gray-600 font-bold">
                  {rating.user.name}
                </span>
                <!-- <span class="ml-2 text-green-600 text-xs">Achat vérifié</span> -->
              </p>
              <RatingStars rating={rating.value} />
              <div class="mt-3">
                {#if rating.comment}
                  <p class="mt-1">{rating.comment}</p>
                {:else}
                  <p class="italic text-gray-500">
                    Avis laissé sans commentaire
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </section>
  {/if}
</TransitionWrapper>
