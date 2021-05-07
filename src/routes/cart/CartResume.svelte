<script>
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import Loader from "../../components/Loader.svelte";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import CartMap from "./CartMap.svelte";
  import cart from "./../../stores/cart";
  import { formatMoney } from "./../../helpers/app.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL";
  import GetRouterInstance from "../../services/SheaftRouter";
  import { GET_PRODUCER_DELIVERIES } from "./queries";
  import DeliveryModePicker from "./DeliveryModePicker.svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import ProductCartQuantity from "./../../components/controls/ProductCartQuantity.svelte";
  import DeliveryKind from "../../enums/DeliveryKind";
  import CartRoutes from "./routes";
	import SearchProductsRoutes from "../search-products/routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import CartDonation from "./CartDonation.svelte";
  import MangoPayInfo from "./MangoPayInfo.svelte";
  import { fly } from "svelte/transition";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const { open } = getContext("modal");

  let producersDeliveries = [];
  let producersHaveBeenRemoved = false;
  let productsHaveBeenRemoved = false;
  let isLoadingDeliveries = true;
  let hasSubmitError = false;
  let firstTimeOnCart = false;
  let choosenDonation = "NONE";
  let validatedCart = false;

  onMount(async () => {
    if ($cart.conflicts.length > 0) {
				return routerInstance.goTo(SearchProductsRoutes.Search);
    }

    const values = routerInstance.getQueryParams();

    var firstTimeOnCartCookie = JSON.parse(
      localStorage.getItem("user_first_time_on_cart")
    );

    if (firstTimeOnCartCookie || firstTimeOnCartCookie == null) {
      firstTimeOnCart = true;
      localStorage.setItem("user_first_time_on_cart", JSON.stringify(true));
    }

    if (values["step"] && values["step"] == "donation" && isValid) {
      validatedCart = true;
    }
  });

  $: if (producersDeliveries.length === 0 && $cart.products.length > 0) {
    getProducerDeliveries();
  }
  
  const showTransactionInfo = () => {
    open(MangoPayInfo, {});
  };

  const getProducerDeliveries = async () => {
    isLoadingDeliveries = true;

    const ids = cart.getProducersIds();
    var res = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, {
      input: ids
    }, errorsHandler.Uuid);

    if (!res.success) {
      // todo
      return isLoadingDeliveries = false;
    }

    // l'utilisateur avait déjà choisi un lieu de récup pour le prod
    // mais entre temps le prod a supprimé ce lieu
    const deliveriesIds = res.data.map((r) => r.deliveries).flat().map((d) => d.id);
    const cartItemWithProducerDeliveryNotFound = $cart.selectedDeliveries.find((d) => d.delivery && d.delivery.id && !deliveriesIds.includes(d.delivery.id));
    
    if (cartItemWithProducerDeliveryNotFound) {
      cart.resetSelectedDeliveryForProducerId(cartItemWithProducerDeliveryNotFound.producerId);
    }

    if (res.data.length !== ids.length) {
      cart.disableProducers(ids.filter((i) => !res.data.map((r) => r.id).includes(i)));
    }

    producersDeliveries = res.data;
    isLoadingDeliveries = false;
  }

  $: isValid = $cart.products.find(c => !c.producer.disabled) && $cart.selectedDeliveries.length == cart.getProducersIds().length;
  $: productsHaveBeenRemoved = $cart.products.find(c => c.disabled);
  $: producersHaveBeenRemoved = $cart.products.find(c => c.producer.disabled);

  const blink = (deliveries) => {
    const elements = document.getElementsByClassName("not-ready");

    let index = 0;

    for (const element of elements) {

      if (index == 0) {
        var headerOffset = document.getElementById('navbar').offsetHeight;
        var elementPosition = element.offsetTop;
        var offsetPosition = elementPosition - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });   
      }

      element.classList.add("blink");
      setTimeout(() => element.classList.remove("blink"), 3000);
      index++;
    }
  }
  
  const validateCart = () => {
    if (!isValid)
      return blink($cart.products.filter(c => !c.producer.deliveryHour));
    return validatedCart = true
  }

  const handleSubmit = async () => {
    await cart.updateCart(choosenDonation);
    
    routerInstance.goTo(CartRoutes.Checkout)
    localStorage.setItem("user_first_time_on_cart", JSON.stringify(false));
  }
</script>

<svelte:head>
  <title>Mon panier</title>
</svelte:head>

