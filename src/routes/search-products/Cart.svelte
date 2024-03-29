<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetAuthInstance from "../../services/SheaftAuth";
	import { cartExpanded, selectedItem } from "./../../stores/app.js";
	import cart from "./../../stores/cart";
	import { formatMoney } from "./../../helpers/app.js";
	import ProductMap from "./../../components/ProductMap.svelte";
	import CartRoutes from "../cart/routes";
	import { freezeBody, unfreezeBody } from "./../../helpers/app.js";
	import Icon from "svelte-awesome";
	import {
		faChevronRight,
		faCircleNotch,
		faSpinner,
		faShoppingCart,
		faInfoCircle,
	} from "@fortawesome/free-solid-svg-icons";
	import CartConflictResolveModal from "./CartConflictResolveModal.svelte";

	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();
	const { open } = getContext("modal");

	export let userPosition, hoveredProduct;

	let loadToCart = false;

	const hideCart = () => {
		unfreezeBody();
		cartExpanded.set(false);
	};

	const expendCart = () => {
		if ($cartExpanded) {
			return hideCart();
		}

		cartExpanded.set(!$cartExpanded);
		freezeBody();
	};

	const popStateListener = (event) => $cartExpanded && hideCart();

	const goToCart = () => {
		if (authInstance.authenticated) {
			return routerInstance.goTo(CartRoutes.Resume);
		}

		loadToCart = true;
		return authInstance.login(CartRoutes.Resume.Path);
	};

	$: if ($cartExpanded) {
		history.pushState({ cartExpanded: $cartExpanded }, "Aperçu du panier");
	}

	const openCartConflictResolveModal = () => open(CartConflictResolveModal);

	onMount(() => {
		if (localStorage.getItem("user_location") && !userPosition) {
			userPosition = JSON.parse(localStorage.getItem("user_location"));
		}

		window.addEventListener("popstate", popStateListener, false);
	});

	onDestroy(() => {
		window.removeEventListener("popstate", popStateListener, false);
	});
</script>

<!-- Mobile -->
<div
	class:active={$cart.products.length > 0}
	class="fixed bottom-0 py-2 px-4 md:px-8 border-t border-gray-400 border-solid
		bg-white w-full left-0 block xl:hidden bottom-mobile-cta transition
		duration-500 ease-in-out"
