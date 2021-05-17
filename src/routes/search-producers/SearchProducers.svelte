<script>
	import {onMount, onDestroy, getContext} from "svelte";
	import AgreementStatusKind from "./../../enums/AgreementStatusKind.js";
	import {fly} from "svelte/transition";
	import GetGraphQLInstance from "../../services/SheaftGraphQL.js";
	import {SEARCH_PRODUCERS, GET_AGREEMENTS, GET_MY_BUSINESS_LOCATION} from "./queries.js";
	import {isLoading, filters, isFetchingMore, items} from "./store";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import {selectedItem} from "./../../stores/app.js";
	import ProducerCard from "./ProducerCard.svelte";
	import FiltersModal from "./FiltersModal.svelte";
	import ProducerDetails from "./ProducerDetails.svelte";
	import Icon from "svelte-awesome";
	import {faFilter} from "@fortawesome/free-solid-svg-icons";
	import {querystring} from "svelte-spa-router";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import Loader from "./../../components/Loader.svelte";
	import SearchInput from "./../../components/controls/SearchInput.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import Meta from "../../components/Meta.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const graphQLInstance = GetGraphQLInstance();
	const {open} = getContext("modal");
	const observer = new IntersectionObserver(onIntersect);
	const defaultSearchValues = {
		text: null,
		tags: [],
		sort: "producer_geolocation asc",
		maxDistance: null,
	};
	const QUERY_SIZE = 20;

	let totalProducers = 0;
	let hoveredProducer = null;
	let prevFeed = [];
	let currentPage = 0;
	let lastFetchLength = 0;
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
		if (
			lastFetchLength >= QUERY_SIZE &&
			!isFetchingMore &&
			entries[0].isIntersecting
		) {
			isFetchingMore.set(false);
			await searchProducers(currentPage);
			isFetchingMore.set(true);
		}
	}

	const showFiltersModal = () => {
		open(FiltersModal, {filters, visibleNav: true});
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
			tags,
		});

		return {
			input: {
				text: $filters.text,
				tags: $filters.tags,
				sort: $filters.sort,
				maxDistance: $filters.maxDistance,
				page: page,
				take: 20,
			},
		};
	};

	async function refetch() {
		isLoading.set(true);
		await searchProducers(0);

		isLoading.set(false);
	}


	const searchProducers = async (page) => {
		currentPage = ++page;
		var variables = createVariables(currentPage);

		var response = await graphQLInstance.query(
			SEARCH_PRODUCERS,
			variables,
			errorsHandler.Uuid
		);

		if (!response.success) {
			//TODO
			return;
		}

		totalProducers = response.data.count;
		prevFeed = response.data.producers;
		lastFetchLength = prevFeed.length;
		items.set(prevFeed);
	};

	var popStateListener = (event) => {
		if ($selectedItem) {
			return selectedItem.set(null);
		}
	};

	onMount(async () => {
		items.set([]);

		var response = await graphQLInstance.query(
			GET_MY_BUSINESS_LOCATION,
			null,
			errorsHandler.Uuid
		);

		if (!response.success) {
			// todo
			return;
		}

		businessLocation = response.data.address;

		window.addEventListener("popstate", popStateListener, false);
	});

	onDestroy(() => {
		window.removeEventListener("popstate", popStateListener, false);
	});

	$: history.pushState({selected: $selectedItem}, "Trouver des producteurs");
	$: refetch($querystring);
</script>

<Meta/>

