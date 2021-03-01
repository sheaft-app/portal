<script>
  import { onMount, onDestroy } from "svelte";
  import { flip } from 'svelte/animate';
  import { slide, fly } from "svelte/transition";
  import GetRouterInstance from "../../services/SheaftRouter";
  import GetAuthInstance from "../../services/SheaftAuth";
  import { cartExpanded } from "./../../stores/app.js";
  import cartStore from "./../../stores/cart";
  import { formatMoney } from "./../../helpers/app.js";
  import CartRoutes from "../cart/routes";
  import { unfreezeBody } from "./../../helpers/app.js";
  import Icon from "svelte-awesome";
  import { faChevronRight, faCircleNotch } from "@fortawesome/free-solid-svg-icons";

  const routerInstance = GetRouterInstance();
  const authInstance = GetAuthInstance();

  let loadToCart = false;

  const hideCart = () => {
    unfreezeBody();
    cartExpanded.set(false);
  }

  var popStateListener = (event) => {
    if ($cartExpanded) {
      return hideCart();
    }
  }

  const goToCart = () => {
    if (authInstance.authenticated) {
      return routerInstance.goTo(CartRoutes.Resume);
    }
    
    loadToCart = true;
    return authInstance.login(CartRoutes.Resume.Path);
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

  {#if !$cartStore.isInitializing}
    {#each cartStore.getItemsWithData() as line (line.id)}
      <div
        transition:fly|local="{{duration: 300}}"
        animate:flip="{{duration: 300}}"
        class={`py-2 justify-between px-2 flex border-b border-gray-200 border-solid`}>
          {#if !line.name}
            <div>Attends...</div>
          {:else}
            <div
              class="w-1/12 h-12 text-right leading-none"
              style="margin-right: 12px; max-width: 26px;">
              <span>{line.quantity}</span>
            </div>
            <div class="w-9/12">
              <p class="font-semibold mb-0 leading-none">{line.name}</p>
              <p class="text-sm">{line.producer.name}</p>
              <button class="btn-link text-xs uppercase" on:click={() => { 
                cartStore.removeItem(line.id)
                if (cartStore.items.length <= 1) { 
                  hideCart();
                }
              }} aria-label="Retirer cet article">
                Retirer
              </button>
            </div>
            <div class="w-2/12 text-right">
              <p class="font-bold leading-none">
                {formatMoney(line.onSalePricePerUnit * line.quantity)}
              </p>
            </div>
          {/if}
      </div>
    {:else}
      <div class="text-gray-600 text-center px-3 text-sm">Les produits de votre panier s'affichent ici à mesure que vous les ajoutez.</div>
    {/each}
  {/if}
</section>
<div
  class="fixed bottom-0 py-2 px-3 border-t border-gray-400 border-solid bg-white
  bottom-items"
  class:opacity-50={cartStore.getIsEmpty()}>
  <div class="flex justify-between items-center">
    <div class="uppercase w-full">
      <p class="text-sm text-gray-600">{cartStore.getTotalProductsCount()} articles</p>
      <p class="text-xl">
        Total:
        <span class="font-bold">{formatMoney(cartStore.getTotalAmount())}</span>
      </p>
    </div>
    <div class="w-full">
      <button
        type="button"
        aria-label="Suivant"
        on:click={goToCart}
        class="btn btn-primary w-full py-3 px-3 leading-none justify-center text-lg font-semibold"
        disabled={cartStore.getIsEmpty() || loadToCart}
        class:disabled={cartStore.getIsEmpty() || loadToCart}>
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
