<script>
  import { onMount, onDestroy, getContext } from "svelte";
	import AgreementStatusKind from './../../enums/AgreementStatusKind.js';
  import { fly } from "svelte/transition";
  import { SEARCH_STORES, GET_AGREEMENTS } from "./queries.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL.js";
  import { isLoading, isFetchingMore, filters, items } from "./store";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import { selectedItem } from "./../../stores/app.js";
  import StoreCard from "./StoreCard.svelte";
  import FiltersModal from "./FiltersModal.svelte";
  import StoreDetails from "./StoreDetails.svelte";
  import Icon from "svelte-awesome";
  import { faFilter } from "@fortawesome/free-solid-svg-icons";
  import { querystring } from "svelte-spa-router";
  import { parse } from "qs";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import Loader from "./../../components/Loader.svelte";
  import SearchInput from "./../../components/controls/SearchInput.svelte";
  import SkeletonStoreCard from "./SkeletonStoreCard.svelte";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  
  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();
  const graphQLInstance = GetGraphQLInstance();
  const { open } = getContext("modal");
  const observer = new IntersectionObserver(onIntersect);
  const defaultSearchValues = {
    text: null,
    tags: [],
    sort: "store_geolocation asc",
    maxDistance: null
  };

  let hoveredStore = null;
  let prevFeed = [];
  let currentPage = 0;
  let lastFetchLength = 0;
  const QUERY_SIZE = 20;

  function fetchMoreOnIntersect(node, params) {
    observer.observe(node);
    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }

  async function onIntersect(entries) {
    if (lastFetchLength >= QUERY_SIZE && !$isFetchingMore && entries[0].isIntersecting) {
      isFetchingMore.set(false);
      await searchStores(currentPage);
      isFetchingMore.set(true);
    }
  }

  const showFiltersModal = () => {
    open(FiltersModal, { filters, visibleNav: true });
  };

  const createVariables = (page = 1) => {
    let values = routerInstance.getQueryParams();
    let tags = [];

    if (Object.keys(values).length == 0) {
      values = defaultSearchValues;
    }

    if (!values["sort"]) {
      values["sort"] = defaultSearchValues.sort;
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
        maxDistance: $filters.maxDistance,
        page: page,
        take: 20
      }
    };
  };

  async function refetch() {
    isLoading.set(true);
    await searchStores(0);
    await getAndSetAgreements();
    
    isLoading.set(false);
  }

  const getAndSetAgreements = async () => {
    var response = await graphQLInstance.query(GET_AGREEMENTS, null, errorsHandler.Uuid);

    if (!response.success) {
      // todo
      return;
    }

    response.data.map((a) => {
      let store = prevFeed.find((p) => p.id === a.store.id);
      if (store) {
        if (a.status == AgreementStatusKind.WaitingForProducerApproval.Value ||
         a.status == AgreementStatusKind.WaitingForStoreApproval.Value) {
          store.hasPendingAgreement = true;
        } else if (a.status == AgreementStatusKind.Accepted.Value) {
          store.hasAgreement = true;
        }
      }
    });
  }

  const searchStores = async (page) => {
    currentPage = ++page;
    var variables = createVariables(currentPage);

    var response = await graphQLInstance.query(SEARCH_STORES, variables, errorsHandler.Uuid);
    if (response.success) {
      prevFeed = response.data;
      lastFetchLength = prevFeed.length;
      items.set(prevFeed);
    }
  }

  var popStateListener = (event) => {
    if ($selectedItem) {
      return selectedItem.set(null);
    }
  }

  onMount(() => {
    items.set([]);

    window.addEventListener("popstate", popStateListener, false);
  });

  onDestroy(() => {
    window.removeEventListener("popstate", popStateListener, false);
  });

  $: history.pushState({ selected: $selectedItem}, "Trouver des producteurs");
  $: refetch($querystring);
</script>

<svelte:head>
  <title>Trouver des magasins</title>
</svelte:head>

<TransitionWrapper style="margin:0;">
  <div class="search-stores">
    <div class="pb-6">
      <h1>Trouver des magasins</h1>
    </div>
    <ErrorCard {errorsHandler} />
    <div
      class="inline-flex items-center mb-3 themed text-center sticky -mx-4 px-4 filter-bar"
      style="background-color: #fbfbfb; z-index: 2; width: -moz-available;
      width: -webkit-fill-available; width: fill-available;">
      <SearchInput placeholder="Rechercher un magasin" />
      <button
        class="filter-btn bg-white py-2 px-3 rounded
        text-sm shadow-md flex flex-nowrap items-center ml-2"
        class:text-white={$filters.tags && $filters.tags.length > 0}
        class:bg-accent={$filters.tags && $filters.tags.length > 0}
        on:click={showFiltersModal}>
        <Icon class="m-auto {$filters.tags && $filters.tags.length > 0 ? 'text-white' : 'text-accent'}" data={faFilter} />
        {#if $filters.tags && $filters.tags.length > 0}
          <span class="text-white">{$filters.tags.length}</span>
        {/if}
      </button>
    </div>
    {#if $isLoading}
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
        {#each Array(9) as _i}
          <SkeletonStoreCard />
        {/each}
      </div>
    {:else}
      <div class="flex flex-wrap mb-3">
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
        {#if $filters.text}
          <span
            style="font-size: .6rem"
            class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
            items-center bg-gray-200">
            termes: '{$filters.text}'
          </span>
        {/if}
      </div>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        md:gap-3 -mx-4 md:mx-0">
        {#each $items as store, index}
          <StoreCard {store} bind:hoveredStore />
          {#if index === $items.length - 1 && lastFetchLength >= 20}
            <div use:fetchMoreOnIntersect>
              <SkeletonStoreCard />
            </div>
          {/if}
        {/each}
        {#if $isFetchingMore}
          {#each Array(3) as _i}
            <SkeletonStoreCard />
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</TransitionWrapper>
{#if $selectedItem}
  <div
    id="store-details"
    class="fixed overflow-y-scroll overflow-x-hidden shadow right-0 top-0 h-screen
    store-details bg-white"
    transition:fly={{ x: 600, duration: 300 }}
    style="z-index: 10; padding-bottom: 60px;">
      <StoreDetails />
  </div>
{/if}

<style lang="scss">
  .filter-btn {
    min-height: 44px;
  }

  .search-stores {
    @media (min-width: 768px) {
      margin-bottom: 65px;
    }
  }

  $store-details-panel-size: 600px;

  .filter-bar {
    top: 64px;
  }

  @media (max-width: 1024px) {
    
    .filter-btn {
      max-width:55px;
    }

    .filter-bar {
      top: 45px;
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

  .store-details {
    width: $store-details-panel-size;

    @media (max-width: 1024px) {
      top: 45px;
      padding-bottom: 115px !important;
      width: 100%;
    }
  }

  .bottom-mobile-cta {
    @media (min-width: 1025px) {
      display: none;
    }

    transform: translateY(64px);
    z-index: 4;

    &.active {
      transform: translateY(0px);
    }
  }
</style>