{#if validatedCart}
  <div in:fly|local={{ x: 300, duration: 300 }}>
    <CartDonation bind:choosenDonation submit={handleSubmit} />
  </div>
{:else}
  <TransitionWrapper>
    <form on:submit|preventDefault={() => {}}>
      <div class="pb-6">
        <h1 class="font-semibold uppercase">Votre Panier</h1>
        <span class="bg-primary h-1 w-20 block mt-2"></span>
        {#if productsHaveBeenRemoved}
          <div class="py-5 px-3 md:px-6 overflow-x-auto bg-orange-200 shadow
            rounded w-full mb-2 mt-2">
              <p class="uppercase font-bold leading-none">
                Des produits ne sont plus disponibles
              </p>
              <ul class="mt-4">
                <p>Certains produits dans votre panier ne sont plus disponibles et ont été retirés. Les produits concernés sont les produits barrés avec un fond orange dans la liste. Ces produits ne seront pas commandés.</p>
              </ul>
            </div>
        {/if}
        {#if producersHaveBeenRemoved}
          <div class="py-5 px-3 md:px-6 overflow-x-auto bg-orange-200 shadow
            rounded w-full mb-2 mt-2">
              <p class="uppercase font-bold leading-none">
                Des producteurs ne sont plus disponibles
              </p>
              <ul class="mt-4">
                <p>Les points de vente de certains producteurs dans votre panier ne sont plus disponibles. Leurs produits ont été retirés de votre panier.</p>
              </ul>
            </div>
        {/if}
        {#if $cart.products.length > 0}
          {#if firstTimeOnCart}
            <div class="py-5 px-3 md:px-6 overflow-x-auto bg-green-100 shadow
            rounded w-full mb-2 mt-2">
              <p class="uppercase font-bold leading-none">
                Ok, et maintenant ?
              </p>
              <ul class="mt-4">
                <p>1. Sélectionnez un horaire et un lieu de récupération pour chaque producteur.</p>
                <p>2. Le lieu de récupération apparaît sur la carte avec son numéro associé.</p>
              </ul>
            </div>
          {/if}
        {/if}
      </div>
      <div class="lg:flex lg:flex-row lg:mb-5">
        {#if $cart.products.length > 0}
          <div class="mx-0 overflow-x-auto w-full lg:w-8/12 lg:pr-12">
            {#if window.screen.width <= 1024}
              <div class="block lg:hidden mb-2">
                <CartMap id="cart-products-map" height="200px" />
              </div>
            {/if}
            <div
              class="align-middle inline-block min-w-full overflow-hidden items">
              {#each cart.getSortedProductsByProducerName($cart.products) as product, i (product.id)}
                {#if i === 0 || cart.getSortedProductsByProducerName()[i - 1].producer.name !== product.producer.name}
                    <p style="border-bottom: 0;" class="font-semibold uppercase text-sm border border-gray-400 py-2 pl-3 bg-gray-100" class:mt-5={i >= 1} class:bg-orange-200={product.producer.disabled}>
                      <span
                        class="rounded-full inline-flex w-6 h-6 items-center
                        justify-center bg-primary mr-2 text-white font-semibold"
                        class:hidden={product.producer.disabled}>
                        {$cart.selectedDeliveries.find((d) => d.producerId == product.producer.id) ? $cart.selectedDeliveries.find((d) => d.producerId == product.producer.id).number : '-'}
                      </span>
                      {product.producer.name}
                    </p>
                    {#if product.producer.disabled}
                      <div class="bg-orange-200 py-2 pl-3 border-gray-400 border">
                        <p>Le producteur a désactivé ses points de vente.</p>
                        <button 
                          type="button"
                          class="btn-link text-sm"
                          on:click={() => cart.removeProducerProducts(product.producer.id)}>
                          Supprimer ce producteur
                        </button>
                      </div>
                    {:else}
                      <DeliveryModePicker
                        data={producersDeliveries.find(p => p.id === product.producer.id)} 
                        isLoading={isLoadingDeliveries}
                      />
                    {/if}
                {/if}
                <div
                  class="px-2 md:px-3 py-4 block md:flex md:flex-row bg-white border-b border-l border-r
                  border-gray-400 border-solid items-center" 
                  class:bg-orange-200={product.disabled || product.producer.disabled} 
                  class:text-gray-500={product.disabled || product.producer.disabled}
                  class:line-through={product.disabled || product.producer.disabled}>
                  <div class="md:w-6/12 px-3">
                    <div class="text-lg leading-5 font-medium">
                      <p>{product.name}</p>
                    </div>
                    <div class="text-sm leading-5">{formatMoney(product.unitOnSalePrice)} / unité</div>
                  </div>
                  <div class="md:w-2/12 px-3 block md:hidden">
                    <p>
                      <span class="font-bold text-xl">
                        {formatMoney(product.unitOnSalePrice * product.quantity || 0)}
                      </span>
                    </p>
                    <button
                      type="button"
                      class="btn-link text-sm"
                      on:click={() => cart.removeProduct(product.id)}>
                      Retirer
                    </button>
                  </div>
                    <div class="w-12/12 md:w-5/12 xl:w-3/12 px-3">
                      {#if !product.disabled && !product.producer.disabled}
                        <ProductCartQuantity productId={product.id} noMargin={true} minQuantity={1} />
                      {/if}
                    </div>
                  <div class="md:w-3/12 px-3 text-right hidden md:block">
                    <p>
                      <span class="font-bold text-lg">
                        {formatMoney(product.unitOnSalePrice * product.quantity || 0)}
                      </span>
                    </p>
                    <button
                      type="button"
                      class="btn-link text-sm"
                      on:click={() => cart.removeProduct(product.id)}>
                      Retirer
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          <div class="w-full lg:w-4/12">
            {#if window.screen.width > 1024}
              <div class="hidden lg:block">
                <CartMap id="cart-products-map" height="300px" />
              </div>
            {/if}
            <div
              class="py-2 mb-6 pb-5 px-6 lg:px-6 lg:py-8 static lg:block bg-white
              shadow w-full mt-5 lg:mt-0"
              style="height: fit-content;">
              <div>
                <div class="flex justify-between w-full lg:px-3 pb-2">
                  <div class="text-left" class:skeleton-box={$cart.isSaving}>
                    <p class:invisible={$cart.isSaving}>Panier</p>
                    <p class="text-sm text-gray-600" class:invisible={$cart.isSaving}>
                      {$cart.productsCount} articles
                      {#if $cart.returnablesCount >= 1}
                      dont {$cart.returnablesCount} consigné{$cart.returnablesCount > 1 ? 's' : ''}
                      {/if}
                    </p>
                  </div>
                  <div class="text-right" class:skeleton-box={$cart.isSaving}>
                    <p class="font-medium" class:invisible={$cart.isSaving}>{formatMoney($cart.totalOnSalePrice)}</p>
                    {#if $cart.returnablesCount >= 1}
                      <p class="text-blue-500 font-medium text-sm" class:invisible={$cart.isSaving}>
                        dont 
                        <img src="./img/returnable.svg" alt="consigne" style="width: 15px; display: inline;"  /> 
                        {formatMoney($cart.totalReturnableOnSalePrice)}
                      </p>
                    {/if}
                  </div>
                </div>
                {#if $cart.donation > 0}
                  <div class="flex justify-between w-full lg:px-3 pb-2">
                    <div class="text-left" class:skeleton-box={$cart.isSaving}>
                      <p class:invisible={$cart.isSaving}>Don</p>
                    </div>
                    <div class:skeleton-box={$cart.isSaving}>
                      <p class="font-medium" class:invisible={$cart.isSaving}>{formatMoney($cart.donation)}</p>
                    </div>
                  </div>
                {/if}
                <div class="flex justify-between w-full lg:px-3 pb-2">
                  <div class="text-left" class:skeleton-box={$cart.isSaving}>
                    <p class:invisible={$cart.isSaving}>Frais bancaires</p>
                    <button class:invisible={$cart.isSaving} class="btn-link" on:click={showTransactionInfo}>C'est quoi ?</button>
                  </div>
                  <div class:skeleton-box={$cart.isSaving}>
                    <p class="font-medium" class:invisible={$cart.isSaving}>{formatMoney($cart.totalFees)}</p>
                  </div>
                </div>
                <div class="flex justify-between w-full lg:px-3 border-t border-gray-400 pt-2">
                  <div class="text-left" class:skeleton-box={$cart.isSaving}>
                    <p class="uppercase font-semibold" class:invisible={$cart.isSaving}>Total</p>
                  </div>
                  <div class:skeleton-box={$cart.isSaving}>
                    <p class="font-bold text-lg" class:invisible={$cart.isSaving}>{formatMoney($cart.totalPrice)}</p>
                  </div>
                </div>
              </div>
					  <div class="mt-3">
                <button
                  type="button"
                  on:click={validateCart}
                  class:disabled={$cart.productsCount === 0 || $cart.isSaving}
                  class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
                  justify-center m-auto"
                  disabled={$cart.productsCount === 0 || $cart.isSaving}
                  style="padding-left: 50px; padding-right: 50px;">
                  {#if $cart.isSaving}
                    <Icon data={faCircleNotch} spin />
                  {:else}Suivant{/if}
                </button>
              </div>
              {#if hasSubmitError}
                <ErrorCard displayIcon={false} {errorsHandler} classes="mt-10">
                  <p>
                    Une erreur est survenue pendant l'envoi de la commande,
                    veuillez réessayez.
                  </p>
                </ErrorCard>
              {/if}
            </div>
          </div>
        {:else if $cart.isSaving || $cart.isInitializing}
          <Loader />
        {:else}
          <div class="text-center text-2xl text-gray-600 m-auto px-6">
            <p>Votre panier est vide !</p>
            <p class="mb-5">On démarre quand vous voulez !</p>
          </div>
        {/if}
      </div>
    </form>
  </TransitionWrapper>
{/if}