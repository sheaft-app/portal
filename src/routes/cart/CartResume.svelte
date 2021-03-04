<script>
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import CartMap from "./CartMap.svelte";
  import { cartItems } from "./../../stores/app.js";
  import cartStore from "./../../stores/cart";
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
  import SheaftErrors from "../../services/SheaftErrors";
  import CartDonation from "./CartDonation.svelte";
  import MangoPayInfo from "./MangoPayInfo.svelte";
  import { fly } from "svelte/transition";
  import orderBy from "lodash/orderBy";

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

  $: if ($cartStore.items.length > 0 && producersDeliveries.length === 0) {
    getProducerDeliveries($cartStore.items);
  }
  
  const showTransactionInfo = () => {
    open(MangoPayInfo, {});
  };

  const getProducerDeliveries = async () => {
    isLoadingDeliveries = true;

    const ids = cartStore.getProducersIds();

    var res = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, {
      input: {
        ids,
        kinds: [
          DeliveryKind.Farm.Value,
          DeliveryKind.Market.Value,
          DeliveryKind.Collective.Value
        ]
      }
    }, errorsHandler.Uuid);

    if (!res.success) {
      // todo
      return isLoadingDeliveries = false;
    }

    // l'utilisateur avait déjà choisi un lieu de récup pour le prod
    // mais entre temps le prod a supprimé ce lieu
    const deliveriesIds = res.data.map((r) => r.deliveries).flat().map((d) => d.id);
    const cartItemWithProducerDeliveryNotFound = $cartStore.selectedDeliveries.find((d) => d.delivery && d.delivery.id && !deliveriesIds.includes(d.delivery.id));
    
    if (cartItemWithProducerDeliveryNotFound) {
      cartStore.resetSelectedDeliveryForProducerId(cartItemWithProducerDeliveryNotFound.producer.id);
    }

    if (res.data.length !== ids.length) {
      cartStore.disableProducers(ids.filter((i) => !res.data.map((r) => r.id).includes(i)));
    }

    producersDeliveries = res.data;
    isLoadingDeliveries = false;
  }

  $: isValid = !$cartStore.items.find(c => !c.producer.disabled && !c.producer.deliveryHour);
  $: productsHaveBeenRemoved = $cartStore.items.find(c => c.disabled);
  $: producersHaveBeenRemoved = $cartStore.items.find(c => c.producer.disabled);

  const blink = (deliveries) => {
    if (!deliveries || deliveries.length == 0) return;

    deliveries.map((d, index) => {
      const element = document.getElementById(d.producer.id);

      if (!element) return;

      if (index == 0) {
        var headerOffset = document.getElementById('navbar').offsetHeight;
        var elementPosition = element.offsetTop;
        var offsetPosition = elementPosition - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });   
      }

      element.classList.add("blink")
      setTimeout(() => element.classList.remove("blink"), 3000);
    });
  }
  
  const validateCart = () => {
    if (!isValid)
      return blink($cartStore.items.filter(c => !c.producer.deliveryHour));
    return validatedCart = true
  }

  const handleSubmit = async () => {
    await cartStore.updateCart();
    
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
        {#if $cartStore.items.length > 0}
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
        {#if $cartStore.items.length > 0}
          <div class="mx-0 overflow-x-auto w-full lg:w-8/12 lg:pr-12">
            {#if window.screen.width <= 1024}
              <div class="block lg:hidden mb-2">
                <CartMap id="cart-products-map" height="200px" />
              </div>
            {/if}
            <div
              class="align-middle inline-block min-w-full overflow-hidden items">
              {#each cartStore.getSortedItemsByProducerName() as item, i (item.id)}
                {#if i === 0 || cartStore.getSortedItemsByProducerName()[i - 1].producer.name !== item.producer.name}
                    <p style="border-bottom: 0;" class="font-semibold uppercase text-sm border border-gray-400 py-2 pl-3 bg-gray-100" class:mt-5={i >= 1} class:bg-orange-200={item.producer.disabled}>
                      <span
                        class="rounded-full inline-flex w-6 h-6 items-center
                        justify-center bg-primary mr-2 text-white font-semibold"
                        class:hidden={item.producer.disabled}>
                        {$cartStore.selectedDeliveries.find((d) => d.producerId == item.producer.id) ? $cartStore.selectedDeliveries.find((d) => d.producerId == item.producer.id).number : '-'}
                      </span>
                      {item.producer.name}
                    </p>
                    {#if item.producer.disabled}
                      <div class="bg-orange-200 py-2 pl-3 border-gray-400 border">
                        <p>Le producteur a désactivé ses points de vente.</p>
                        <button 
                          type="button"
                          class="btn-link text-sm"
                          on:click={() => cartStore.removeItemsWithProducer(item.producer.id)}>
                          Supprimer ce producteur
                        </button>
                      </div>
                    {:else}
                      <DeliveryModePicker
                        data={producersDeliveries.find(p => p.id === item.producer.id)} 
                        isLoading={isLoadingDeliveries}
                      />
                    {/if}
                {/if}
                <div
                  class="px-2 md:px-3 py-4 block md:flex md:flex-row bg-white border-b border-l border-r
                  border-gray-400 border-solid items-center" 
                  class:bg-orange-200={item.disabled || item.producer.disabled} 
                  class:text-gray-500={item.disabled || item.producer.disabled}
                  class:line-through={item.disabled || item.producer.disabled}>
                  <div class="md:w-6/12 px-3">
                    <div class="text-lg leading-5 font-medium">
                      <p>{item.name}</p>
                    </div>
                    <div class="text-sm leading-5">{formatMoney(item.unitOnSalePrice)} / unité</div>
                  </div>
                  <div class="md:w-2/12 px-3 block md:hidden">
                    <p>
                      <span class="font-bold text-xl">
                        {formatMoney(item.unitOnSalePrice * item.quantity || 0)}
                      </span>
                    </p>
                    <button
                      type="button"
                      class="btn-link text-sm"
                      on:click={() => cartStore.removeItem(item.id)}>
                      Retirer
                    </button>
                  </div>
                    <div class="w-12/12 md:w-5/12 xl:w-3/12 px-3">
                      {#if !item.disabled && !item.producer.disabled}
                        <ProductCartQuantity productId={item.id} noMargin={true} minQuantity={1} />
                      {/if}
                    </div>
                  <div class="md:w-3/12 px-3 text-right hidden md:block">
                    <p>
                      <span class="font-bold text-lg">
                        {formatMoney(item.unitOnSalePrice * item.quantity || 0)}
                      </span>
                    </p>
                    <button
                      type="button"
                      class="btn-link text-sm"
                      on:click={() => cartStore.removeItem(item.id)}>
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
                  <div class="text-left" class:skeleton-box={$cartStore.isSaving}>
                    <p class:invisible={$cartStore.isSaving}>Panier</p>
                    <p class="text-sm text-gray-600" class:invisible={$cartStore.isSaving}>
                      {$cartStore.productsCount} articles
                      {#if $cartStore.returnablesCount >= 1}
                      dont {$cartStore.returnablesCount} consigné{$cartStore.returnablesCount > 1 ? 's' : ''}
                      {/if}
                    </p>
                  </div>
                  <div class="text-right" class:skeleton-box={$cartStore.isSaving}>
                    <p class="font-medium" class:invisible={$cartStore.isSaving}>{formatMoney($cartStore.totalOnSalePrice)}</p>
                    {#if $cartStore.returnablesCount >= 1}
                      <p class="text-blue-500 font-medium text-sm" class:invisible={$cartStore.isSaving}>
                        dont 
                        <img src="./img/returnable.svg" alt="consigne" style="width: 15px; display: inline;"  /> 
                        {formatMoney($cartStore.totalReturnableOnSalePrice)}
                      </p>
                    {/if}
                  </div>
                </div>
                {#if $cartStore.donation > 0}
                  <div class="flex justify-between w-full lg:px-3 pb-2">
                    <div class="text-left" class:skeleton-box={$cartStore.isSaving}>
                      <p class:invisible={$cartStore.isSaving}>Don</p>
                    </div>
                    <div class:skeleton-box={$cartStore.isSaving}>
                      <p class="font-medium" class:invisible={$cartStore.isSaving}>{formatMoney($cartStore.donation)}</p>
                    </div>
                  </div>
                {/if}
                <div class="flex justify-between w-full lg:px-3 pb-2">
                  <div class="text-left" class:skeleton-box={$cartStore.isSaving}>
                    <p class:invisible={$cartStore.isSaving}>Frais bancaires</p>
                    <button class:invisible={$cartStore.isSaving} class="btn-link" on:click={showTransactionInfo}>C'est quoi ?</button>
                  </div>
                  <div class:skeleton-box={$cartStore.isSaving}>
                    <p class="font-medium" class:invisible={$cartStore.isSaving}>{formatMoney($cartStore.totalFees)}</p>
                  </div>
                </div>
                <div class="flex justify-between w-full lg:px-3 border-t border-gray-400 pt-2">
                  <div class="text-left" class:skeleton-box={$cartStore.isSaving}>
                    <p class="uppercase font-semibold" class:invisible={$cartStore.isSaving}>Total</p>
                  </div>
                  <div class:skeleton-box={$cartStore.isSaving}>
                    <p class="font-bold text-lg" class:invisible={$cartStore.isSaving}>{formatMoney($cartStore.totalPrice)}</p>
                  </div>
                </div>
              </div>
					  <div class="mt-3">
                <button
                  type="button"
                  on:click={validateCart}
                  class:disabled={$cartStore.productsCount === 0 || $cartStore.isSaving}
                  class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
                  justify-center m-auto"
                  disabled={$cartStore.productsCount === 0 || $cartStore.isSaving}
                  style="padding-left: 50px; padding-right: 50px;">
                  {#if $cartStore.isSaving}
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