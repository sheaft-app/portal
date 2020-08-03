<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Icon from "svelte-awesome";
  import { faMapMarkerAlt, faCircleNotch, faTimesCircle, faChevronUp, faChevronDown, faHeart } from "@fortawesome/free-solid-svg-icons";
  import ProductCartQuantity from "./../../components/controls/ProductCartQuantity.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { GetDistanceInfos } from "./../../helpers/distances.js";
  import { GET_PRODUCT_DETAILS } from "./queries.js";
  import { RATE_PRODUCT } from "./mutations.js";
  import Rating from "./../../components/rating/Rating.svelte";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { cartItems, selectedItem } from "./../../stores/app.js";
  import UnitKind from "./../../enums/UnitKind";
  import TagKind from "./../../enums/TagKind";
  import Roles from "./../../enums/Roles";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  
  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();
  const authInstance = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();

  let product = null;
  let producerDescriptionExpanded = false;
  let rating = null;
  let ratings = [];
  let comment = null;
  let isSubmittingRate = false;
  let isLoading = true;
  let isInCart = false;
  let values = routerInstance.getQueryParams();
  let distanceInfos = null;

  const getProductDetails = async id => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PRODUCT_DETAILS, { id: id }, errorsHandler.Uuid);
    if (!res.success) {
      isLoading = false;
      selectedItem.set(null);
      //TODO
      return;
    }

    product = res.data;
    ratings = product.ratings.nodes.map(r => r);

    distanceInfos = GetDistanceInfos(
      values["latitude"],
      values["longitude"],
      product.producer.address.latitude,
      product.producer.address.longitude
    );

    isLoading = false;
  };

  onMount(async () => {
    document.getElementById("product-details").scrollTop = 0;
    await getProductDetails($selectedItem);
  });

  let username = authInstance.user.profile.given_name
    ? authInstance.user.profile.given_name
    : authInstance.user.profile.name;

  const getUserPicture = picture => {
    if (picture) return picture;
    return "https://sheaftapp.blob.core.windows.net/pictures/users/profile.svg";
  };

  const focus = node => {
    node.focus();
    node.scrollIntoView();
  };

  const handleRatingSubmit = async () => {
    isSubmittingRate = true;
    var res = await graphQLInstance.mutate(RATE_PRODUCT, {
      id: $selectedItem,
      value: rating,
      comment
    }, errorsHandler.Uuid);

    isSubmittingRate = false;

    if (!res.success) {
      //TODO
      return;
    }

    product = res.data;
    ratings = product.ratings.nodes.map(r => r);
    isSubmittingRate = false;
    rating = null;
    comment = null;
  };

  const handleKeyup = ({ key }) => {
    if ($selectedItem && key === "Escape") {
      event.preventDefault();
      selectedItem.set(null);
    }
  };

  const toggleProducerInfo = () => {
    const producerCardOriginalHeight = "190px";
    const producerCard = document.getElementById("producer-card");

    if (producerCard.style.height !== producerCardOriginalHeight) {
      producerDescriptionExpanded = false;
      return (producerCard.style.height = producerCardOriginalHeight);
    }

    const description = document.getElementById("producer-description");

    producerDescriptionExpanded = true;
    return (producerCard.style.height = `calc(${producerCardOriginalHeight} + ${description.offsetHeight}px)`);
  };

  $: isInCart = $cartItems.find(c => c.id === $selectedItem) || false;
</script>

<svelte:window on:keyup={handleKeyup} />

<div
  class="py-3 px-4 sm:px-6 bg-white top-0 left-0 w-full h-12 sticky shadow
  hidden lg:block"
  style="z-index: 2;">
  <button
    on:click={() => selectedItem.set(null)}
    aria-label="Fermer"
    class="font-bold flex items-center">
    <Icon data={faTimesCircle} class="mr-2" />
    <span>Fermer</span>
  </button>
