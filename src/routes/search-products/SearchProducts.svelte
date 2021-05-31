<script>
	import {querystring} from "svelte-spa-router";
	import {onMount, onDestroy, getContext} from "svelte";
	import {fly} from "svelte/transition";
	import {SEARCH_PRODUCTS, GET_PRODUCER_NAME} from "./queries.js";
	import {isLoading, isFetchingMore, filters} from "./store";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import {
		selectedItem,
		searchResults,
		allDepartmentsProgress,
	} from "./../../stores/app.js";
	import cart from "./../../stores/cart";
	import Cart from "./Cart.svelte";
	import ProductCard from "./ProductCard.svelte";
	import CitySearch from "./../../components/search/CitySearch.svelte";
	import SearchInput from "./../../components/controls/SearchInput.svelte";
	import FiltersModal from "./FiltersModal.svelte";
	import ProductDetails from "./ProductDetails.svelte";
	import GetAuthInstance from "../../services/SheaftAuth.js";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import Icon from "svelte-awesome";
	import {
		faFilter,
		faTimesCircle
	} from "@fortawesome/free-solid-svg-icons";
	import SkeletonCard from "./SkeletonCard.svelte";
	import Roles from "./../../enums/Roles";
	import QuickOrderRoutes from "../quick-orders/routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import Meta from "../../components/Meta.svelte";
	import { normalizeSearchProducts, retrieveUserLocationInQueryString, retrieveUserLocationInStorage, updateUserLocationInQueryString, QUERY_SIZE } from "./searchProductsForm";

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const { query } = getContext("api");
	const authManager = GetAuthInstance();
	const routerInstance = GetRouterInstance();

	let hoveredProduct = null;
	let errors = [];
	let prevFeed = [];
	let currentPage = 0;
	let lastFetchLength = 0;
	let departmentProgress = null;
	let totalProducts = 0;
	let isLoadingCitySearch = false;
	let producer = null;

	const clearProducer = () => {
		producer = null;
		currentProducerId = null;
		$filters.producerId = null;

		routerInstance.pushQueryParams({["producerId"]: null});
	};

	const observer = new IntersectionObserver(async (entries) => {
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
			},
		};
	};

	const showFiltersModal = () => open(FiltersModal, {filters, visibleNav: true, producer});

	const renderSort = (sort) => {
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

	const refetch = async () => {
		isLoading.set(true);
		prevFeed = [];
		await searchProducts(0);
	};

	const searchProducts = async (page) => {
		currentPage = ++page;

		let newPosition = retrieveUserLocationInQueryString();
		if (newPosition) {
			values["latitude"] = newPosition.latitude;
			values["longitude"] = newPosition.longitude;
		} else {
			newPosition = retrieveUserLocationInStorage();
			if (newPosition) {
				updateUserLocationInQueryString(newPosition, routerInstance);
			}
		}

		await query({
			query: SEARCH_PRODUCTS,
			variables: normalizeSearchProducts(routerInstance.getQueryParams(), currentPage),
			errorsHandler,
			success: (res) => {
				totalProducts = res.count;
				prevFeed = [...prevFeed, ...res.products];
				lastFetchLength = res.products.length;
				searchResults.set(prevFeed);
			},
			errorNotification: "Impossible de récupérer les informations des produits."
		});
		isLoading.set(false);
	};

	const updateUserLocation = (position) => {
		updateUserLocationInStorage(position);
		return updateUserLocationInQueryString(position, routerInstance);
	};

	const updateUserLocationInStorage = (position) => {
		if (!position) return false;

		localStorage.setItem("user_location", JSON.stringify(position));
		return true;
	};

	const getDepartmentProgressData = async (address) => {
		if (!address || $allDepartmentsProgress.length < 1) {
			return;
		}

		const departmentCode = address.insee.substring(0, 2);

		let department = $allDepartmentsProgress.find(
			(d) => d.Code == departmentCode
		);

		if (department) {
			return (departmentProgress = department);
		}

		return (departmentProgress = null);
	};

	const handleLocation = (location) => {
		if (!location) return;
		updateUserLocation({
			latitude: location.latitude,
			longitude: location.longitude,
		});
	};

	let initLocation = null;
	let selectedLocation = null;
	$: refetch($querystring);
	$: handleLocation(selectedLocation);
	$: getDepartmentProgressData(selectedLocation);

	var popStateListener = (event) => {
		if ($selectedItem) {
			return selectedItem.set(null);
		}
	};

	const removeTag = (tag) => {
		let queryParam = null;

		if (tag == "bio") queryParam = "labels";
		else queryParam = "category";

		return routerInstance.pushQueryParams({[queryParam]: ""});
	};

	onMount(async () => {
		const values = routerInstance.getQueryParams();
		var newPosition = retrieveUserLocationInQueryString(values);
		if (newPosition) {
			updateUserLocationInStorage(newPosition);
			initLocation = newPosition;
		} else {
			var localPosition = retrieveUserLocationInStorage();
			if (localPosition) {
				updateUserLocationInQueryString(localPosition, routerInstance);
				initLocation = localPosition;
			} else {
				isLoadingCitySearch = true;
				try {
					await fetch("https://ipapi.co/json/")
						.then((res) => res.json())
						.then((json) => {
							initLocation = {
								latitude: json.latitude,
								longitude: json.longitude,
							};
							isLoadingCitySearch = false;
						});
				} catch (ex) {
					isLoadingCitySearch = false;
				}
			}
		}

		window.addEventListener("popstate", popStateListener, false);
	});

	onDestroy(() => {
		window.removeEventListener("popstate", popStateListener, false);
	});

	let activeFilters = 0;

	const getActiveFilters = () => {
		activeFilters = 0;
		if ($filters.tags && $filters.tags.length > 0) activeFilters += $filters.tags.length;

		if ($filters.producerId && $filters.producerId.length > 0) activeFilters++;
	};

	$: getActiveFilters($filters);

	let currentProducerId = null;
	const getProducerFilter = async (producerId) => {
		if (currentProducerId == producerId) return;

		if (!producerId || producerId.length <= 0) {
			producer = null;
			return;
		}

		currentProducerId = producerId;
		
		producer = await query({
			query: GET_PRODUCER_NAME,
			variables: {id: producerId},
			errorsHandler,
			errorNotification: "Impossible de récupérer les producteurs"
		});
	};

	$: getProducerFilter($filters.producerId);
	let metadata = {title: "Explorer"};
</script>

<Meta metadata={metadata}/>

<TransitionWrapper hasRightPanel style="margin:0;">
	<ErrorCard {errorsHandler} bind:componentErrors={errors} retry={true} />
	{#if errors.length < 1}
		<div
			class:has-bottom-mobile-cta={$cart.products.length > 0}
			class="search-products md:-my-4 container m-auto">
			<div class="filters -mx-4 md:-mx-6 lg:my-0 lg:mx-0 mb-3">
				<CitySearch
					withGeolocationButton={true}
					isDisabled={isLoadingCitySearch}
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
							<p class="uppercase font-bold leading-none">
								Module consommateur
							</p>
							<div class="mt-2 text-sm">
								<p>
									Cette page est réservée aux consommateurs. Vous ne pouvez
									l'utiliser qu'à des fins de consultation.
								</p>
								<div class="mt-1 flex flex-wrap">
									{#if authManager.isInRole([Roles.Store.Value])}
										<button
											class="btn btn-accent btn-lg"
											on:click={() => routerInstance.goTo(QuickOrderRoutes.Purchase)}>
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
			<!-- si on ne trouve pas de produits alors qu'il n'y a pas de filtre, on affiche un écran "Nous ne sommes pas encore arrivés !" -->
			{#if !$isLoading && totalProducts < 1 && (activeFilters <= 0) && !$filters.text}
				<div class="text-lg">
					{#if departmentProgress}
						<h2 class="mt-5 mb-5 font-semibold">
							{departmentProgress.Name}, on arrive bientôt !
						</h2>
					{:else}
						<h2 class="mt-5 mb-5 font-semibold">On arrive bientôt !</h2>
					{/if}
					<span class="bg-primary h-1 w-20 block mt-2 mb-4" />
					<p class="mt-5 mb-5">
						Nous n'avons pas encore de producteur enregistré autour de vous 😔.
					</p>
					<p class="mb-5">
						Parlez de Sheaft sur les réseaux et sur les marchés pour nous aider
						à faire connaître la plateforme auprès des producteurs de votre
						département !
					</p>
					<img
						src="./img/maps.svg"
						width="230"
						class="m-auto"
						alt="Nous ne sommes pas encore dans ce département" />
				</div>
			{:else if $filters.latitude && $filters.longitude}
				{#if departmentProgress && departmentProgress.ProducersCount >= 0 && departmentProgress.ProducersCount < departmentProgress.ProducersRequired}
					<div
						class="py-5 px-5 md:px-4 overflow-x-auto -mx-4 md:mx-0 bg-white
							shadow lg:rounded mb-5 lg:mt-3">
						<div class="flex">
							<div>
								<p class="uppercase font-bold leading-none">
									{departmentProgress.Name}{#if departmentProgress.ProducersCount == 0}
										, on arrive bientôt !
									{/if}
								</p>
								<span class="bg-primary h-1 w-20 block mt-2 mb-4" />
								<div class="mt-2 text-sm">
									{#if departmentProgress.ProducersCount == 0}
										<p class="mb-2">
											Nous avons trouvé des producteurs dans les départements
											voisins.
										</p>
									{:else if departmentProgress.ProducersCount == 1}
										<p class="mb-2">
											<span
												class="font-semibold">{departmentProgress.ProducersCount}
												producteur</span>
											est enregistré dans ce département.
										</p>
									{:else}
										<p class="mb-2">
											<span
												class="font-semibold">{departmentProgress.ProducersCount}
												producteurs</span>
											sont enregistrés dans ce département.
										</p>
									{/if}
									<p>
										Parlez de Sheaft sur les réseaux et sur les marchés pour
										nous aider à faire connaître la plateforme et amener plus de
										producteurs !
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}
				<div
					class="inline-flex items-center mb-3 themed text-center sticky py-1
						lg:py-2 -mx-4 px-4 filter-bar"
					style="background-color: #fbfbfb; z-index: 2; width: -moz-available;
            width: -webkit-fill-available; width: fill-available;">
					{#if $isLoading}
						<div class="mb-1 h-6 w-16 md:w-24 skeleton-box" />
					{:else}
						<p class="text-xs lg:text-xl pr-2 border-r border-gray-400">
							{totalProducts}
							résultat{totalProducts > 1 ? 's' : ''}
						</p>
					{/if}
					<SearchInput containerClasses="ml-2" />
					<button
						class="filter-btn bg-white py-2 px-2 rounded shadow-md flex
							items-center ml-2 {activeFilters > 0 ? 'flex-nowrap' : 'flex-wrap'}"
						class:text-white={activeFilters > 0}
						class:bg-accent={activeFilters > 0}
						on:click={showFiltersModal}>
						<Icon
							style="width: .8em;"
							class="lg:mr-1 m-auto lg:m-0 {activeFilters > 0 ? 'text-white' : 'text-accent'}"
							data={faFilter} />
						{#if activeFilters > 0}
							<span class="text-white">{activeFilters}</span>
						{:else}
							<p style="font-size: .8em;" class="text-center text-accent">
								Filtres
							</p>
						{/if}
					</button>
				</div>
				<div class="flex flex-wrap mb-3">
					{#if $filters.sort}
						<span
							style="font-size: .6rem"
							class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
								items-center bg-gray-200">
							tri :
							{renderSort($filters.sort)}
						</span>
					{/if}
					{#if producer}
						<span
							on:click={() => clearProducer()}
							style="font-size: .6rem"
							class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
								items-center bg-gray-200 cursor-pointer">
							producteur: '{producer.name}'

							<Icon data={faTimesCircle} scale=".7" class="ml-2" />
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
								on:click={() => removeTag(tag)}
								style="font-size: .6rem"
								class="mx-1 mb-2 px-3 h-6 rounded-full font-semibold flex
									items-center bg-gray-200 cursor-pointer">
								{tag}
								<Icon data={faTimesCircle} scale=".7" class="ml-2" />
							</span>
						{/each}
					{/if}
				</div>
				{#if $isLoading}
					<div
						class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
							xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0">
						{#each Array(9) as _i}
							<SkeletonCard />
						{/each}
					</div>
				{:else}
					<div
						class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
							xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0">
						{#each $searchResults as product, index}
							<ProductCard {product} bind:hoveredProduct />
							{#if index === $searchResults.length - 1 && lastFetchLength >= QUERY_SIZE}
								<div class="h-full" use:fetchMoreOnIntersect>
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
							<p class="mb-5 text-gray-600">
								Zut, nous n'avons pas encore de produit qui réponde à ces
								critères. Essayez de retirer des filtres.
							</p>
							<img
								src="./img/empty_results.svg"
								alt="Pas de résultat"
								style="width: 200px;"
								class="m-auto" />
						</div>
					{/if}
				{/if}
			{:else}
				<div class="text-lg text-gray-600 text-center">
					<p class="mt-5 mb-5 px-8">
						Pour commencer, cliquez dans la barre en haut et entrez un code
						postal ou une adresse !
					</p>
					<img
						src="./img/maps.svg"
						width="340"
						class="m-auto"
						alt="Renseignez votre localisation" />
				</div>
			{/if}
		</div>
	{/if}
</TransitionWrapper>

<Cart userPosition={selectedLocation} {hoveredProduct} />

{#if $selectedItem}
	<div
		id="product-details"
		transition:fly={{ x: -600, duration: 300 }}
		class="fixed active overflow-y-scroll overflow-x-hidden shadow left-0 top-0
			h-screen product-details bg-white"
		style="z-index: 10; padding-bottom: 70px;">
		<ProductDetails />
	</div>
{/if}

<style lang="scss">
	.filter-btn {
		height: 48px;
	}

	.products-grid {
		@media (min-width: 1650px) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

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
