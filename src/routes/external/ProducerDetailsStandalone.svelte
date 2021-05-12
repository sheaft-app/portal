<script>
	import {getContext, onMount} from "svelte";
	import ProducerReadMoreModal from "./ProducerReadMoreModal.svelte";
	import Icon from "svelte-awesome";
	import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
	import {fly} from "svelte/transition";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import ProductCard from "../search-products/ProductCard.svelte";
	import Cart from "../search-products/Cart.svelte";
	import SearchProductsRoutes from "../search-products/routes";
	import ProductDetails from "../search-products/ProductDetails.svelte";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import {GET_PRODUCER_DELIVERIES, GET_PRODUCER_PROFILE, GET_PRODUCER_PRODUCTS} from "./queries.js";
	import GetAuthInstance from "../../services/SheaftAuth.js";
	import GetGraphQLInstance from "../../services/SheaftGraphQL.js";
	import {timeSpanToFrenchHour} from "../../helpers/app.js";
	import DayOfWeekKind from "../../enums/DayOfWeekKind";
	import Roles from "../../enums/Roles";
	import SheaftErrors from "../../services/SheaftErrors";
	import DeliveryKind from "../../enums/DeliveryKind";
	import {groupBy, encodeQuerySearchUrl} from "../../helpers/app";
	import "leaflet/dist/leaflet.css";
	import {Tabs, Tab, TabList, TabPanel} from 'svelte-tabs';
	import {selectedItem} from "../../stores/app.js";
	import SkeletonCard from "../search-products/SkeletonCard.svelte";
	import {format} from "date-fns";
	import fr from "date-fns/locale/fr";
	import AccountRoutes from "../account/routes";
	import Meta from "../../components/Meta.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();
	const graphQLInstance = GetGraphQLInstance();
	const {open} = getContext('modal');

	export let params = {};

	let producer = null;
	let isLoading = true;
	let deliveries = [];

	const tabs = [
		{id: 'data', icon: '', label: 'Produits'},
		{id: 'layout', icon: 'fas fa-arrows-alt', label: 'Points de retrait'}
	];

	onMount(async () => {
		window.scrollTo(0, 0);
		await getProducerDetails(params.id);
	})

	const getProducerDetails = async id => {
		isLoading = true;
		let res = await graphQLInstance.query(GET_PRODUCER_PROFILE, {id: id}, errorsHandler.Uuid);
		if (!res.success) {
			isLoading = false;
			return;
		}

		producer = res.data;

		let deliveriesResult = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, {
			input: [params.id]
		}, errorsHandler.Uuid);

		if (!deliveriesResult.success || deliveriesResult.data.length == 0) {
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

		isLoading = false;
	};

	const openReadMoreModal = () => {
		open(ProducerReadMoreModal, {
			producer
		})
	}

	$: metadata = {
			title: producer ? producer.name : null,
			description: producer && producer.summary ? producer.summary : null,
			image: producer && producer.picture ? producer.picture : null,
	};
</script>

<Meta metadata={metadata}/>

