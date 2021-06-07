<script>
	import { onMount, createEventDispatcher, getContext } from "svelte";
	import Icon from "svelte-awesome";
	import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
	import SwiperCore, { Navigation } from "swiper";
	import ProductCartQuantity from "./controls/ProductCartQuantity.svelte";
	import { Swiper, SwiperSlide } from "swiper/svelte";
	import cart from "./../stores/cart";
	import { formatMoney } from "./../helpers/app.js";
	import { formatConditioningDisplay } from "./../helpers/app";
	import RatingStars from "./rating/RatingStars.svelte";
	import GetAuthInstance from "./../services/SheaftAuth.js";
	import { GET_PRODUCER_PRODUCTS } from "./queries.js";
	import Loader from "./Loader.svelte";

	export let productParentId,
		producerName,
		producerId,
		errorsHandler,
		breakpoints = null,
		displayPriceData = true;

	const { query } = getContext("api");
	const dispatch = createEventDispatcher();
	const authInstance = GetAuthInstance();

	let swipper = null;
	let products = [];
	let isLoading = true;
	let isEnd = false,
		isBeginning = false;

	onMount(async () => {
		isLoading = true;
		if (producerId) {
			await query({
				query: GET_PRODUCER_PRODUCTS,
				variables: { id: producerId },
				errorsHandler,
				success: (res) => (products = res.products ? res.products.filter((p) => p.id !== productParentId) : []),
				errorNotification: "Impossible de récupérer les autres produits du producteur",
			});
		}
		isLoading = false;
		SwiperCore.use([Navigation]);
	});

	const handleClickProduct = (e, id) => {
		dispatch("productClick", {
			id,
		});
	};

	const initSwipper = (e) => {
		swipper = e.detail[0];
		updateCursor();
	};

	const prev = () => {
		swipper.slidePrev();
		updateCursor();
	};

	const next = () => {
		swipper.slideNext();
		updateCursor();
	};

	const updateCursor = () => {
		isEnd = swipper.isEnd;
		isBeginning = swipper.isBeginning;
	};

	$: suggestedProductIsInCart = (product) => ($cart.products ? $cart.products.find((c) => c.id === product.id) : false);

</script>

{#if isLoading}
	<Loader />
{:else if products && products.length > 0}
	<p class="font-semibold pt-5 mb-3">
		{productParentId ? `Autres produits de ${producerName}` : `Produits de ${producerName}`}
	</p>
	<div class="relative">
		<Swiper
			threshold={6}
			preventClicks={false}
			preventClicksPropagation={true}
			breakpoints={{
				320: {
					slidesPerView: 1,
					spaceBetween: 0,
				},
				375: {
					slidesPerView: 2,
					spaceBetween: 10,
				},
				728: {
					slidesPerView: 3,
					spaceBetween: 10,
				},
				...breakpoints,
			}}
			spaceBetween={20}
			slidesPerView={2}
			on:swiper={initSwipper}
			on:slideChange={updateCursor}
		>
			{#each products as product}
				<SwiperSlide>
					<div
						class="border border-light rounded-lg h-full bg-white cursor-pointer"
						on:click={(e) => handleClickProduct(e, product.id)}
					>
						<div class="relative pb-5/6 overflow-hidden bg-black rounded-t-md block">
							{#if suggestedProductIsInCart(product)}
								<div
									class="absolute py-1 px-2  text-center text-normal text-xs bg-white w-75 rounded-lg"
									style="
                                line-height: 0;
                                z-index: 1;
                                top: 5px;
                                left: 5px;
                                box-shadow: rgba(0, 0, 0, .6) 0px 0px 5px 3px;"
								>
									<Icon data={faShoppingCart} style="width: 14px;" />
									Dans le panier
								</div>
							{/if}
							<div
								style="height: 95px; background-image: url({product.picture}); background-size: contain; background-position: top;background-repeat:no-repeat;"
								class:opacity-50={suggestedProductIsInCart(product)}
								class="transition duration-200 ease-in-out w-full rounded-t-md"
							>
								{#if product.picture.includes("pictures/tags/") && !suggestedProductIsInCart(product)}
									<div class="absolute" style="z-index: 1; top: 30%; margin:auto;">
										<div class="text-white text-sm p-2 bg-gray-800 text-center">Aucune image disponible</div>
									</div>
								{/if}
							</div>
						</div>
						<div class="relative block p-0">
							<div class="bg-white rounded-lg p-0 px-2 lg:p-4 w-full pb-4">
								<div style="width: 30px; right: 15px;" class="absolute">
									<!-- {#if product.tags.map(t => t.name).includes('bio')}
									<img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Bio" class="mb-1" />
									{/if} -->
									{#if product.isReturnable}
										<img src="./img/returnable.svg" alt="Consigné" class="mb-1" style="transform: scale(0.7);" />
									{/if}
								</div>
								<div class="py-2 lg:py-0 lg:pr-8">
									<h4 class="font-semibold text-base lg:text-lg leading-tight mb-0">
										{product.name}
									</h4>
									{#if product.rating}
										<div
											class="mt-2 md:mt-0 inline-flex items-center w-full text-xxs
                                lg:text-sm"
										>
											<RatingStars rating={product.rating} />
											<span class="text-gray-600 ml-2 hidden lg:block">
												{product.rating}
											</span>
										</div>
									{/if}
									{#if displayPriceData}
										<div
											class="text-base lg:text-lg w-full font-semibold mb-2
                                justify-between items-center block"
										>
											{#if authInstance.isInRole(["STORE", "PRODUCER"])}
												{formatMoney(product.wholeSalePricePerUnit)} HT
											{:else}
												{formatMoney(product.onSalePricePerUnit)}
											{/if}
											<span class="text-xxs lg:text-sm lg:inline hidden font-normal">
												{formatConditioningDisplay(product.conditioning, product.quantityPerUnit, product.unit)}
											</span>
										</div>
									{/if}
								</div>
								<div class="flex items-center justify-between">
									{#if displayPriceData && !authInstance.isInRole(["STORE", "PRODUCER"])}
										<div class="w-full">
											{#if product.available && product.onSalePricePerUnit && product.onSalePricePerUnit > 0}
												<ProductCartQuantity productId={product.id} />
											{:else}
												<div>Non disponible</div>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</SwiperSlide>
			{/each}
		</Swiper>
		<div class="swiper-button-next bg-accent" on:click={next} class:hidden={isEnd} />
		<div class="swiper-button-prev bg-accent" on:click={prev} class:hidden={isBeginning} />
	</div>
{:else}
	<p>Ce producteur ne possède pas de produits dans son catalogue</p>
{/if}
