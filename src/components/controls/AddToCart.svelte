<script>
  import { onMount } from "svelte";
  import ProductCartQuantity from "./ProductCartQuantity.svelte";
  import { cartItems } from "./../../stores/app";
  import Icon from "svelte-awesome";
  import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

  export let product, disabled;

  let state = 0;

  onMount(() => {
    if ($cartItems.find((c) => c.id == product.id)) {
      state = 1;
    }
  })

  const addToCart = () => { 
    if (disabled) return;
    
    $cartItems = [product, ...$cartItems];
    product.quantity = 1;
    $cartItems = $cartItems;

    localStorage.setItem("user_cart", JSON.stringify($cartItems));

    state = 1;
  }

  $: if (!$cartItems.find((c) => c.id == product.id)) {
    state = 0;
  }
</script>

{#if state == 1}
  <ProductCartQuantity
    center={false}
    productId={product.id}
  />
  {#if product.quantity !== 0}
    <p class="text-green-500 text-sm">Dans le panier</p>
  {/if}
{:else}
  <button class="btn btn-lg btn-accent" class:disabled {disabled} on:click={addToCart}>
    <Icon data={faShoppingCart} class="mr-2" />
    Ajouter au panier
  </button>
{/if}