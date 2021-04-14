<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Icon from "svelte-awesome";
  import { faCircleNotch, faChevronUp, faChevronDown, faChevronLeft, faEye } from "@fortawesome/free-solid-svg-icons";
  import AddToCart from "./../../components/controls/AddToCart.svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import { format } from "date-fns";
  import fr from "date-fns/locale/fr";
	import SearchProductsRoutes from "../search-products/routes";
	import ExternalRoutes from "../external/routes";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { GET_PRODUCT_DETAILS, GET_PRODUCER_DELIVERIES } from "./queries.js";
  import { RATE_PRODUCT } from "./mutations.js";
  import Rating from "./../../components/rating/Rating.svelte";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { timeSpanToFrenchHour, formatMoney } from "./../../helpers/app.js";
  import TagKind from "./../../enums/TagKind";
  import DayOfWeekKind from "./../../enums/DayOfWeekKind";
  import ConditioningKind from "./../../enums/ConditioningKind";
  import Roles from "./../../enums/Roles";
  import SheaftErrors from "../../services/SheaftErrors";
  import DeliveryKind from "../../enums/DeliveryKind";
  import { groupBy, encodeQuerySearchUrl, formatConditioningDisplay } from "./../../helpers/app";
  import { config } from "../../configs/config";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import Cart from "../search-products/Cart.svelte";
  import ProducerOtherProducts from "../../components/ProducerOtherProducts.svelte";

  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();
  const authInstance = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();

  export let params = {};

  let product = null;
  let producerDescriptionExpanded = false;
  let rating = null;
  let ratings = [];
  let comment = null;
  let isSubmittingRate = false;
  let isLoading = true;
  let deliveries = [];
  let map = null;
  let deliveriesMarkers = [];

  onMount(async () => {
    await getProductDetails(params.id);

    map = L.map("map").setView([45.77166358, 2.9666628], 4);

    L.tileLayer(
      "https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=xdycAkqlmra0OjZw2dPy",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1
      }
    ).addTo(map);

    const renderMarker = () => {
      return L.divIcon({
        className: "custom-marker",
        html: `<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="-46 0 512 512" width="25px" class="hovered-paths"><g><path d="m177.128906 232.5h64.609375l25.210938-55h-101.953125zm0 0" data-original="#000000" class="hovered-path active-path" data-old_color="#000000" fill="#205164"/><path d="m210 0c-115.792969 0-210 94.207031-210 210 0 93.359375 61.519531 175.210938 150.441406 201.429688l46.140625 92.277343c2.539063 5.082031 7.734375 8.292969 13.417969 8.292969 5.679688 0 10.875-3.210938 13.414062-8.292969l46.140626-92.277343c88.925781-26.214844 150.445312-108.070313 150.445312-201.429688 0-115.792969-94.207031-210-210-210zm-39.671875 304.5c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm75 0c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm58.636719-135.75-38.96875 85c-2.441406 5.332031-7.769532 8.75-13.632813 8.75h-86.289062c-7.039063 0-13.132813-4.894531-14.648438-11.769531l-23.867187-108.230469h-8.835938c-8.285156 0-15-6.714844-15-15s6.714844-15 15-15h20.886719c7.042969 0 13.132813 4.894531 14.648437 11.769531l5.125 23.230469h131.945313c5.109375 0 9.867187 2.601562 12.625 6.898438 2.761719 4.300781 3.140625 9.707031 1.011719 14.351562zm0 0" data-original="#000000" class="hovered-path active-path" data-old_color="#000000" fill="#205164"/></g> </svg>`
      });
    };

    const coordonnates = deliveries.map((delivery, i) =>
      L.marker([delivery.address.latitude, delivery.address.longitude], {
        icon: renderMarker()
      }).bindPopup(`<p style="margin: 0"><b>${DeliveryKind.label(delivery.kind)}</b></p><p style="margin: 0">${delivery.address.line1}</p><p style="margin: 0">${delivery.address.zipcode} ${delivery.address.city}</p>`)
    );

    deliveriesMarkers = L.featureGroup(coordonnates);

    deliveriesMarkers.addTo(map);
    if (coordonnates.length > 0) {
      map.fitBounds(deliveriesMarkers.getBounds(), { maxZoom: 10});
    }
  })

  const getProductDetails = async id => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PRODUCT_DETAILS, { id: id }, errorsHandler.Uuid);
    if (!res.success) {
      isLoading = false;
      //TODO
      return;
    }

		product = res.data;

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

    if (deliveriesResult.data.length == 0) {
      deliveries = [];
    } else {
      deliveries = deliveriesResult.data[0].deliveries.map((d) => {
        return {
          ...d,
          deliveryHours: groupBy(d.deliveryHours, item => [item.day]).map((g) => g.filter((delivery, index, self) =>
            index === self.findIndex((d) => (
              d.day === delivery.day && d.from === delivery.from && d.to === delivery.to
            ))
          ))
        }
      });
    }

    ratings = product.ratings.nodes.map(r => r);
    isLoading = false;
  };

  let username = authInstance.user.profile.given_name
    ? authInstance.user.profile.given_name
    : authInstance.user.profile.name;

  const getUserPicture = picture => {
    if (picture) return picture;
    return config.content + '/pictures/users/profile.svg';
  };

  const focus = node => {
    node.focus();
    node.scrollIntoView();
  };

  const handleRatingSubmit = async () => {
    isSubmittingRate = true;
    var res = await graphQLInstance.mutate(RATE_PRODUCT, {
      id: params.id,
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
</script>

<svelte:head>
	<title>{product ? product.name : 'Produit'}</title>
</svelte:head>

<TransitionWrapper hasRightPanel style="margin: 0">
  <div class="details-container">
    {#if !authInstance.isInRole([Roles.Producer.Value])}
      <button
        class="text-gray-600 items-center flex uppercase mb-2"
        on:click={() => routerInstance.goTo(SearchProductsRoutes.Search)}>
        <Icon data={faChevronLeft} scale=".8" class="mr-2 inline" />
        Retourner à la recherche
      </button>
    {:else}
	    <div class="mb-3 p-4 text-white bg-blue-500 rounded">
        <p>Vous pouvez partager ce lien sur votre site ou sur vos réseaux pour avoir une référence directe vers ce produit.</p>
        <p>Le bouton "Ajouter au panier" se dégrisera automatiquement pour les consommateurs.</p>
      </div>
    {/if}
    {#if !product || isLoading}
      <div>
        <div class="flex flex-wrap lg:justify-between flex-col-reverse lg:flex-row">
          <div class="lg:w-1/2 lg:pr-3 mt-2 lg:mt-0">
            <RatingStars rating={0} />
            <div class="w-64 h-10 skeleton-box mb-2" />
            <div class="w-48 h-10 skeleton-box mb-2" />
            <div class="w-80 h-24 skeleton-box mb-2" />
            <div class="w-48 h-10 skeleton-box mb-2" />
          </div>
          <div class="skeleton-box w-full lg:w-1/2 rounded-t-md shadow-md h-40 lg:h-64" />
        </div>
        <div style="margin-top: 20px;">
          <div class="mt-5">
            <div class="w-48 skeleton-box h-10 mb-2" />
            <div class="w-full skeleton-box" style="height: 190px;" />
          </div>
        </div>
      </div>
    {:else}
      <div class="flex flex-wrap lg:justify-between flex-col-reverse lg:flex-row">
        <div class="lg:w-1/2 lg:pr-3">
          <div class="mt-2 lg:mt-0" style="margin-bottom: 20px;">
            <RatingStars rating={product.rating || 0} />
            <div class="flex justify-between">
              <p class="text-2xl lg:text-3xl font-semibold text-red-50à">{product.name}</p>
              {#if product.tags && product.tags.length > 0 && product.tags.find(t => t.name.toLowerCase() === 'bio' && t.kind == TagKind.Label.Value)}
                <div class="text-center ml-3">
                  <img
                    src="{config.content + '/pictures/tags/icons/bio.png'}"
                    alt="Bio"
                    class="m-auto mb-1"
                    style="max-width: 30px;" />
                </div>
              {/if}
            </div>
            <p class="text-xl lg:text-2xl font-bold">
              {formatMoney(product.onSalePricePerUnit)}
              <span class="font-normal">
                {formatConditioningDisplay(product.conditioning, product.quantityPerUnit, product.unit)}
              </span>
            </p>
            {#if product.conditioning == ConditioningKind.Bulk.Value && product.onSalePrice}
              <p>(prix au {product.unit == "G" || product.unit == "KG" ? "kilo" : "litre"} : {formatMoney(product.onSalePrice)})</p>
            {/if}
            {#if product.description}
              <div class="pt-2 lg:pt-5 text-base text-justify">
                {#each product.description.match(/[^\n]+/gm) as line}
                  <p>{line}</p>
                {/each}
              </div>
            {/if}
          </div>
          {#if product.returnable}
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
                    <p class="text-gray-600">{formatMoney(product.returnable.onSalePrice)}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
          {#if product.available}
              <AddToCart {product} disabled={authInstance.isInRole([Roles.Store.Value, Roles.Producer.Value])} />
            {:else}
              <div class="text-red-500">Ce produit n'est pas disponible pour le moment.</div>
            {/if}
        </div>
        <div class="relative lg:w-1/2">
          <!-- si on utilise l'image par défaut -->
          {#if product.picture.includes("pictures/tags/images/")}
            <div class="absolute" style="z-index: 1; left: 50%; top: 40%; margin-left: -105px;">
              <div class="font-semibold text-white text-lg">
                Aucune image disponible
              </div>
            </div>
          {/if}
          <div
            style="background-position: center; background-image: url({product.picture ? product.picture : config.content + '/pictures/tags/images/default.jpg'}); background-size: cover;"
            class:opacity-50={product.picture.includes("pictures/tags/images/")}
            class="w-full shadow-md h-40 lg:h-64" />
          <!-- <button class="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow absolute cursor-pointer text-accent" style="right: 40px; bottom: -25px;">
              <Icon data={faHeart} scale="1.3" />
            </button> -->
        </div>
      </div>
      <ProducerOtherProducts productParentId={product.id} producerName={product.producer.name} producerId={product.producer.id} {errorsHandler} />
      <div class="flex flex-wrap justify-between mt-5">
        <div class="lg:w-2/3 w-full">
          <div
            id="producer-card"
            class="bg-white overflow-hidden rounded-l p-3 lg:p-6 shadow
            relative"
            style="transition: all .4s ease-in-out;">
            <div class="flex flex-wrap">
              <img
                class="h-10 w-10 md:h-24 md:w-24 rounded-full p-1 md:mx-0 border
                border-gray-800 border-solid"
                src={product.producer.picture ? product.producer.picture : 'img/icons/farmer.svg'}
                alt="Producteur" />
              <div class="w-8/12 lg:pl-5 pl-3">
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
                <button type="button" on:click={() => routerInstance.goTo(ExternalRoutes.ProducerDetails, { id: product.producer.id })} class="btn btn-link mt-1 items-center">
                  <Icon data={faEye} class="mr-1" />
                  Voir sa page
                </button>
              </div>
            </div>
            <p class="mt-3 font-semibold pt-5">Lieux et horaires de récupération</p>
            {#each deliveries as delivery}
              <div class="bg-gray-100 rounded-lg p-4 px-5 mt-2 w-full">
                <div class="flex flex-row justify-between items-start mb-3">
                  <div>
                    <p class="font-semibold">{DeliveryKind.label(delivery.kind)}</p>
                    <p>{delivery.address.line1}</p>
                    {#if delivery.address.line2}
                      <p>
                        {delivery.address.line2}
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
            {:else}
              <p class="text-gray-600">Il semblerait que ce producteur n'ait aucun point de récupération.</p>
            {/each}
            <div
              on:click={() => producerDescriptionExpanded = !producerDescriptionExpanded}
              class:hidden={!product.producer.summary}
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
            {#if producerDescriptionExpanded && product.producer.summary}
              <div transition:slide id="producer-description" class="w-12/12 text-gray-600 py-5" >
                {product.producer.summary}
              </div>
            {/if}
          </div>
        </div>
        <div class="lg:w-1/3 w-full">
          <div id="map" class="rounded-r shadow lg:h-full" style="z-index: 0;" />
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
                      disabled={isSubmittingRate}
                      class:disabled={isSubmittingRate}
                      aria-label="Envoyer mon avis"
                      class="btn btn-primary btn-lg">
                      Envoyer
                      {#if isSubmittingRate}
                        <Icon data={faCircleNotch} spin class="ml-2" />
                      {/if}
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
        {#each ratings as rating, index}
          <div class="flex items-start py-4 border-gray-400" class:border-b={index !== ratings.length - 1}>
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
              {#if rating.comment}
                <p class="mt-3">{rating.comment}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <div
    class="fixed overflow-hidden shadow right-0 top-0 bg-gray-100 h-screen w-3/12
      transition duration-300 ease-in-out cart-panel">
      <Cart />
  </div>
</TransitionWrapper>

<style lang="scss">
  $cart-panel-size: 350px;

	.cart-panel {
		top: 64px;
		z-index: 3;
		width: $cart-panel-size;

		.bottom-items {
			width: $cart-panel-size;
		}
	}

	@media (max-width: 1024px) {
		.cart-panel {
			top: 45px;
			transform: translateY(100%);

			&.active {
				width: 100%;
				transform: translateY(0px);

				.bottom-items {
					width: 100%;
				}
			}
		}
	}

	.has-bottom-mobile-cta {
		@media (max-width: 767px) {
			margin-bottom: 65px;
		}
	}

	.bottom-mobile-cta {
		@media (min-width: 1025px) {
			display: none;
		}

		transform: translateY(64px);
		z-index: 11;

		&.active {
			transform: translateY(0px);
		}
	}
</style>
