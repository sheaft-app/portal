<script>
	import { getContext, onMount } from "svelte";
	import ReadMoreModal from "./ReadMoreModal.svelte";
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import { fly } from "svelte/transition";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import ProductCard from "../search-products/ProductCard.svelte";
	import Cart from "../search-products/Cart.svelte";
	import SearchProductsRoutes from "../search-products/routes";
	import ProductDetails from "../search-products/ProductDetails.svelte";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import { GET_STORE_PROFILE } from "./queries.js";
	import GetAuthInstance from "../../services/SheaftAuth.js";
	import Roles from "../../enums/Roles";
	import SheaftErrors from "../../services/SheaftErrors";
	import { encodeQuerySearchUrl } from "../../helpers/app";
	import "leaflet/dist/leaflet.css";
	import { Tabs, Tab, TabList, TabPanel } from "svelte-tabs";
	import { selectedItem } from "../../stores/app.js";
	import SkeletonCard from "../search-products/SkeletonCard.svelte";
	import AccountRoutes from "../account/routes";
	import Meta from "../../components/Meta.svelte";
	import PictureSlider from "../../components/PictureSlider.svelte";
	import ProducerCard from "../search-producers/ProducerCard.svelte";
	import ExternalRoutes from "./routes";
	import DayOfWeekKind from "../../enums/DayOfWeekKind";
	import { timeSpanToFrenchHour } from "../../helpers/app.js";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();
	const { open } = getContext("modal");
	const { query } = getContext("api");

	export let params = {};

	let store = null;
	let isLoading = true;
	let deliveries = [];

	const tabs = [
		{ id: "producers", icon: "fas fa-store", label: "Producteurs" },
		//{id: 'products', icon: 'fas fa-barcode', label: 'Produits'},
		{ id: "openings", icon: "fas fa-barcode", label: "Horaires" },
	];

	onMount(async () => {
		window.scrollTo(0, 0);
		isLoading = true;
		store = await query({
			query: GET_STORE_PROFILE,
			variables: { id: params.id },
			errorsHandler,
			errorNotification: "Impossible de récupérer les informations du magasin.",
		});
		isLoading = false;
	});

	const openReadMoreModal = () => open(ReadMoreModal, { entity: store });
	const openGMap = (producer) => {
		routerInstance.goTo(ExternalRoutes.ProducerDetails, { id: producer.id });
	};

	$: metadata = {
		title: store ? store.name : null,
		description: store && store.summary ? store.summary : null,
		image: store && store.picture ? store.picture : null,
	};

</script>

<Meta {metadata} />

