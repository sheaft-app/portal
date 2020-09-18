<script>
  import { onMount, onDestroy } from "svelte";
  import { flip } from 'svelte/animate';
  import { slide, fly } from "svelte/transition";
  import GetRouterInstance from "../../services/SheaftRouter";
  import { cartItems, cartExpanded } from "./../../stores/app.js";
  import { roundMoney } from "./../../helpers/app.js";
  import CartRoutes from "../cart/routes";
  import { unfreezeBody } from "./../../helpers/app.js";

  const routerInstance = GetRouterInstance();

  $: if ($cartItems.length > 0) {
    $cartItems = $cartItems.filter(cartItem => cartItem.quantity > 0);
    localStorage.setItem("user_cart", JSON.stringify($cartItems));
  }

  $: productsCount = $cartItems.reduce((sum, product) => {
    return sum + (product.quantity || 0);
  }, 0);
  
  $: total = $cartItems.reduce((sum, product) => {
    return roundMoney(parseFloat(sum) + product.onSalePricePerUnit * product.quantity || 0);
  }, 0);

  const hideCart = () => {
    unfreezeBody();
    cartExpanded.set(false);
  }

  var popStateListener = (event) => {
    if ($cartExpanded) {
      return hideCart();
    }
  }

  $: if ($cartExpanded) { history.pushState({ cartExpanded: $cartExpanded }, "Aperçu du panier"); }

  onMount(() => {
    window.addEventListener("popstate", popStateListener, false);
  })

  onDestroy(() => {
    window.removeEventListener("popstate", popStateListener, false);
  })
</script>

<section
  class="my-4 cart-items"
  style="margin-bottom: 125px; overflow-y: auto; overflow-x: hidden;">
  {#each $cartItems as line (line.id)}
    <div
      in:fly|local="{{duration: 300}}"
      out:slide|local="{{duration: 300}}"
      animate:flip="{{duration: 300}}"
      class={`py-2 justify-between px-2 flex border-b border-gray-200 border-solid`}>
      <div
        class="w-1/12 h-12 text-right leading-none"
        style="margin-right: 12px; max-width: 26px;">
        <span>{line.quantity}</span>
      </div>
      <div class="w-9/12">
        <p class="font-semibold mb-0 leading-none">{line.name}</p>
        <p class="text-sm">{line.producer.name}</p>
        <button class="btn-link text-xs uppercase" on:click={() => { 
          line.quantity = 0; 
          if ($cartItems.length <= 1) { 
            hideCart();
          }
        }} aria-label="Retirer cet article">
          Retirer
        </button>
      </div>
      <div class="w-2/12 text-right">
        <p class="font-bold leading-none">
          {roundMoney(line.onSalePricePerUnit * line.quantity)}€
        </p>
      </div>
    </div>
  {:else}
    <div class="text-gray-600 text-center px-3 text-sm">Les produits dans votre panier s'afficheront ici à mesure que vous les ajoutez.</div>
  {/each}
</section>
<div
  class="fixed bottom-0 py-2 px-3 border-t border-gray-400 border-solid bg-white
  bottom-items"
  class:opacity-50={$cartItems.length === 0}>
  <div class="flex justify-between items-center">
    <div class="uppercase">
      <p class="text-sm text-gray-600">{productsCount} articles</p>
      <p class="text-xl">
        Total:
        <span class="font-bold">{total}€</span>
      </p>
    </div>
    <button
      type="button"
      aria-label="Suivant"
      on:click={() => routerInstance.goTo(CartRoutes.Resume)}
      class="btn btn-primary btn-lg leading-none"
      disabled={$cartItems.length === 0}
      class:disabled={$cartItems.length === 0}>
      Suivant
    </button>
  </div>
</div>

<style>
  .bottom-items {
    width: 350px;
  }

  .cart-items {
    max-height: calc(100% - 345px);
  }
  
  @media (max-width: 1024px) {
    .cart-items {
      max-height: calc(100% - 326px);
    }

    .bottom-items {
      width: 100%;
    }
  }
</style>
