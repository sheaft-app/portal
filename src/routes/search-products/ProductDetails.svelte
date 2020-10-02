<script>
  import { slide } from "svelte/transition";
  import Icon from "svelte-awesome";
  import { faMapMarkerAlt, faCircleNotch, faTimesCircle, faChevronUp, faChevronDown, faHeart } from "@fortawesome/free-solid-svg-icons";
  import ProductCartQuantity from "./../../components/controls/ProductCartQuantity.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { GetDistanceInfos } from "./../../helpers/distances.js";
  import { GET_PRODUCT_DETAILS, GET_PRODUCER_DELIVERIES } from "./queries.js";
  import { RATE_PRODUCT } from "./mutations.js";
  import Rating from "./../../components/rating/Rating.svelte";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { cartItems, selectedItem } from "./../../stores/app.js";
  import { timeSpanToFrenchHour } from "./../../helpers/app.js";
  import UnitKind from "./../../enums/UnitKind";
  import TagKind from "./../../enums/TagKind";
  import DayOfWeekKind from "./../../enums/DayOfWeekKind";
  import Roles from "./../../enums/Roles";
  import SheaftErrors from "../../services/SheaftErrors";
  import DeliveryKind from "../../enums/DeliveryKind";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import { groupBy, encodeQuerySearchUrl } from "./../../helpers/app";
  
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
  let deliveries = [];

  const getProductDetails = async id => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PRODUCT_DETAILS, { id: id }, errorsHandler.Uuid);

    if (!res.success) {
      isLoading = false;
      selectedItem.set(null);
      //TODO
      return;
    }

    var deliveriesResult = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, {
      input: {
        ids: [res.data.producer.id],
        kinds: [
          DeliveryKind.Farm.Value,
          DeliveryKind.Market.Value,
          DeliveryKind.Collective.Value
        ] 
      }
    }, errorsHandler.Uuid);

    if (!res.success) {
      isLoading = false;
      selectedItem.set(null);
      //TODO
    }

    deliveries = deliveriesResult.data[0].deliveries.map((d) => {
      return {
        ...d,
        distance: GetDistanceInfos(
          values["latitude"],
          values["longitude"],
          d.address.latitude,
          d.address.longitude
        ),
        deliveryHours: groupBy(d.deliveryHours, item => [item.day]).map((g) => g.filter((delivery, index, self) =>
          index === self.findIndex((d) => (
            d.day === delivery.day && d.from === delivery.from && d.to === delivery.to
          ))
        ))
      }
    });

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

  const openAndLoad = async () => {
    history.pushState({ selected: $selectedItem}, "Explorer");
    const productDetails = document.getElementById("product-details");

    if (productDetails) {
      productDetails.scrollTop = 0;
    }

    await getProductDetails($selectedItem);
  }

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

  $: if ($selectedItem) openAndLoad($selectedItem);
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
{#if !product || isLoading}
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
    <div class="-mx-6 relative" style="background-color: black">
      <!-- si on utilise l'image par défaut -->
      {#if product.picture.includes("pictures/products/categories/")}
        <div class="absolute" style="z-index: 1; left: 50%; top: 40%; margin-left: -105px;">
          <div class="font-semibold text-white text-lg">
            Aucune image disponible
          </div>
        </div>
      {/if}
      <div
        style="background-position: center; background-image: url({product.picture ? product.picture : 'https://sheaftapp.blob.core.windows.net/pictures/products/categories/default.jpg'}); background-size: cover;"
        class:opacity-50={product.picture.includes("pictures/products/categories/")}
        class="w-full shadow-md h-40 lg:h-64" />
      <!-- <button class="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow absolute cursor-pointer text-accent" style="right: 40px; bottom: -25px;">
          <Icon data={faHeart} scale="1.3" />
        </button> -->
    </div>
    <div class="title-margin lg:text-center" style="margin-bottom: 20px;">
      <RatingStars rating={product.rating || 0} />
      <div class="flex justify-between lg:justify-center">
        <p class="text-2xl lg:text-3xl font-semibold">{product.name}</p>
        {#if product.tags && product.tags.length > 0 && product.tags.find(t => t.name.toLowerCase() === 'bio' && t.kind == TagKind.Label.Value)}
          <div class="text-center ml-3">
            <img
              src="./img/labels/bio.png"
              alt="Bio"
              class="m-auto mb-1"
              style="max-width: 30px;" />
          </div>
        {/if}
      </div>
      <p class="text-xl lg:text-2xl font-bold">
        {product.onSalePricePerUnit}€
        <span class="font-normal">
          ({`${product.quantityPerUnit}${UnitKind.label(product.unit)}`})
        </span>
      </p>
      <p class="pt-2 lg:pt-5 text-base text-justify lg:text-center">
        {product.description}
      </p>
    </div>
    {#if product.isReturnable}
      <div class="mb-5 md:mb-0">
        <div class="flex justify-center">
          {#if product.returnable.onSalePrice}
            <div class="text-center">
              <img
                src="./img/returnable.svg"
                alt="Consigné"
                class="m-auto mb-1"
                style="width: 30px;" />
              <p class="font-semibold">Consigne</p>
              <p class="text-gray-600">{product.returnable.onSalePrice}€</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}
    {#if !authInstance.isInRole([Roles.Store.Value, Roles.Producer.Value])}
      <ProductCartQuantity
        productId={$selectedItem}
        plusButtonActive
        userFeedback />
    {/if}
    <div class="mt-5">
      <div
        id="producer-card"
        class="bg-white overflow-hidden rounded-lg p-3 lg:p-6 shadow flex
        relative flex-wrap justify-between lg:mt-10"
        style="transition: all .4s ease-in-out;">
        <img
          class="h-10 w-10 md:h-24 md:w-24 rounded-full p-1 md:mx-0 border
          border-gray-800 border-solid"
          src={product.producer.picture ? product.producer.picture : 'img/icons/farmer.svg'}
          alt="Producteur" />
        <div class="w-7/12 md:w-6/12">
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
            class="distance-badge-content text-sm lg:text-base
            w-2/12 text-center rounded-full h-10 flex justify-center
            items-center border" style="color: {distanceInfos.color}; border-color: {distanceInfos.color};">
            <Icon data={faMapMarkerAlt} scale="1.4" class="pr-1" />
            <p class="font-bold">{distanceInfos.label}</p>
          </div>
        {/if}
        <p class="mt-3 font-semibold pt-5">Lieux et horaires de récupération</p>
        {#each deliveries as delivery}
          <div class="bg-gray-100 rounded-lg p-4 px-5 mt-2 w-full">
            <div class="flex flex-row justify-between items-start mb-3">
              <div class="w-full">
                <p class="font-semibold">{DeliveryKind.label(delivery.kind)}</p>
                <p>{delivery.address.line1}</p>
                {#if product.producer.address.line2}
                  <p>
                    {product.producer.address.line2}
                  </p>
                {/if}
                <p>{delivery.address.zipcode} {delivery.address.city}</p>
                <a 
                  class="mt-1"
                  target="_blank"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(delivery.address)}`}>
                  Voir sur Google Maps
                </a>
              </div>
              <div
                class="text-xs lg:text-base
                flex justify-center items-center" style="color: {delivery.distance.color}; border-color: {delivery.distance.color};">
                <Icon data={faMapMarkerAlt} scale="1.4" class="pr-1" />
                <p class="font-bold">{delivery.distance.label}</p>
              </div>
            </div>
            <div class="mt-2">
              {#each delivery.deliveryHours as deliveryHour, index}
                <div class="flex mb-2 border-gray-300" 
                  class:pb-2={index !== delivery.deliveryHours.length - 1}
                  class:border-b={index !== delivery.deliveryHours.length - 1}>
                  <p style="min-width: 100px;">
                    {DayOfWeekKind.label(deliveryHour[0].day)}
                  </p>
                  <div>
                    {#each deliveryHour as hours} 
                      <p>{`${timeSpanToFrenchHour(hours.from)} à ${timeSpanToFrenchHour(hours.to)}`}</p>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
        <div
          on:click={() => producerDescriptionExpanded = !producerDescriptionExpanded}
          class:hidden={!product.producer.description}
          class="rounded-b-lg w-full py-3 bg-white
          text-center font-semibold flex
          justify-center items-center cursor-pointer mt-2">
          {#if !producerDescriptionExpanded}
            <Icon data={faChevronDown} class="mr-2" />
            <span>En savoir plus sur le producteur</span>
          {:else}
            <Icon data={faChevronUp} class="mr-2" />
            <span>Replier le bandeau</span>
          {/if}
        </div>
        {#if producerDescriptionExpanded && product.producer.description}
          <div transition:slide id="producer-description" class="w-12/12 text-gray-600 py-5" >
            {product.producer.description}
          </div>
        {/if}
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
                  alt={rating.user.name} />
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
                {rating.user.name}
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
