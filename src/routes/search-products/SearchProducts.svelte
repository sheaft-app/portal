<script>
  import { querystring } from "svelte-spa-router";
  import { onMount, onDestroy, getContext } from "svelte";
  import { fly } from "svelte/transition";
  import { SEARCH_PRODUCTS } from "./queries.js";
  import { isLoading, isFetchingMore, filters } from "./store";
  import ProductMap from "./../../components/ProductMap.svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import {
    cartItems,
    cartExpanded,
    selectedItem,
    searchResults
  } from "./../../stores/app.js";
  import Cart from "./Cart.svelte";
  import ProductCard from "./ProductCard.svelte";
  import CitySearch from "./../../components/search/CitySearch.svelte";
  import SearchInput from "./../../components/controls/SearchInput.svelte";
  import FiltersModal from "./FiltersModal.svelte";
  import ProductDetails from "./ProductDetails.svelte";
  import GetAuthInstance from "../../services/SheaftAuth.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL.js";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import Icon from "svelte-awesome";
  import { faFilter } from "@fortawesome/free-solid-svg-icons";
  import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
  import { roundMoney, freezeBody, unfreezeBody } from "./../../helpers/app.js";
  import Loader from "./../../components/Loader.svelte";
  import SkeletonCard from "./SkeletonCard.svelte";
  import Roles from "./../../enums/Roles";
  import CartRoutes from "../cart/routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  
  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const authManager = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let hoveredProduct = null;
  let errors = [];
  let prevFeed = [];
  let currentPage = 0;
  let lastFetchLength = 0;
  let totalProducts = 0;
  const QUERY_SIZE = 10;

  let defaultSearchValues = {
    text: null,
    tags: [],
    sort: "producer_geolocation asc",
    latitude: null,
    longitude: null,
    maxDistance: null
  };

  const observer = new IntersectionObserver(async entries => {
    if (!$isLoading && lastFetchLength >= QUERY_SIZE && !$isFetchingMore && entries[0].isIntersecting) {
      isFetchingMore.set(true);
      await searchProducts(currentPage);
      isFetchingMore.set(false);
    }
  });

  const fetchMoreOnIntersect = (node, params) => {
    observer.observe(node);
    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  };

  const showFiltersModal = () => {
    open(FiltersModal, { filters, visibleNav: true });
  };

  const renderSort = sort => {
    switch (sort) {
      case "producer_geolocation asc":
        return "le plus proche";
      case "product_onSalePricePerUnit asc":
        return "prix croissant";
      case "product_onSalePricePerUnit desc":
        return "prix décroissant";
      default:
        return "indéfini";
    }
  };

  const createVariables = page => {
    let values = routerInstance.getQueryParams();
    let tags = [];

    if (Object.keys(values).length == 0) {
      values = defaultSearchValues;
    }

    if (!values["sort"]) {
      values["sort"] = defaultSearchValues.sort;
    }

    var newPosition = retrieveUserLocationInQueryString();
    if (newPosition) {
      values["latitude"] = newPosition.latitude;
      values["longitude"] = newPosition.longitude;
    } else {
      newPosition = retrieveUserLocationInStorage();
      if (newPosition) {
        updateUserLocationInQueryString(newPosition);
        return null;
      }      
    }

    if (values["maxDistance"]) {
      values["maxDistance"] = parseInt(values["maxDistance"]);
    }

    if (values["category"]) {
      values["category"] = values["category"];
      tags = [...tags, values["category"]];
    }

    if (values["labels"]) {
      values["labels"] = values["labels"].split(",");
      tags = [...tags, ...values["labels"]];
    }

    filters.set({
      ...values,
      tags
    });

    return {
      input: {
        text: $filters.text,
        tags: $filters.tags,
        sort: $filters.sort,
        latitude: $filters.latitude,
        longitude: $filters.longitude,
        maxDistance: $filters.maxDistance,
        page: page,
        take: QUERY_SIZE
      }
    };
  };

  const refetch = async () => {
    isLoading.set(true);
    await searchProducts(0);
    isLoading.set(false);
  };

  const searchProducts = async page => {
    currentPage = ++page;
    var variables = createVariables(currentPage);
    if (!variables) return;

    var response = await graphQLInstance.query(SEARCH_PRODUCTS, variables, errorsHandler.Uuid);

    if (!response.success) {
      //TODO
      return;
    }

    // on reset le feed pour les nouvelles query
    if (page === 1) {
      prevFeed = [];
    }

    totalProducts = response.data.count;
    prevFeed = [...prevFeed, ...response.data.products];
    lastFetchLength = response.data.products.length;

    searchResults.set(prevFeed);
  };

  const expendCart = () => {
    if ($cartExpanded) {
      return hideCart();
    }

    cartExpanded.set(!$cartExpanded);
    freezeBody();
  }

  const hideCart = () => {
    unfreezeBody();
    cartExpanded.set(false);
  }

  const retrieveUserLocationInStorage = () => {
    var position = localStorage.getItem("user_location");
    if (position) {
      var parsed = JSON.parse(position);
      if (parsed.hasOwnProperty("latitude")) return parsed;

      return null;
    }

    return null;
  };

  const retrieveUserLocationInQueryString = () => {
    let values = routerInstance.getQueryParams();
    if (!values["latitude"] || !values["longitude"]) return null;

    return {
      latitude: parseFloat(values["latitude"]),
      longitude: parseFloat(values["longitude"])
    };
  };

  const updateUserLocation = position => {
    updateUserLocationInStorage(position);
    return updateUserLocationInQueryString(position);
  };

  const updateUserLocationInQueryString = position => {
    if (!position) return false;

    routerInstance.replaceQueryParams(position);
    return true;
  };

  const updateUserLocationInStorage = position => {
    if (!position) return false;

    localStorage.setItem("user_location", JSON.stringify(position));
    return true;
  };

  const handleLocation = location => {
    if (!location) return;
    updateUserLocation({
      latitude: location.latitude,
      longitude: location.longitude
    });
  };

  let initLocation = null;
  let selectedLocation = null;
  $: refetch($querystring);
  $: handleLocation(selectedLocation);

  var popStateListener = (event) => {
    if ($selectedItem) {
      return selectedItem.set(null);
    }
  }

  onMount(() => {
    var newPosition = retrieveUserLocationInQueryString();
    if (newPosition) {
      updateUserLocationInStorage(newPosition);
      initLocation = newPosition;
    } else {
      var localPosition = retrieveUserLocationInStorage();
      if (localPosition) {
        updateUserLocationInQueryString(localPosition);
        initLocation = localPosition;
      }
    }

    window.addEventListener("popstate", popStateListener, false);

    totalProducts = 0;
    searchResults.set([]);
  });

  onDestroy(() => {
    window.removeEventListener("popstate", popStateListener, false);
  })

  $: productsCount = $cartItems.reduce((sum, product) => {
    return sum + (product.quantity || 0);
  }, 0);
  $: total = $cartItems.reduce((sum, product) => {
    return roundMoney(sum + product.onSalePricePerUnit * product.quantity || 0);
  }, 0);
