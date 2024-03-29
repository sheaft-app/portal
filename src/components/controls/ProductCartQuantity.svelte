<script>
	import { onMount } from "svelte";
	import cart from "./../../stores/cart";
	import { fly } from "svelte/transition";
	import debounce from "lodash/debounce";

	export let productId,
		plusButtonActive = false,
		userFeedback = false,
		noMargin = false,
		minQuantity = 0,
		timeout = null,
		disabled = false,
		center = true;

	let quantity = 0;
	let displayFeedback = false;
	$: isDisabled = disabled || $cart.isSaving || $cart.conflicts.length > 0;
	$: product = $cart.products.filter((p) => p.producer).find((i) => i.id === productId);

	onMount(() => {
		displayFeedback = false;
	});

	const handleLess = () => {
		if (quantity !== minQuantity) {
			quantity = (quantity || 1) - 1;
		}

		updateProductQuantity(quantity, productId);
	};

	const handleMore = () => {
		if (quantity >= 999) return;

		quantity = (quantity || 0) + 1;

		updateProductQuantity(quantity, productId);
	};

	const handleInput = (e) => {
		if (e.target.value.length > e.target.maxLength) {
			e.target.value = e.target.value.slice(0, e.target.maxLength);
		}

		if (e.target.value < minQuantity) {
			e.target.value = minQuantity;
		}

		updateProductQuantity(parseInt(e.target.value), productId);
	};

	// si l'utilisateur appuie sur + ou -, le debounce va provoquer l'attente. Or, si ProductCartQuantity se démonte
	// avant l'exécution de la fonction, alors productId n'est plus défini. On passe donc directement la valeur de productId
	// à la fonction comme paramètre pour éviter un problème lié à un unmount triggered "trop tôt"
	const updateProductQuantity = debounce(async (quantity, _productId) => {
		await cart.updateProduct(_productId, quantity);
		if (userFeedback) triggerFeedback();
	}, 800);

	const triggerFeedback = () => {
		displayFeedback = true;

		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(() => {
			displayFeedback = false;
		}, 2000);
	};

	// reset de la quantité
	$: if (!productId) quantity = 0;
	$: product ? (quantity = product.quantity) : (quantity = 0);
</script>

<div class="m-auto {!noMargin ? 'lg:mt-4 lg:mb-4' : ''}">
	<div
		class="flex {center ? 'm-auto' : ''} border-gray-100 shadow border-solid rounded-full product-quantity"
		class:disabled={isDisabled}
	>
		<button
			disabled={quantity === minQuantity || isDisabled}
			style="height: 36px;"
			type="button"
			aria-label="Retirer 1"
			class:disabled={isDisabled}
			class="font-bold
      transition duration-300 ease-in-out text-sm w-full rounded-l-full focus:outline-none  {quantity > minQuantity
				? 'hover:bg-accent hover:text-white'
				: ''} text-accent"
			on:click|stopPropagation={() => handleLess()}
		>
			-
		</button>
		<input
			min="0"
			max="999"
			type="number"
			disabled={isDisabled}
			on:click|stopPropagation
			on:input={(e) => handleInput(e)}
			maxLength="3"
			bind:value={quantity}
			class:font-bold={quantity > 0}
			class="text-center w-full border-none rounded-none p-1 text-sm lg:text-base"
		/>
		<button
			type="button"
			style="height: 36px;"
			class:disabled={isDisabled}
			disabled={isDisabled}
			class="font-bold
      transition duration-300 ease-in-out text-sm w-full rounded-r-full focus:outline-none text-accent hover:bg-accent hover:text-white"
			aria-label="Ajouter 1"
			class:active={plusButtonActive}
			on:click|stopPropagation={(e) => handleMore(e)}
		>
			+
		</button>
	</div>
	<div onselectstart="return false" class="mt-2 relative hidden lg:block">
		{#if quantity > 0 && displayFeedback}
			<div
				onselectstart="return false"
				transition:fly|local={{ y: -30 }}
				class="text-sm text-center absolute w-full"
			>
				<p>x{quantity} dans le panier</p>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	button:active {
		transform: scale(0.9);
	}
	.product-quantity {
		max-width: 200px;

		input {
			max-width: 80px;
		}
	}

	@media (max-width: 1024px) {
		.product-quantity {
			max-width: 130px;

			input {
				max-width: 50px;
			}
		}
	}

	.plusButton,
	.minusButton {
		&:hover {
			background-color: #009688;
			@apply text-white;
		}

		&.active {
			background-color: #009688;
			@apply text-white;

			&:hover {
				background-color: #009688;
			}
		}
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type="number"] {
		-moz-appearance: textfield;
	}
</style>