</div>
{#if !product}
  <div class="px-4 sm:px-6">
    <div class="-mx-10">
      <div class="skeleton-box w-full rounded-t-md shadow-md h-40 lg:h-64" />
    </div>
    <div class="text-center m-auto" style="margin-top: 20px;">
      <RatingStars rating={0} />
      <div class="w-64 h-10 skeleton-box mb-2 m-auto" />
      <div class="w-48 h-10 skeleton-box mb-2 m-auto" />
      <div class="w-80 h-24 skeleton-box mb-2 m-auto" />
      <div class="w-48 h-10 skeleton-box m-auto mb-2" />
      <div class="w-full skeleton-box m-auto" style="height: 190px;" />
      <div class="mt-5">
        <div class="w-48 skeleton-box h-10 mb-2" />
        <div class="w-full skeleton-box m-auto" style="height: 190px;" />
      </div>
    </div>
  </div>
{:else}
  <div class="px-4 sm:px-6">
    <div class="-mx-10 relative">
      <div
        style="background-position: center; background-image: url({product.picture ? product.picture : 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=953&q=80'}); background-size: cover;"
        class="w-full rounded-t-md shadow-md h-40 lg:h-64" />
      <!-- <button class="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow absolute cursor-pointer text-accent" style="right: 40px; bottom: -25px;">
          <Icon data={faHeart} scale="1.3" />
        </button> -->
    </div>
    <div class="title-margin lg:text-center" style="margin-bottom: 20px;">
      <RatingStars rating={product.rating || 0} />
      <div class="flex justify-between lg:justify-center">
        <p class="text-xl lg:text-3xl font-semibold">{product.name}</p>
        {#if product.tags && product.tags.length > 0 && product.tags.find(t => t.name.toLowerCase() === 'bio' && t.kind == TagKind.Label.Value)}
          <div class="text-center ml-3">
            <img
              src="./img/labels/bio.jpg"
              alt="Bio"
              class="m-auto mb-1"
              style="max-width: 30px;" />
          </div>
        {/if}
      </div>
      <p class="text-lg lg:text-2xl font-bold">
        {product.onSalePricePerUnit}€
        <span class="font-normal">
          ({`${product.quantityPerUnit}${UnitKind.label(product.unit)}`})
        </span>
      </p>
      <p class="text-base text-gray-600 pb-2 lg:pb-5">
        {product.onSalePrice}€ / {product.unit == UnitKind.KG.Value || product.unit == UnitKind.G.Value ? UnitKind.KG.Label : UnitKind.L.Label}
      </p>
      <p class="text-sm lg:text-base text-justify lg:text-center">
        {product.description}
      </p>
    </div>
    {#if !authInstance.isInRole([Roles.Store.Value, Roles.Producer.Value])}
      <ProductCartQuantity
        productId={$selectedItem}
        plusButtonActive
        userFeedback />
    {/if}
    {#if product.packaging}
      <div class="mt-5">
        <div class="flex justify-center">
          {#if product.packaging && product.packaging.onSalePrice}
            <div class="text-center">
              <img
                src="./img/packaging.svg"
                alt="Consigné"
                class="m-auto mb-1"
                style="width: 30px;" />
              <p class="font-semibold">Consigne</p>
              <p class="text-gray-600">{product.packaging.onSalePrice}€</p>
            </div>
          {/if}

        </div>
      </div>
    {/if}
    <div class="mt-5">
      <div
        id="producer-card"
        class:pb-16={product.producer.description}
        class="bg-white overflow-hidden rounded-lg p-3 lg:p-6 shadow flex
        relative flex-wrap justify-between lg:mt-10"
        style="{product.producer.description ? 'height: 190px;' : ''}
        transition: all .4s ease-in-out;">
        <div
          on:click={() => toggleProducerInfo()}
          class:hidden={!product.producer.description}
          class="absolute bottom-0 rounded-b-lg w-full py-3 -mx-6 bg-white
          text-center font-semibold border-t border-gray-400 border-solid flex
          justify-center items-center cursor-pointer">
          {#if !producerDescriptionExpanded}
            <Icon data={faChevronDown} class="mr-2" />
            <span>Déplier pour en savoir plus</span>
          {:else}
            <Icon data={faChevronUp} class="mr-2" />
            <span>Replier le bandeau</span>
          {/if}
        </div>
        <img
          class="h-10 w-10 md:h-24 md:w-24 rounded-full p-1 md:mx-0 border
          border-gray-800 border-solid"
          src={product.producer.picture ? product.producer.picture : 'img/icons/farmer.svg'}
          alt="Producteur" />
        <div class="w-6/12">
          <p class="text-base lg:text-lg">{product.producer.name}</p>
          <div class="text-gray-600 text-sm lg:text-base">
            {product.producer.address.line1}
          </div>
          {#if product.producer.address.line2}
            <div class="text-gray-600 text-sm lg:text-base">
              {product.producer.address.line2}
            </div>
          {/if}
          <div class="text-gray-600 text-sm lg:text-base">
            {product.producer.address.zipcode} {product.producer.address.city}
          </div>
        </div>
        {#if distanceInfos}
          <div
            class="distance-badge-content text-sm lg:text-base text-{distanceInfos.color}
            w-2/12 text-center rounded-full h-10 flex justify-center
            items-center">
            <Icon data={faMapMarkerAlt} scale="1.4" class="pr-1" />
            <p class="font-bold">{distanceInfos.label}</p>
          </div>
        {/if}
        <div id="producer-description" class="w-12/12 text-gray-600 py-5">
          {product.producer.description ? product.producer.description : ''}
        </div>
      </div>
    </div>
    <div class="mt-5">
      <p class="mb-2">
        {#if product.rating}
          <p class="mb-0 text-xl"><span class="text-primary">★ </span>{product.rating} {product.ratingsCount > 0 ? `(${product.ratingsCount} avis)` : ''}</p>
        {:else}
          <p class="text-2xl font-semibold mb-0">Avis</p>
          Soyez le premier à évaluer ce produit !
        {/if}
      </p>
      {#if !product.currentUserHasRatedProduct && !authInstance.isInRole([Roles.Store.Value, Roles.Producer.Value])}
        {#if authInstance.authenticated}
          <div class="flex items-start py-4">
            <div class="flex-shrink-0">
              <div class="inline-block relative">
                <div
                  class="relative w-10 h-10 lg:w-16 lg:h-16 rounded-full
                  overflow-hidden">
                  <img
                    class="absolute top-0 left-0 w-full h-full bg-cover
                    object-fit object-cover"
                    src={getUserPicture(authInstance.user.profile.picture)}
                    alt={username} />
                  <div
                    class="absolute top-0 left-0 w-full h-full rounded-full
                    shadow-inner" />
                </div>
              </div>
            </div>
            <div class="ml-6 w-full">
              {#if rating === 0}
                <p class="text-sm text-gray-600 mb-2">
                  Notez ce produit sur 5 étoiles
                </p>
              {:else}
                <span
                  class:opacity-0={rating === 0}
                  class="font-light block text-sm text-gray-600">
                  {format(new Date(), 'PP', { locale: fr })}
                </span>
                <p class:opacity-0={rating === 0} class="flex items-baseline">
                  <span class="font-bold">{username}</span>
                </p>
              {/if}
              <Rating
                bind:rate={rating}
                active={rating === 0}
                classes={rating === 0 && '-mx-3'} />
              {#if rating > 0}
                <div class="mt-3" transition:slide>
                  <div class="block form-control mt-1">
                    <textarea
                      use:focus
                      bind:value={comment}
                      placeholder="Commentaire (optionnel)"
                      class="mt-1 block" />
                  </div>
                </div>
                <div class="mt-3 flex justify-end">
                  <button
                    on:click={() => handleRatingSubmit()}
                    aria-label="Envoyer mon avis"
                    class="btn btn-primary btn-lg">
                    {#if isSubmittingRate}
                      <Icon data={faCircleNotch} spin />
                    {:else}Envoyer{/if}
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {:else}
          <p class="text-gray-600 text-sm">
            Connectez-vous pour donner votre avis sur ce produit.
          </p>
        {/if}
      {/if}
      {#each ratings as rating}
        <div class="flex items-start py-4">
          <div class="flex-shrink-0">
            <div class="inline-block relative">
              <div
                class="relative w-10 h-10 lg:w-16 lg:h-16 rounded-full
                overflow-hidden">
                <img
                  class="absolute top-0 left-0 w-full h-full bg-cover object-fit
                  object-cover"
                  src={getUserPicture(rating.user.picture)}
                  alt={rating.user.shortName} />
                <div
                  class="absolute top-0 left-0 w-full h-full rounded-full
                  shadow-inner" />
              </div>
              <!-- <svg class="fill-current text-white bg-green-600 rounded-full p-1 absolute bottom-0 right-0 w-6 h-6 -mx-1 -my-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M19 11a7.5 7.5 0 0 1-3.5 5.94L10 20l-5.5-3.06A7.5 7.5 0 0 1 1 11V3c3.38 0 6.5-1.12 9-3 2.5 1.89 5.62 3 9 3v8zm-9 1.08l2.92 2.04-1.03-3.41 2.84-2.15-3.56-.08L10 5.12 8.83 8.48l-3.56.08L8.1 10.7l-1.03 3.4L10 12.09z"/>
                            </! -->
            </div>
          </div>
          <div class="ml-6">
            <span class="font-light block text-sm text-gray-600">
              {format(new Date(rating.createdOn), 'PP', { locale: fr })}
            </span>
            <p class="flex items-baseline">
              <span class="text-gray-600 font-bold">
                {rating.user.shortName}
              </span>
              <!-- <span class="ml-2 text-green-600 text-xs">Achat vérifié</span> -->
            </p>
            <RatingStars rating={rating.value} color="#009688" />
            <div class="mt-3">
              <!-- <span class="font-bold">Sapien consequat eleifend!</span> -->
              {#if rating.comment}
                <p class="mt-1">{rating.comment}</p>
              {:else}
                <p class="italic text-gray-600">Avis laissé sans commentaire</p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .title-margin {
    margin-top: 20px;
  }
</style>