<TransitionWrapper hasRightPanel>
	<div class="container m-auto">
		{#if !authInstance.isInRole([Roles.Producer.Value])}
			<button
				class="text-gray-600 items-center flex uppercase mb-2"
				on:click={() => routerInstance.goTo(SearchProductsRoutes.Search)}>
				<Icon data={faChevronLeft} scale=".8" class="mr-2 inline"/>
				Retourner à la recherche
			</button>
		{:else if authInstance.isInRole([Roles.Producer.Value])}
			<div class="mb-3 p-4 text-white bg-blue-500 rounded">
				<p>Vous pouvez partager le lien présent dans votre barre de navigation sur votre site ou sur vos réseaux pour avoir une référence directe vers votre boutique.</p>
				<p>Si certaines informations sont incorrectes, dirigez-vous sur votre profil en <a href="javascript:void(0)" on:click={() => routerInstance.goTo(AccountRoutes.Profile)}>cliquant ici</a>.</p>
			</div>
		{/if}
		{#if !producer && !isLoading}
			<h3 class="font-bold uppercase border-b border-gray-300 xl:w-1/2 pb-2">Mince !</h3>
			<p>Nous n'avons pas réussi à trouver ce producteur.</p>
		{:else if !producer || isLoading}
			<div class="flex flex-wrap mt-5 mb-5 justify-center xl:justify-between">
				<div
					class="h-20 w-20 md:h-32 md:w-32 rounded-full p-1 md:mx-0 skeleton-box"/>
				<div class="w-full xl:w-10/12 xl:pl-3 text-center xl:text-left mt-3 xl:mt-0">
					<div class="w-64 h-6 mb-3 skeleton-box border-b border-gray-300 pb-2 m-auto xl:mx-0"/>
					<div class="flex flex-wrap justify-between w-full pt-2" style="align-items: baseline;">
						<div class="w-full h-32 skeleton-box"/>
						<!-- <div class="w-full xl:w-auto">
							<div class="w-64 h-32 skeleton-box" />
						</div> -->
					</div>
					<div class="flex flex-row flex-wrap social-medias justify-center xl:justify-start">
						<div class="h-6 w-6rounded-full skeleton-box"/>
						<div class="h-6 w-6rounded-full skeleton-box"/>
						<div class="h-6 w-6rounded-full skeleton-box"/>
					</div>
				</div>
			</div>
			<div class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
      xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0">
				{#each Array(9) as _i}
					<SkeletonCard/>
				{/each}
			</div>
		{:else}
			<div class="flex flex-wrap mt-5 mb-5 justify-center xl:justify-between">
				<img
					class="h-20 w-20 md:h-32 md:w-32 rounded-full p-1 md:mx-0 border
          border-gray-800 border-solid"
					src={producer.picture ? producer.picture : 'img/icons/farmer.svg'}
					alt="Photo du producteur"/>
				<div class="w-full xl:w-10/12 xl:pl-3 text-center xl:text-left mt-3 xl:mt-0">
					<h3 class="font-bold uppercase border-b border-gray-300 xl:w-1/2 pb-2">{producer.name}</h3>
					<div class="flex flex-wrap justify-between w-full pt-2 xl:-mt-6 xl:pt-2" class:xl:-mt-6={producer.summary}
							 style="align-items: baseline;">
						{#if producer.summary}
							<div class="w-full xl:w-7/12">
								<p class="text-sm">{producer.summary}</p>
								{#if producer.description}
									<button on:click={openReadMoreModal} class="btn btn-link mt-2 m-auto xl:mx-0">Lire plus</button>
								{/if}
							</div>
						{/if}
						<div class:xl:w-auto={producer.summary} class="w-full mt-3 xl:mt-0">
							<div class="bg-white shadow-md rounded p-4 px-5 w-full">
								<div class="flex flex-row justify-center xl:justify-between items-start mb-3">
									<div>
										<p class="font-semibold">Site de production</p>
										<p>{producer.address.line1}</p>
										{#if producer.address.line2}
											<p>{producer.address.line2}</p>
										{/if}
										<p>{producer.address.zipcode} {producer.address.city}</p>
										<a
											class="mt-1"
											target="_blank"
											href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(producer.address)}`}>
											Voir sur Google Maps
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
					{#if producer.facebook || producer.instagram}
						<p class="text-gray-600 mb-2 text-sm mt-4" class:xl:mt-0={producer.summary}>Retrouvez-nous sur les réseaux
							sociaux !</p>
						<div class="flex flex-row flex-wrap social-medias justify-center xl:justify-start">
							{#if producer.facebook}
								<a href={producer.facebook} target="_blank">
									<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1877F2"><title>
										Facebook</title>
										<path
											d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"/>
									</svg>
								</a>
							{/if}
							{#if producer.instagram}
								<a href={producer.instagram} target="_blank">
									<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#E4405F"><title>
										Instagram</title>
										<path
											d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
									</svg>
								</a>
							{/if}
						</div>
					{/if}
				</div>
			</div>
			<Tabs>
				<TabList>
					{#each tabs as tab}
						<Tab>{tab.label}</Tab>
					{/each}
				</TabList>

				<TabPanel>
					<div class="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2
          xl:grid-cols-3 md:gap-3 -mx-4 md:mx-0">
						{#each producer.products as product}
							<ProductCard {product} displayProducerData={false} useAddToCartButtonCTA={true}/>
						{/each}
					</div>
				</TabPanel>

				<TabPanel>
					<div class="lg:w-2/3 w-full">
						<div
							class="bg-white overflow-hidden rounded-l p-3 lg:p-6 shadow
              relative">
							{#if producer.closings.length > 0}
								<p class="text-orange-500 font-semibold">Tous les points de retrait seront fermés aux dates suivantes
									: </p>
								<ul style="list-style: circle;padding: revert;">
									{#each producer.closings as closing}
										<li>du {format(new Date(closing.from), 'PPPP', {locale: fr})}
											au {format(new Date(closing.to), 'PPPP', {locale: fr})}</li>
									{/each}
								</ul>
							{/if}
							{#each deliveries as delivery}
								<div class="bg-gray-100 rounded-lg p-4 px-5 mt-2 w-full">
									<div class="flex flex-row justify-between items-start mb-3">
										<div>
											<p class="font-semibold">{DeliveryKind.label(delivery.kind)}</p>
											{#if delivery.address}
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
											{/if}
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
									{#if delivery.closings.length > 0}
										{#if producer.closings.length > 0}
											<p class="font-semibold text-orange-500">En plus des dates de fermeture citées plus haut, ce point
												sera fermé aux dates suivantes :</p>
										{:else}
											<p class="font-semibold text-orange-500">Ce point sera fermé aux dates suivantes :</p>
										{/if}
										<ul style="list-style: circle;padding: revert;">
											{#each delivery.closings as closing}
												<li>du {format(new Date(closing.from), 'PPPP', {locale: fr})}
													au {format(new Date(closing.to), 'PPPP', {locale: fr})}</li>
											{/each}
										</ul>
									{/if}
								</div>
							{:else}
								<p class="text-gray-600">Il semblerait que ce producteur n'ait aucun point de récupération.</p>
							{/each}
						</div>
					</div>
					<div class="lg:w-1/3 w-full">
						<!-- <div id="map" class="rounded-r shadow lg:h-full" style="z-index: 0;" /> -->
					</div>
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
			style="z-index: 10; padding-bottom: 70px;">
			<ProductDetails displayProducerData={false}/>
		</div>
	{/if}

	<Cart/>
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
