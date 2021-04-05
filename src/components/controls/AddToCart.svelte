<script>
  import ProductCartQuantity from "./ProductCartQuantity.svelte";
  import cart from "./../../stores/cart";
  import Icon from "svelte-awesome";
  import { faShoppingCart, faSpinner } from "@fortawesome/free-solid-svg-icons";

  export let product, disabled, showIsInCartInfo = true;

  let state = 0;
  
  const addToCart = (_productId) => {
    if (disabled || $cart.isSaving) return;
    cart.updateProduct(_productId, 1);
  }

  $: state = $cart.products.find((i) => i.id == product.id) ? 1 : 0;
</script>

{#if state == 1}
  <ProductCartQuantity
    center={false}
    productId={product.id}
  />
  <p class="text-green-500 text-sm">Dans le panier</p>
{:else}
  <button class="btn btn-lg btn-accent" class:disabled={disabled || $cart.isSaving} disabled={disabled || $cart.isSaving} type="button" on:click={() => addToCart(product.id)}>
    {#if $cart.isSaving}
      <Icon data={faSpinner} spin class="mr-2 hidden md:inline" />
    {:else}
      <Icon data={faShoppingCart} class="mr-2 hidden md:inline" />
    {/if}
    Ajouter au panier
  </button>
{/if}
