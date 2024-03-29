<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import { fly } from "svelte/transition";
	import { SEARCH_STORES, GET_MY_BUSINESS_LOCATION } from "./queries.js";
	import { isLoading, isFetchingMore, filters, items } from "./store";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { selectedItem } from "./../../stores/app.js";
	import StoreCard from "./StoreCard.svelte";
	import FiltersModal from "./FiltersModal.svelte";
	import StoreDetails from "./StoreDetails.svelte";
	import Icon from "svelte-awesome";
	import { faFilter } from "@fortawesome/free-solid-svg-icons";
	import { querystring } from "svelte-spa-router";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import SearchInput from "./../../components/controls/SearchInput.svelte";
	import SkeletonStoreCard from "./SkeletonStoreCard.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import Meta from "../../components/Meta.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { normalizeSearchStores } from "./searchStoresForm";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const observer = new IntersectionObserver(onIntersect);
	const { query } = getContext("api");

	let hoveredStore = null;
	let prevFeed = [];
	let currentPage = 0;
	let lastFetchLength = 0;
	const QUERY_SIZE = 20;
	let businessLocation = null;

	function fetchMoreOnIntersect(node, params) {
		observer.observe(node);
		return {
			destroy() {
				observer.unobserve(node);
			},
		};
	}

	async function onIntersect(entries) {
		if (lastFetchLength >= QUERY_SIZE && !$isFetchingMore && entries[0].isIntersecting) {
			isFetchingMore.set(false);
			await searchStores(currentPage);
			isFetchingMore.set(true);
		}
	}

	const showFiltersModal = () => open(FiltersModal, { filters, visibleNav: true });

	async function refetch() {
		isLoading.set(true);
		await searchStores(0);

		isLoading.set(false);
	}

	const searchStores = async (page) => {
		currentPage = ++page;
		await query({
			query: SEARCH_STORES,
			variables: normalizeSearchStores(routerInstance.getQueryParams(), currentPage),
			errorsHandler,
			success: (res) => {
				prevFeed = res.stores;
				lastFetchLength = prevFeed.length;
				items.set(prevFeed);
			},
			errorNotification: "Impossible de récupérer les informations des magasins.",
		});
	};

	var popStateListener = (event) => {
		if ($selectedItem) {
			return selectedItem.set(null);
		}
	};

	onMount(async () => {
		items.set([]);

		await query({
			query: GET_MY_BUSINESS_LOCATION,
			errorsHandler,
			success: (res) => {
				businessLocation = res.address;
			},
			errorNotification: "Impossible de récupérer la localisation de votre société.",
		});

		window.addEventListener("popstate", popStateListener, false);
	});

	onDestroy(() => {
		window.removeEventListener("popstate", popStateListener, false);
	});

	$: history.pushState({ selected: $selectedItem }, "Trouver des magasins");
	$: refetch($querystring);
</script>

<Meta />

<TransitionWrapper>
	<PageHeader name="Trouver des magasins" />
	<PageBody {errorsHandler}>
		<div
			class="inline-flex items-center mb-3 themed text-center sticky -mx-4 px-4 filter-bar"
			style="background-color: #fbfbfb; z-index: 2; width: -moz-available;
      width: -webkit-fill-available; width: fill-available;"
		>
			<SearchInput placeholder="Rechercher un magasin" />
			<button
				class="filter-btn bg-white py-2 px-3 rounded
        text-sm shadow-md flex flex-nowrap items-center ml-2"
				class:text-white={$filters.tags && $filters.tags.length > 0}
				class:bg-accent={$filters.tags && $filters.tags.length > 0}
				on:click={showFiltersModal}
			>
				<Icon
					class="m-auto {$filters.tags && $filters.tags.length > 0 ? 'text-white' : 'text-accent'}"
					data={faFilter}
				/>
				{#if $filters.tags && $filters.tags.length > 0}
					<span class="text-white">{$filters.tags.length}</span>
				{/if}
			</button>
		</div>
		{#if $isLoading}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
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
              items-center bg-gray-200"
						>
							{tag}
						</span>
					{/each}
				{/if}
				{#if $filters.text}
					<span
						style="font-size: .6rem"
						class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
            items-center bg-gray-200"
					>
						termes: '{$filters.text}'
					</span>
				{/if}
			</div>
			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        md:gap-3 -mx-4 md:mx-0"
			>
				{#each $items as store, index}
					<StoreCard {store} bind:hoveredStore {businessLocation} />
					{#if index === $items.length - 1 && lastFetchLength >= QUERY_SIZE}
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
	</PageBody>
</TransitionWrapper>
{#if $selectedItem}
	<div
		id="store-details"
		class="fixed overflow-y-scroll overflow-x-hidden shadow right-0 top-0 h-screen
    store-details bg-white"
		transition:fly={{ x: 600, duration: 300 }}
		style="z-index: 10; padding-bottom: 60px;"
	>
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
			max-width: 55px;
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
