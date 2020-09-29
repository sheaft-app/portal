<script>
  import { cartItems, searchResults } from "./../../stores/app.js";
  import { fly } from "svelte/transition";

  export let productId, plusButtonActive = false, userFeedback = false, noMargin = false, minQuantity = 0;

  let product = $cartItems.find(c => c.id === productId);
  let quantity = 0;
  let displayFeedback = false;

  let timeout = null;

  const handleLess = () => {
    if (quantity !== minQuantity) {
      quantity = (quantity || 1) - 1;
    }

    updateProductQuantity(quantity);
  };

  const handleMore = () => {
    if (quantity >= 999) return;

    quantity = (quantity || 0) + 1;

    updateProductQuantity(quantity);
  };

  const handleInput = e => {
    if (e.target.value.length > e.target.maxLength) {
      e.target.value = e.target.value.slice(0, e.target.maxLength);
    }

    if (e.target.value < minQuantity) {
      e.target.value = minQuantity;
    }

    updateProductQuantity(parseInt(e.target.value));
  };

  const updateProductQuantity = quantity => {
    if (!product) {
      product = $searchResults.find(p => p.id === productId);
      $cartItems = [product, ...$cartItems];
    }

    product.quantity = quantity;
    $cartItems = $cartItems;

    if (userFeedback)
      triggerFeedback();
  };

  const triggerFeedback = () => {
    displayFeedback = true;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      displayFeedback = false;
    }, 2000)
  }

  // reset de la quantité
  $: if (!productId) quantity = 0;

  $: {
    product = $cartItems.find(c => c.id === productId);
    product ? (quantity = product.quantity) : (quantity = 0);
  }
</script>

<div class="m-auto {!noMargin ? "lg:mt-4 lg:mb-4" : ""}">
  <div
    class="flex m-auto border-gray-100 shadow border-solid rounded-full product-quantity">
    <button
      disabled={quantity === minQuantity}
      style="height: 36px;"
      type="button"
      aria-label="Retirer 1"
      class="font-bold
      transition duration-300 ease-in-out text-sm w-full rounded-l-full focus:outline-none  {quantity > minQuantity ? 'hover:bg-accent hover:text-white' : ''} text-accent"
      on:click|stopPropagation={() => handleLess()}>
      -
    </button>
    <input
      min="0"
      max="999"
      type="number"
      on:click|stopPropagation
      on:input={e => handleInput(e)}
      maxLength="3"
      bind:value={quantity}
      class:font-bold={quantity > 0}
      class="text-center w-full border-none rounded-none p-1 text-sm lg:text-base" />
    <button
      type="button"
      style="height: 36px;"
      class="font-bold
      transition duration-300 ease-in-out text-sm w-full rounded-r-full focus:outline-none text-accent hover:bg-accent hover:text-white"
      aria-label="Ajouter 1"
      class:active={plusButtonActive}
      on:click|stopPropagation={() => handleMore()}>
      +
    </button>
  </div>
  <div onselectstart="return false" class="mt-2 relative hidden lg:block">
    {#if quantity > 0 && displayFeedback}
      <div transition:fly={{ y: -30 }} class="text-sm text-center absolute w-full">
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
  input[type=number] {
    -moz-appearance: textfield;
  }
</style>