<TransitionWrapper>
	<PageHeader name="Trouver des producteurs"/>
	<PageBody {errorsHandler}>
		<div
			class="inline-flex items-center mb-3 themed text-center sticky -mx-4 px-4
			filter-bar"
			style="background-color: #fbfbfb; z-index: 2; width: -moz-available;
			width: -webkit-fill-available; width: fill-available;">
			<SearchInput placeholder="Rechercher un producteur" />
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
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
				gap-3 mt-3">
				{#each Array(9) as _i}
					<div>
						<div class="shadow-md h-full skeleton-box rounded-t-md">
							<div class="relative pb-5/6 overflow-hidden rounded-t-md">
								<div
									style="height: 150px;"
									class="skeleton-box w-full rounded-t-md" />
							</div>
							<div class="relative">
								<div class="bg-white p-6 rounded-b-lg">
									<div class="flex items-baseline">
										<div
											class="text-xs uppercase font-semibold tracking-wide mr-6
											w-64 skeleton-box" />
									</div>
									<div class="mb-1 h-4 skeleton-box" />
									<div class="mb-1 h-4 w-48 skeleton-box" />
									<div class="mt-1 h-6 skeleton-box" />
									<div class="mt-2 w-32 uppercase h-5 skeleton-box" />
									<div class="mt-3 w-40 mb-2 uppercase h-5 skeleton-box" />
									<div class="h-12 w-48 skeleton-box" />
								</div>
							</div>
						</div>
					</div>
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
				{#each $items as producer, index}
					<ProducerCard {producer} bind:hoveredProducer {businessLocation} />
					{#if index === $items.length - 1 && lastFetchLength >= QUERY_SIZE}
						<div use:fetchMoreOnIntersect>
							<div class="shadow-md h-full skeleton-box rounded-t-md">
								<div class="relative pb-5/6 overflow-hidden rounded-t-md">
									<div
										style="height: 150px;"
										class="skeleton-box w-full rounded-t-md" />
								</div>
								<div class="relative">
									<div class="bg-white p-6 rounded-b-lg">
										<div class="flex items-baseline">
											<div
												class="text-xs uppercase font-semibold tracking-wide
												mr-6 w-64 skeleton-box" />
										</div>
										<div class="mb-1 h-4 skeleton-box" />
										<div class="mb-1 h-4 w-48 skeleton-box" />
										<div class="mt-1 h-6 skeleton-box" />
										<div class="mt-2 w-32 uppercase h-5 skeleton-box" />
										<div class="mt-3 w-40 mb-2 uppercase h-5 skeleton-box" />
										<div class="h-12 w-48 skeleton-box" />
									</div>
								</div>
							</div>
						</div>
					{/if}
				{/each}
				{#if $isFetchingMore}
					{#each Array(3) as _i}
						<div>
							<div class="shadow-md h-full skeleton-box rounded-t-md">
								<div class="relative pb-5/6 overflow-hidden rounded-t-md">
									<div
										style="height: 150px;"
										class="skeleton-box w-full rounded-t-md" />
								</div>
								<div class="relative">
									<div class="bg-white p-6 rounded-b-lg">
										<div class="flex items-baseline">
											<div
												class="text-xs uppercase font-semibold tracking-wide
												mr-6 w-64 skeleton-box" />
										</div>
										<div class="mb-1 h-4 skeleton-box" />
										<div class="mb-1 h-4 w-48 skeleton-box" />
										<div class="mt-1 h-6 skeleton-box" />
										<div class="mt-2 w-32 uppercase h-5 skeleton-box" />
										<div class="mt-3 w-40 mb-2 uppercase h-5 skeleton-box" />
										<div class="h-12 w-48 skeleton-box" />
									</div>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>

{#if $selectedItem}
	<div
		id="producer-details"
		class="fixed overflow-y-scroll overflow-x-hidden shadow right-0 top-0
		h-screen producer-details bg-white"
		transition:fly={{ x: 600, duration: 300 }}
		style="z-index: 10;">
		<ProducerDetails />
	</div>
{/if}

<style lang="scss">
	.filter-btn {
		min-height: 44px;
	}

	.search-producers {
		@media (min-width: 768px) {
			margin-bottom: 65px;
		}
	}

	$producer-details-panel-size: 600px;

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

	.producer-details {
		width: $producer-details-panel-size;

		@media (max-width: 1024px) {
			width: 100%;
			top: 45px;
			padding-bottom: 115px !important;
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
