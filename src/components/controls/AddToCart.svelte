<script>
  import { onMount } from "svelte";
  import ProductCartQuantity from "./ProductCartQuantity.svelte";
  import cartStore from "./../../stores/cart";
  import Icon from "svelte-awesome";
  import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

  export let product, disabled;

  let state = 0;
  
  const addToCart = () => { 
    if (disabled) return;
    cartStore.addItem(product.id);
  }

  $: state = $cartStore.items.find((i) => i.id == product.id) ? 1 : 0;
</script>

{#if state == 1}
  <ProductCartQuantity
    center={false}
    productId={product.id}
  />
  <p class="text-green-500 text-sm">Dans le panier</p>
{:else}
  <button class="btn btn-lg btn-accent" class:disabled {disabled} on:click={addToCart}>
    <Icon data={faShoppingCart} class="mr-2" />
    Ajouter au panier
  </button>
{/if}