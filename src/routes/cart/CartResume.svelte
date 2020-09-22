<script>
  import { onMount } from "svelte";
  import { beforeUpdate } from "svelte";
  import Loader from "./../../components/Loader.svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import CartMap from "./CartMap.svelte";
  import { cartItems, cartItemsOrderedByProducer } from "./../../stores/app.js";
  import { roundMoney, formatMoney } from "./../../helpers/app.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL";
  import GetRouterInstance from "../../services/SheaftRouter";
  import { CREATE_CONSUMER_ORDER, UPDATE_CONSUMER_ORDER } from "./mutations.js";
  import { GET_PRODUCER_DELIVERIES } from "./queries";
  import DeliveryModePicker from "./DeliveryModePicker.svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import ProductCartQuantity from "./../../components/controls/ProductCartQuantity.svelte";
  import DeliveryKind from "../../enums/DeliveryKind";
  import CartRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import CartDonation from "./CartDonation.svelte";
  import debounce from "lodash/debounce";
	import { fly } from "svelte/transition";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let producersDeliveries = [];
  let isLoadingPaymentInfo = true;
  let producerNumber = 0;
  let isLoadingDeliveries = false;
  let hasSubmitError = false;
  let isCreatingOrder = false;
  let orderedCartItems = [];
  let firstTimeOnCart = false;
  let choosenDonation = "NONE";
  let validatedCart = false;
  let paymentInfo = {
    totalFees: 0,
    donation: 0,
    productsCount: 0,
    totalOnSalePrice: 0,
    totalPrice: 0,
    totalReturnableOnSalePrice: 0,
    returnablesCount: 0
  };
  $: orderedCartItems = $cartItems.sort((a, b) => a.producer.name >= b.producer.name ? 1 : -1);

  onMount(() => {
    var firstTimeOnCartCookie = JSON.parse(
      localStorage.getItem("user_first_time_on_cart")
    );

    if (firstTimeOnCartCookie || firstTimeOnCartCookie == null) {
      firstTimeOnCart = true;
      localStorage.setItem("user_first_time_on_cart", JSON.stringify(true));
    }
  })  

  const saveOrder = async () => {
    isLoadingPaymentInfo = true;
    localStorage.setItem("user_cart", JSON.stringify($cartItems));

    var order = JSON.parse(
      localStorage.getItem("user_current_order")
    );
    
    let orderMutation = order && order.id ? UPDATE_CONSUMER_ORDER : CREATE_CONSUMER_ORDER;

    hasSubmitError = false;

    const productsFiltered = $cartItems.filter(p => p.quantity > 0);

    let producersExpectedDeliveries = productsFiltered
      .map(product => {
        return {
          producerId: product.producer.id,
          deliveryModeId: product.producer.delivery ? product.producer.delivery.id : null,
          expectedDeliveryDate: product.producer.deliveryHour ? product.producer.deliveryHour.expectedDeliveryDate : null
        };
      })
      .filter(
        (producer, index, self) =>
          index === self.findIndex(t => t.producerId === producer.producerId)
      );

    // si l'utilisateur n'a pas choisi tous les points de retrait, on ne les envoie pas updateOrder
    if (producersExpectedDeliveries.find((p) => !p.deliveryModeId)) {
      producersExpectedDeliveries = null;
    }

    isCreatingOrder = true;

    const variables = {
      id: order ? order.id : null,
      donation: choosenDonation,
      products: productsFiltered.map(product => {
        return {
          id: product.id,
          quantity: product.quantity
        };
      }),
      producersExpectedDeliveries
    }

    if (!variables.id) {
      delete variables["id"];
    }

    var response = await graphQLInstance.mutate(orderMutation, variables, errorsHandler.Uuid);

    isCreatingOrder = false;

    if (!response.success) {
      //TODO
      hasSubmitError = true;
      return;
    }

    paymentInfo = response.data;
    isLoadingPaymentInfo = false;
    localStorage.setItem("user_current_order", JSON.stringify(response.data));
  };

  beforeUpdate(async () => {
    if ($cartItems.length > 0 && producersDeliveries.length === 0) {
      isLoadingDeliveries = true;
      var res = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, {
        input: {
          ids: $cartItems
            .map(p => p.producer.id)
            .reduce(
              (unique, item) =>
                unique.includes(item) ? unique : [...unique, item],
              []
            ),
          kinds: [
            DeliveryKind.Farm.Value,
            DeliveryKind.Market.Value,
            DeliveryKind.Collective.Value
          ]
        }
      }, errorsHandler.Uuid);

      if (!res.success) {
        // todo
        return;
      }

      producersDeliveries = res.data;
      isLoadingDeliveries = false;
    }
  });

  const debouncedSaveOrder = debounce(saveOrder, 800);

  $: isValid = !$cartItems.find(c => !c.producer.deliveryHour);
  $: if ($cartItems.length > 0) {
    debouncedSaveOrder();
  }

  const handleSubmit = async () => {
    await saveOrder();
    
    routerInstance.goTo(CartRoutes.Checkout)
    localStorage.setItem("user_first_time_on_cart", JSON.stringify(false));
    isCreatingOrder = false;

    // routerInstance.goTo(CartRoutes.Success, {
    //   Query: {
    //     id: response.data.map(order => order.id)
    //   }
    // });
  }

  const removeProduct = id => {
    let newCart = $cartItems.filter(c => c.id !== id);
    $cartItems = newCart;
    localStorage.setItem("user_cart", JSON.stringify($cartItems));
  };