>
	<div class="flex justify-between items-center">
		<div class="text-lg uppercase">
			<p class="text-sm text-gray-600">{$cart.productsCount} articles</p>
			<p class="truncate">
				Total:
				<span class="font-bold">{formatMoney($cart.totalOnSalePrice)}</span>
			</p>
		</div>
		<div class="inline-flex items-center w-2/4 justify-end">
			<button
				type="button"
				on:click={() => expendCart()}
				class="text-xs bg-white shadow font-semibold uppercase h-10 rounded-full
					px-4 py-2 leading-none mr-2 w-3/4"
				class:invisible={$selectedItem}
				disabled={$cart.products.length == 0}
				class:disabled={$cart.products.length == 0}
			>
				{$cartExpanded ? "Fermer" : "Aperçu"}
			</button>
			<button
				on:click={goToCart}
				type="button"
				disabled={$cart.products.length == 0 || loadToCart}
				class="bg-accent shadow text-white font-semibold uppercase h-10
					rounded-full leading-none flex items-center justify-center"
				class:disabled={$cart.products.length == 0 || loadToCart}
				style="width: 4em;"
			>
				{#if loadToCart}
					<Icon data={faCircleNotch} spin />
				{:else}
					<Icon data={faShoppingCart} />
				{/if}
			</button>
		</div>
	</div>
</div>
<div
	class="fixed overflow-hidden shadow right-0 top-0 bg-gray-100 h-screen w-3/12
		transition duration-300 ease-in-out cart-panel"
	class:active={$cartExpanded}
>
	<ProductMap id="products-map" height="200px" {userPosition} {hoveredProduct} />
	<section
		class="mb-4 cart-items"
		class:mt-4={!$cart.isSaving && !$cart.warningInfo}
		style="margin-bottom: 125px; overflow-y: auto; overflow-x: hidden;"
	>
		{#if $cart.isSaving}
			<div class="bg-green-500 text-white py-1 text-center" style="width: 350px;">
				<Icon data={faSpinner} spin class="mr-2" />
				<span>Sauvegarde du panier...</span>
			</div>
		{/if}
		{#if $cart.warningInfo}
			<div class="bg-orange-500 text-white py-1 text-center" style="width: 350px;">
				<Icon data={faInfoCircle} class="mr-2" />
				<span>{$cart.warningInfo}</span>
			</div>
		{/if}
		{#if !$cart.isInitializing}
			{#if $cart.conflicts.length > 0}
				<div class="m-auto text-center p-3">
					<p class="text-orange-500 font-semibold text-xl">Des paniers s'entremêlent</p>
					<span class="bg-orange-500 m-auto h-1 w-20 block mt-2 mb-4" />
					<p>
						Il semblerait que vous ayez plusieurs paniers en cours. Pas de panique, il vous suffit d'en
						choisir un des deux pour continuer vos achats.
					</p>
					<button class="btn btn-lg btn-accent m-auto mt-5" on:click={openCartConflictResolveModal}
						>Choisir un panier</button
					>
				</div>
			{:else}
				{#each $cart.products.filter((p) => p.producer) as line (line.id)}
					<div
						transition:fly|local={{ duration: 300 }}
						animate:flip={{ duration: 300 }}
						class="py-2 justify-between px-2 flex border-b border-gray-200 border-solid"
					>
						<div
							class="w-1/12 h-12 text-right leading-none"
							class:skeleton-box={$cart.isSaving}
							style="margin-right: 12px; max-width: 26px;"
						>
							<span>{line.quantity}</span>
						</div>
						<div class="w-9/12">
							<p class="font-semibold mb-0 leading-none">{line.name}</p>
							<p class="text-sm">{line.producer.name}</p>
							<button
								class="btn-link text-xs uppercase"
								on:click={() => {
									cart.removeProduct(line.id);
									if ($cart.products.length <= 1) {
										hideCart();
									}
								}}
								aria-label="Retirer cet article"
							>
								Retirer
							</button>
						</div>
						<div class="w-2/12 text-right">
							<p class="font-bold leading-none" class:skeleton-box={$cart.isSaving}>
								{formatMoney(line.unitOnSalePrice * line.quantity)}
							</p>
						</div>
					</div>
				{:else}
					<div class="text-gray-600 text-center px-3 text-sm">
						Les produits de votre panier s'affichent ici à mesure que vous les ajoutez.
					</div>
				{/each}
			{/if}
		{/if}
	</section>
	<div
		class="fixed bottom-0 py-2 px-3 border-t border-gray-400 border-solid bg-white
    bottom-items"
		class:opacity-50={$cart.products.length == 0}
	>
		<div class="flex justify-between items-center">
			<div class="uppercase w-full">
				<p class="text-sm text-gray-600">{$cart.productsCount} articles</p>
				<p class="text-xl">
					Total:
					<span class="font-bold">{formatMoney($cart.totalOnSalePrice)}</span>
				</p>
			</div>
			<div class="w-full">
				<button
					type="button"
					aria-label="Suivant"
					on:click={goToCart}
					class="btn btn-primary w-full py-3 px-3 leading-none justify-center text-lg font-semibold"
					disabled={$cart.products.length == 0 || $cart.isSaving || $cart.conflicts.length > 0 || loadToCart}
					class:disabled={$cart.products.length == 0 ||
						$cart.isSaving ||
						$cart.conflicts.length > 0 ||
						loadToCart}
				>
					Suivant
					{#if loadToCart}
						<Icon class="ml-2" data={faCircleNotch} spin />
					{:else}
						<Icon class="ml-2" data={faChevronRight} />
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	$cart-panel-size: 350px;

	.cart-panel {
		top: 64px;
		z-index: 3;
		width: $cart-panel-size;

		.bottom-items {
			width: $cart-panel-size;
		}

		.cart-items {
			max-height: calc(100% - 345px);
		}
	}

	@media (max-width: 1024px) {
		.cart-panel {
			top: 45px;
			transform: translateY(100%);
			.cart-items {
				max-height: calc(100% - 326px);
			}

			&.active {
				width: 100%;
				transform: translateY(0px);

				.bottom-items {
					width: 100%;
				}
			}
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