<TransitionWrapper hasRightPanel>
	{#if isLoading}
		<div class="flex flex-wrap mt-5 mb-5 justify-center xl:justify-between">
			<div class="h-20 w-20 md:h-32 md:w-32 rounded-full p-1 md:mx-0 skeleton-box" />
			<div class="w-full xl:w-10/12 xl:pl-3 text-center xl:text-left mt-3 xl:mt-0">
				<div class="w-64 h-6 mb-3 skeleton-box border-b border-gray-300 pb-2 m-auto xl:mx-0" />
				<div class="flex flex-wrap justify-between w-full pt-2" style="align-items: baseline;">
					<div class="w-full h-32 skeleton-box" />
					<!-- <div class="w-full xl:w-auto">
					<div class="w-64 h-32 skeleton-box" />
				</div> -->
				</div>
				<div class="flex flex-row flex-wrap social-medias justify-center xl:justify-start">
					<div class="h-6 w-6rounded-full skeleton-box" />
					<div class="h-6 w-6rounded-full skeleton-box" />
					<div class="h-6 w-6rounded-full skeleton-box" />
				</div>
			</div>
		</div>
		<div
			class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
      xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0"
		>
			{#each Array(9) as _i}
				<SkeletonCard />
			{/each}
		</div>
	{:else}
		<div class="container m-auto">
			{#if !authInstance.isInRole([Roles.Store.Value])}
				<button
					class="text-gray-600 items-center flex uppercase mb-2"
					on:click={() => routerInstance.goTo(SearchProductsRoutes.Search)}
				>
					<Icon data={faChevronLeft} scale=".8" class="mr-2 inline" />
					Retourner à la recherche
				</button>
			{:else if authInstance.isInRole([Roles.Store.Value])}
				<div class="mb-3 p-4 text-white bg-blue-500 rounded">
					<p>
						Vous pouvez partager le lien présent dans votre barre de navigation sur votre site ou sur vos réseaux pour
						avoir une référence directe vers votre magasin.
					</p>
					<p>
						Si certaines informations sont incorrectes, dirigez-vous sur votre profil en <a
							href="javascript:void(0)"
							on:click={() => routerInstance.goTo(AccountRoutes.Profile)}>cliquant ici</a
						>.
					</p>
				</div>
			{/if}
			{#if !store}
				<h3 class="font-bold uppercase border-b border-gray-300 xl:w-1/2 pb-2">Mince !</h3>
				<p>Nous n'avons pas réussi à trouver ce magasin.</p>
			{:else}
				<div class="flex flex-wrap mt-5 mb-5 justify-center xl:justify-between">
					<img
						class="h-20 w-20 md:h-32 md:w-32 rounded-full p-1 md:mx-0 border
          border-gray-800 border-solid"
						src={store.picture ? store.picture : "img/icons/store.svg"}
						alt="Photo du magasin"
					/>
					<div class="w-full xl:w-10/12 xl:pl-3 text-center xl:text-left mt-3 xl:mt-0">
						<h3 class="font-bold uppercase border-b border-gray-300 xl:w-1/2 pb-2">{store.name}</h3>
						<div
							class="flex flex-wrap justify-between w-full pt-2 xl:-mt-6 xl:pt-2"
							class:xl:-mt-6={store.summary}
							style="align-items: baseline;"
						>
							{#if store.summary}
								<div class="w-full xl:w-7/12">
									<p class="text-sm">{store.summary}</p>
									{#if store.description}
										<button on:click={openReadMoreModal} class="btn btn-link mt-2 m-auto xl:mx-0">Lire plus</button>
									{/if}
								</div>
							{/if}
							<div class:xl:w-auto={store.summary} class="w-full mt-3 xl:mt-0">
								<div class="bg-white shadow-md rounded p-4 px-5 w-full">
									<div class="flex flex-row justify-center xl:justify-between items-start mb-3">
										<div>
											<p class="font-semibold">Adresse du magasin</p>
											<p>{store.address.line1}</p>
											{#if store.address.line2}
												<p>{store.address.line2}</p>
											{/if}
											<p>{store.address.zipcode} {store.address.city}</p>
											<a
												class="mt-1"
												target="_blank"
												href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(store.address)}`}
											>
												Voir sur Google Maps
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
						{#if store.facebook || store.instagram}
							<p class="text-gray-600 mb-2 text-sm mt-4" class:xl:mt-0={store.summary}>
								Retrouvez-nous sur les réseaux sociaux !
							</p>
							<div class="flex flex-row flex-wrap social-medias justify-center xl:justify-start">
								{#if store.facebook}
									<a href={store.facebook} target="_blank">
										<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1877F2"
											><title> Facebook</title>
											<path
												d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"
											/>
										</svg>
									</a>
								{/if}
								{#if store.instagram}
									<a href={store.instagram} target="_blank">
										<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#E4405F"
											><title> Instagram</title>
											<path
												d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
											/>
										</svg>
									</a>
								{/if}
								{#if store.website}
									<a href={store.website} target="_blank">
										<svg
											class="mr-5"
											enable-background="new 0 0 24 24"
											height="30"
											viewBox="0 0 24 24"
											width="30"
											xmlns="http://www.w3.org/2000/svg"
											><title>Site web</title><path
												d="m12 0c-6.62 0-12 5.38-12 12s5.38 12 12 12c.75 0 1.48-.07 2.2-.2l-.82-2.46c-.12.12-.25.22-.38.31v-1.46l-1.86-5.57c-.1-.29-.14-.59-.14-.88v2.03c-.95.04-1.88.12-2.76.27-.18-.94-.3-1.96-.35-3.06h3.11v.76c0-.71.28-1.4.81-1.93.51-.52 1.2-.81 1.94-.81.3 0 .59.05.88.14l5.51 1.84h1.81c-.02.2-.04.39-.08.58l1.93.64c.13-.72.2-1.45.2-2.2 0-6.62-5.38-12-12-12zm-1 17.77v3.88c-.86-.58-1.68-1.86-2.26-3.67.73-.11 1.48-.18 2.26-.21zm-7.4-11.18c.8.38 1.7.7 2.68.96-.21 1.07-.34 2.22-.39 3.43h-3.84c.16-1.6.72-3.09 1.55-4.39zm-1.55 6.39h3.84c.05 1.23.18 2.39.39 3.47-.98.26-1.88.58-2.68.96-.84-1.3-1.39-2.81-1.55-4.43zm5.89 8.15c-1.15-.51-2.18-1.23-3.05-2.11.57-.25 1.2-.46 1.87-.63.32 1.03.72 1.96 1.18 2.74zm-1.18-15.52c-.67-.17-1.3-.38-1.87-.63.87-.88 1.9-1.6 3.05-2.11-.46.78-.86 1.71-1.18 2.74zm4.24 5.37h-3.11c.05-1.08.17-2.09.35-3.02.88.15 1.81.23 2.76.27zm0-4.75c-.78-.03-1.53-.1-2.26-.21.58-1.81 1.4-3.09 2.26-3.67zm2-3.88c.86.58 1.68 1.86 2.26 3.67-.73.11-1.48.18-2.26.21zm0 8.63v-2.75c.95-.04 1.88-.12 2.76-.27.18.93.3 1.94.35 3.02zm3.06-8.11c1.15.51 2.18 1.23 3.05 2.11-.57.25-1.2.46-1.87.63-.32-1.03-.72-1.96-1.18-2.74zm2.05 8.11c-.05-1.21-.18-2.36-.39-3.43.98-.26 1.88-.58 2.68-.96.83 1.3 1.39 2.79 1.55 4.39z"
											/><path
												d="m16.917 24c-.005 0-.011 0-.017 0-.316-.007-.594-.212-.694-.513l-3.167-9.5c-.09-.27-.02-.567.181-.768.201-.202.498-.272.768-.181l9.5 3.167c.3.1.505.378.513.694.007.316-.185.604-.481.717l-4.263 1.64-1.64 4.263c-.112.291-.391.481-.7.481z"
											/></svg
										>
									</a>
								{/if}
							</div>
						{/if}
					</div>
				</div>
				{#if store.pictures && store.pictures.length > 0}
					<h3 class="font-bold uppercase border-b border-gray-300 xl:w-1/2 pb-2">Galerie d'images</h3>
					<div class="relative w-full py-6 m-auto" style="max-width: 600px;">
						<PictureSlider elements={store.pictures ? store.pictures.map((p) => ({ url: p.large })) : []} />
					</div>
				{/if}
				<Tabs>
					<TabList>
						{#each tabs as tab}
							<Tab>{tab.label}</Tab>
						{/each}
					</TabList>
					<TabPanel>
						{#if store.producers && store.producers.length > 0}
							<div
								class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
          xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0"
							>
								{#each store.producers as producer}
									<ProducerCard {producer} clicked={() => openGMap(producer)} />
								{/each}
							</div>
						{:else}
							<p>Ce magasin ne vends pas de produits des producteurs proches de vous</p>
						{/if}
					</TabPanel>

					<!--<TabPanel>
						<div class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
          xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0">
							{#each store.products as product}
								<ProductCard {product} displayPriceData={false}/>
							{/each}
						</div>
					</TabPanel>-->

					<TabPanel>
						{#if store.openingHours && store.openingHours.length > 0}
							<div
								class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
          xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0"
							>
								<ul>
									{#each store.openingHours as openingHour, index}
										<li
											class="mb-2 border-gray-300"
											class:pb-2={index !== store.openingHours.length - 1}
											class:border-b={index !== store.openingHours.length - 1}
										>
											<p style="min-width: 100px;">
												Le {DayOfWeekKind.label(openingHour.day)} entre {`${timeSpanToFrenchHour(
													openingHour.from
												)} et ${timeSpanToFrenchHour(openingHour.to)}`}
											</p>
										</li>
									{/each}
								</ul>
							</div>
						{:else}
							<p>Ce magasin n'a pas renseigné ses horaires d'ouverture</p>
						{/if}
					</TabPanel>
				</Tabs>
			{/if}
		</div>

		{#if $selectedItem}
			<div
				id="product-details"
				transition:fly={{ x: -600, duration: 300 }}
				class="fixed active overflow-y-scroll overflow-x-hidden shadow left-0 top-0
        h-screen product-details bg-white"
				style="z-index: 10; padding-bottom: 70px;"
			>
				<ProductDetails displayPriceData={false} />
			</div>
		{/if}

		{#if authInstance.isInRole([Roles.Consumer, Roles.Anonymous])}
			<Cart />
		{/if}
	{/if}
</TransitionWrapper>

<style lang="scss">
	.social-medias a {
		width: 30px;
	}

	.social-medias a:not(:last-child) {
		margin-right: 1rem;
	}

	.products-grid {
		padding-bottom: 65px;
		@media (min-width: 1650px) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

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

	$product-details-panel-size: 600px;

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

</style>