</script>

<svelte:head>
  <title>Mon panier</title>
</svelte:head>


{#if validatedCart}
  <div in:fly|local={{ x: 300, duration: 300 }}>
    <CartDonation bind:choosenDonation submit={handleSubmit} {isLoadingPaymentInfo} />
  </div>
{:else}
  <TransitionWrapper>
    <form on:submit|preventDefault={() => {}}>
      <div class="pb-6">
        <h1>Votre Panier</h1>
        {#if $cartItems.length > 0}
          {#if firstTimeOnCart}
            <div class="py-5 px-3 md:px-6 overflow-x-auto bg-green-100 shadow
            rounded w-full">
              <p class="uppercase font-bold leading-none">
                Ok, et maintenant ?
              </p>
              <ul class="mt-4">
                <p>1. Sélectionnez une horaire et un lieu de récupération pour chaque producteur.</p>
                <p>2. Le lieu de récupération apparaît sur la carte avec son numéro associé.</p>
              </ul>
            </div>
          {/if}
        {/if}
      </div>
      <div class="lg:flex lg:flex-row lg:mb-5">
        {#if isLoadingDeliveries}
          <Loader />
        {:else if $cartItems.length > 0}
          <div class="mx-0 overflow-x-auto w-full lg:w-8/12 lg:pr-12">
            {#if window.screen.width <= 1024}
              <div class="block lg:hidden mb-2">
                <CartMap id="cart-products-map" height="200px" />
              </div>
            {/if}
            <div
              class="align-middle inline-block min-w-full overflow-hidden items">
              {#each orderedCartItems as item, i}
                {#if i === 0 || $cartItems[i - 1].producer.name !== item.producer.name}
                  <p style="border-bottom: 0;" class="font-semibold uppercase text-sm border border-gray-400 py-2 pl-3 bg-gray-100" class:mt-5={i >= 1}>
                    <span
                      class="rounded-full inline-flex w-6 h-6 items-center
                      justify-center bg-primary mr-2 text-white font-semibold">
                      {$cartItemsOrderedByProducer.find(producer => producer.id === item.producer.id) ? $cartItemsOrderedByProducer.find(producer => producer.id === item.producer.id).index : '-'}
                    </span>
                    {item.producer.name}
                  </p>
                  <DeliveryModePicker
                    selected={item.producer.delivery}
                    selectedDeliveryHour={item.producer.deliveryHour}
                    data={producersDeliveries.find(p => p.id === item.producer.id)} />
                {/if}
                <div
                  class="px-2 md:px-3 py-4 block md:flex md:flex-row bg-white border-b border-l border-r
                  border-gray-400 border-solid items-center">
                  <div class="md:w-6/12 px-3">
                    <div class="text-lg leading-5 font-medium">
                      <p>{item.name}</p>
                    </div>
                    <div class="text-sm leading-5">{formatMoney(item.onSalePricePerUnit)} / unité</div>
                  </div>
                  <div class="md:w-2/12 px-3 block md:hidden">
                    <p>
                      <span class="font-bold text-xl">
                        {formatMoney(item.onSalePricePerUnit * item.quantity || 0)}
                      </span>
                    </p>
                    <button
                      type="button"
                      class="btn-link text-sm"
                      on:click={() => removeProduct(item.id)}>
                      Retirer
                    </button>
                  </div>
                  <div class="w-12/12 md:w-5/12 xl:w-3/12 px-3">
                    <ProductCartQuantity productId={item.id} noMargin={true} />
                  </div>
                  <div class="md:w-3/12 px-3 text-right hidden md:block">
                    <p>
                      <span class="font-bold text-lg">
                        {formatMoney(item.onSalePricePerUnit * item.quantity || 0)}
                      </span>
                    </p>
                    <button
                      type="button"
                      class="btn-link text-sm"
                      on:click={() => removeProduct(item.id)}>
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
                  <div class="text-left" class:skeleton-box={isLoadingPaymentInfo}>
                    <p class:invisible={isLoadingPaymentInfo}>Panier</p>
                  </div>
                  <div class:skeleton-box={isLoadingPaymentInfo}>
                    <p class="font-medium" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.totalOnSalePrice)}</p>
                  </div>
                </div>
                {#if paymentInfo.returnablesCount >= 1}
                  <div class="flex justify-between w-full lg:px-3 pb-2">
                    <div class="text-left" class:skeleton-box={isLoadingPaymentInfo}>
                      <p>Consignes</p>
                      <p class="text-sm text-gray-600" class:invisible={isLoadingPaymentInfo}>
                        {paymentInfo.returnablesCount} consignes
                      </p>
                    </div>
                    <div class:skeleton-box={isLoadingPaymentInfo}>
                      <p class="font-medium" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.totalReturnableOnSalePrice)}</p>
                    </div>
                  </div>
                {/if}
                {#if paymentInfo.donation > 0}
                  <div class="flex justify-between w-full lg:px-3 pb-2">
                    <div class="text-left" class:skeleton-box={isLoadingPaymentInfo}>
                      <p class:invisible={isLoadingPaymentInfo}>Don</p>
                    </div>
                    <div class:skeleton-box={isLoadingPaymentInfo}>
                      <p class="font-medium" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.donation)}</p>
                    </div>
                  </div>
                {/if}
                <div class="flex justify-between w-full lg:px-3 pb-2">
                  <div class="text-left" class:skeleton-box={isLoadingPaymentInfo}>
                    <p class:invisible={isLoadingPaymentInfo}>Frais bancaires</p>
                    <!-- <p class="leading-none text-gray-600 text-sm">1.8% + 0.18€ <button class="btn-link" on:click={showTransactionInfo}>C'est quoi ?</button></p> -->
                  </div>
                  <div class:skeleton-box={isLoadingPaymentInfo}>
                    <p class="font-medium" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.totalFees)}</p>
                  </div>
                </div>
                <div class="flex justify-between w-full lg:px-3 border-gray-300 pt-2">
                  <div class="text-left" class:skeleton-box={isLoadingPaymentInfo}>
                    <p class:invisible={isLoadingPaymentInfo}>Total</p>
                    <p class="text-sm text-gray-600" class:invisible={isLoadingPaymentInfo}>
                      {paymentInfo.productsCount} articles
                    </p>
                  </div>
                  <div class:skeleton-box={isLoadingPaymentInfo}>
                    <p class="font-bold text-lg" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.totalPrice)}</p>
                  </div>
                </div>
              </div>
              <div class="pt-2 lg:pt-3">
                <button
                  type="button"
                  on:click={() => validatedCart = true}
                  class:disabled={paymentInfo.productsCount === 0 || !isValid || isLoadingPaymentInfo}
                  disabled={isLoadingPaymentInfo}
                  class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
                  justify-center m-auto"
                  style="padding-left: 50px; padding-right: 50px;">
                  {#if isCreatingOrder}
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