</script>

<svelte:head>
  <title>Explorer</title>
</svelte:head>

<div
  class:active={productsCount > 0}
  class="fixed bottom-0 py-2 px-4 md:px-8 border-t border-gray-400 border-solid
  bg-white w-full left-0 block xl:hidden bottom-mobile-cta transition
  duration-500 ease-in-out">
  <div class="flex justify-between items-center">
    <div class="text-lg uppercase">
      <p class="text-sm text-gray-600">{productsCount} articles</p>
      <p class="truncate">
        Total:
        <span class="font-bold">{total}€</span>
      </p>
    </div>
    <div class="inline-flex items-center w-2/4 justify-end">
      <button
        type="button"
        on:click={() => expendCart()}
        class="text-xs bg-white shadow font-semibold uppercase h-10 rounded-full
        px-4 py-2 leading-none mr-2 w-3/4"
        class:invisible={$selectedItem}
        disabled={$cartItems.length === 0}
        class:disabled={$cartItems.length === 0}>
        {$cartExpanded ? 'Fermer' : 'Aperçu'}
      </button>
      <button
        on:click={() => {
          hideCart();
          routerInstance.goTo(CartRoutes.Resume);
        }}
        type="button"
        class="bg-accent shadow text-white font-semibold uppercase h-10
        rounded-full leading-none flex items-center justify-center"
        style="width: 4em;">
        <Icon data={faShoppingCart} />
      </button>
    </div>
  </div>
</div>

<TransitionWrapper hasRightPanel style="margin:0;">
  <ErrorCard {errorsHandler} bind:componentErrors={errors} />
  {#if errors.length < 1}
    <div
      class:has-bottom-mobile-cta={$cartItems.length >= 1}
      class="search-products md:-my-4">
      <div
        class="filters -mx-4 md:-mx-6 lg:my-0 lg:mx-0 mb-3">
        <CitySearch
          withGeolocationButton={true}
          initAddress={initLocation}
          bind:selectedAddress={selectedLocation}
          containerStyles="background-color: #ffffff; border: none; border-radius:
          0px; color: #205164; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-bottom: 10px;" />
      </div>
      {#if authManager.isInRole([Roles.Store.Value, Roles.Producer.Value])}
        <div
          class="py-5 px-5 md:px-4 overflow-x-auto -mx-5 md:mx-0 bg-orange-200
          shadow rounded mb-5 lg:mt-3">
          <div class="flex">
            <div>
              <p class="uppercase font-bold leading-none">Module consommateur</p>
              <div class="mt-2 text-sm">
                <p>
                  Cette page est réservée aux consommateurs. Vous ne pouvez
                  l'utiliser qu'à des fins de consultation.
                </p>
                <div class="mt-1 flex flex-wrap">
                  {#if authManager.isInRole([Roles.Store.Value])}
                    <button class="btn btn-accent btn-lg">
                      Passer une commande
                    </button>
                  {/if}
                  <button
                    class="ml-0 mt-2 md:mt-0 md:ml-2 btn bg-white btn-lg shadow">
                    Changer de compte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      {#if $filters.latitude && $filters.longitude}
        <div
          class="inline-flex items-center mb-3 themed text-center sticky py-1
          lg:py-2 -mx-4 px-4 filter-bar"
          style="background-color: #fbfbfb; z-index: 2; width: -moz-available;
          width: -webkit-fill-available; width: fill-available;">
          {#if $isLoading}
            <div class="mb-1 h-6 w-16 md:w-24 skeleton-box" />        
          {:else}
            <p class="text-xs lg:text-xl pr-2 border-r border-gray-400">
              {totalProducts} résultat{totalProducts > 1 ? 's' : ''}
            </p>
          {/if}
          <SearchInput containerClasses="ml-2" />
          <button
            class="filter-btn bg-white py-2 px-3 rounded text-sm shadow-md flex
            flex-nowrap items-center ml-2"
            class:text-white={$filters.tags && $filters.tags.length > 0}
            class:bg-accent={$filters.tags && $filters.tags.length > 0}
            on:click={showFiltersModal}>
            <Icon
              class="m-auto {$filters.tags && $filters.tags.length > 0 ? 'text-white' : 'text-accent'}"
              data={faFilter} />
            {#if $filters.tags && $filters.tags.length > 0}
              <span class="text-white">{$filters.tags.length}</span>
            {/if}
          </button>
        </div>
        {#if $isLoading}
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3
            md:gap-3 -mx-4 md:mx-0">
            {#each Array(9) as _i}
              <SkeletonCard />
            {/each}
          </div>
        {:else}
          <div class="flex flex-wrap mb-3">
            {#if $filters.sort}
              <span
                style="font-size: .6rem"
                class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
                items-center bg-gray-200">
                tri : {renderSort($filters.sort)}
              </span>
            {/if}
            {#if $filters.text}
              <span
                style="font-size: .6rem"
                class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
                items-center bg-gray-200">
                termes: '{$filters.text}'
              </span>
            {/if}
            {#if $filters.tags && $filters.tags.length > 0}
              {#each $filters.tags as tag}
                <span
                  style="font-size: .6rem"
                  class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
                  items-center bg-gray-200">
                  {tag}
                </span>
              {/each}
            {/if}
          </div>
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3
            md:gap-3 -mx-4 md:mx-0">
            {#each $searchResults as product, index}
              <ProductCard {product} bind:hoveredProduct />
              {#if index === $searchResults.length - 1 && lastFetchLength >= QUERY_SIZE}
                <div class="fetchMore" use:fetchMoreOnIntersect>
                  <SkeletonCard />
                </div>
              {/if}
            {/each}
            {#if $isFetchingMore}
              {#each Array(3) as _i}
                <SkeletonCard />
              {/each}
            {/if}
          </div>
          {#if totalProducts < 1}
            <div class="m-auto text-center">
              <p class="mb-5 text-gray-600">Zut, on a pas encore de produit qui réponde à ces critères. Essayez de retirer des filtres.</p>
              <img src="./img/empty_results.svg"  alt="Pas de résultat" style="width: 200px;" class="m-auto">
            </div>
          {/if}
        {/if}
      {:else}
        <div class="text-lg text-gray-600 text-center">
          <p class="mt-5 mb-5 px-8">
          Pour commencer, cliquez dans la barre en haut et entrez un code postal ou une adresse !
          </p>
          <img src="./img/maps.svg" width="340" class="m-auto" alt="Renseignez votre localisation" />
        </div>
      {/if}
    </div>
  {/if}
</TransitionWrapper>

<div
  class="fixed overflow-hidden shadow right-0 top-0 bg-gray-100 h-screen w-3/12
  transition duration-300 ease-in-out cart-panel"
  class:active={$cartExpanded}>
  <ProductMap id="products-map" height="200px" userPosition={selectedLocation} {hoveredProduct} />
  <Cart />
</div>

{#if $selectedItem}
  <div
    id="product-details"
    transition:fly={{ x: 600, duration: 300 }}
    class="fixed active overflow-y-scroll overflow-x-hidden shadow right-0 top-0
    h-screen product-details bg-white"
    style="z-index: 10; padding-bottom: 70px;">
    <ProductDetails />
  </div>
{/if}

<style lang="scss">
  .filter-btn {
    min-height: 44px;
  }

  $cart-panel-size: 350px;
  $product-details-panel-size: 600px;

  .filter-bar {
    top: 64px;
  }
  
  .search-products {
    @media (min-width: 768px) {
      margin-bottom: 65px;
    }

    @media (max-width: 768px) {
      margin-top: -16px;
    }
  }

  .cart-panel {
    top: 64px;
    z-index: 3;
    width: $cart-panel-size;

    .bottom-items {
      width: $cart-panel-size;
    }
  }

  @media (max-width: 1024px) {
    .filters {
      margin-top: 9px;
    }

    .filter-btn {
      max-width: 55px;
    }

    .filter-bar {
      top: 45px;
    }

    .search-products {
      margin-top: -25px;
    }

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

  .product-details {
    width: $product-details-panel-size;

    @media (max-width: 1024px) {
      width: 100%;
    }

    @media (max-width: 1024px) {
      top: 45px;
      padding-bottom: 115px !important;
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
