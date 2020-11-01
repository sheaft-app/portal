<script>
  import { onMount, beforeUpdate, getContext } from "svelte";
  import Loader from "./../../components/Loader.svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import CartMap from "./CartMap.svelte";
  import { cartItems, cartItemsOrderedByProducer } from "./../../stores/app.js";
  import { formatMoney } from "./../../helpers/app.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL";
  import GetRouterInstance from "../../services/SheaftRouter";
  import { CREATE_CONSUMER_ORDER, UPDATE_CONSUMER_ORDER } from "./mutations.js";
  import { GET_PRODUCER_DELIVERIES, GET_ORDER } from "./queries";
  import DeliveryModePicker from "./DeliveryModePicker.svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import ProductCartQuantity from "./../../components/controls/ProductCartQuantity.svelte";
  import DeliveryKind from "../../enums/DeliveryKind";
  import CartRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import CartDonation from "./CartDonation.svelte";
  import debounce from "lodash/debounce";
  import MangoPayInfo from "./MangoPayInfo.svelte";
  import { fly } from "svelte/transition";
  import orderBy from "lodash/orderBy";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const { open } = getContext("modal");

  let producersDeliveries = [];
  let hasFetchedOrder = false;
  let producersHaveBeenRemoved = false;
  let productsHaveBeenRemoved = false;
  let isLoadingPaymentInfo = false;
  let producerNumber = 0;
  let isLoadingDeliveries = true;
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
  $: orderedCartItems = orderBy($cartItems, i => i.producer.name, ['asc']);

  var order = JSON.parse(
    localStorage.getItem("user_current_order")
  );

  onMount(async () => {
    const values = routerInstance.getQueryParams();

    var firstTimeOnCartCookie = JSON.parse(
      localStorage.getItem("user_first_time_on_cart")
    );

    if (firstTimeOnCartCookie || firstTimeOnCartCookie == null) {
      firstTimeOnCart = true;
      localStorage.setItem("user_first_time_on_cart", JSON.stringify(true));
    }

    if (order) {
      var response = await graphQLInstance.query(GET_ORDER, { input: order.id }, errorsHandler.Uuid);
      if (!response.success) {
        //TODO
        clearStorage();
        hasFetchedOrder = true;
        return;
      }

      if (response.data == null || response.data.status == "SUCCEEDED" || response.data.status == "WAITING") {
        clearStorage();
      }
    }

    hasFetchedOrder = true;

    await getProducerDeliveries();
    await saveOrder();

    if (values["step"] && values["step"] == "donation" && isValid) {
      validatedCart = true;
    }
  });
  
  const clearStorage = () => {
		localStorage.removeItem("user_last_transaction");
		localStorage.removeItem("user_current_order");
    order = null;
  }

  const saveOrder = async () => {
    if (!hasFetchedOrder || isLoadingPaymentInfo) {
      return;
    }

    order = JSON.parse(
      localStorage.getItem("user_current_order")
    );

    isLoadingPaymentInfo = true;
    localStorage.setItem("user_cart", JSON.stringify($cartItems));
    
    let orderMutation = order && order.id ? UPDATE_CONSUMER_ORDER : CREATE_CONSUMER_ORDER;

    hasSubmitError = false;

    const productsFiltered = $cartItems.filter(p => p.quantity > 0 && !p.disabled && !p.producer.disabled);

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

    //  l'utilisateur n'a pas choisi tous les points de retrait, on n'envoie pas updateOrder
    if (producersExpectedDeliveries.find((p) => !p.deliveryModeId)) {
      producersExpectedDeliveries = null;
    }

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

    if (!response.success) {
      // todo
      const errors = errorsHandler.getErrors();
      const invalidProductsError = errors.find((e) => e.message.includes('produits sont invalides'));

      if (invalidProductsError) {
        const ids = [...invalidProductsError.message.matchAll(/[0-9a-fA-F]{32}/gm)].map((i) => i[0]);

        ids.map((i) => {
          $cartItems = $cartItems.map((c) => {
            if (c.id == i && !c.producer.disabled) {
              return {
                ...c,
                disabled: true
              }
            }
            else return c;
          });
        })

        return isLoadingPaymentInfo = false;
      }   

      hasSubmitError = true;
      return isLoadingPaymentInfo = false;
    }

    paymentInfo = response.data;
    isLoadingPaymentInfo = false;
    localStorage.setItem("user_current_order", JSON.stringify(response.data));
  };
  
  const showTransactionInfo = () => {
    open(MangoPayInfo, {});
  };

  const getProducerDeliveries = async () => {
    if ($cartItems.length > 0 && producersDeliveries.length === 0) {
      isLoadingDeliveries = true;

      const ids = $cartItems
        .map(p => p.producer.id)
        .reduce(
          (unique, item) =>
            unique.includes(item) ? unique : [...unique, item],
          []
        );

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
      const cartItemWithProducerDeliveryNotFound = $cartItems.find((c) => c.producer.delivery && c.producer.delivery.id && !deliveriesIds.includes(c.producer.delivery.id));
      if (cartItemWithProducerDeliveryNotFound) {
        $cartItems = $cartItems.map((c) => {
          if (c.producer.id == cartItemWithProducerDeliveryNotFound.producer.id) {
            delete c.producer['delivery'];
            delete c.producer['deliveryHour'];
          }
          return c;
        });
      }

      if (res.data.length !== ids.length) {
        const missingIds = ids.filter((i) => !res.data.map((r) => r.id).includes(i));
        missingIds.map((i) => {
          $cartItems = $cartItems.map((c) => {
            if (c.producer.id == i) {
              return {
                ...c,
                producer: {
                  ...c.producer,
                  disabled: true
                }
              }
            }
            else return c;
          });
        })
      }

      producersDeliveries = res.data;
      isLoadingDeliveries = false;
    }
  }

  const debouncedSaveOrder = debounce(saveOrder, 800);

  $: isValid = !$cartItems.find(c => !c.producer.disabled && !c.producer.deliveryHour);

  $: productsHaveBeenRemoved = $cartItems.find(c => c.disabled);
  $: producersHaveBeenRemoved = $cartItems.find(c => c.producer.disabled);

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
      return blink($cartItems.filter(c => !c.producer.deliveryHour));
    return validatedCart = true
  }

  const handleSubmit = async () => {
    await saveOrder();
    
    routerInstance.goTo(CartRoutes.Checkout)
    localStorage.setItem("user_first_time_on_cart", JSON.stringify(false));
    isCreatingOrder = false;
  }

  const removeProduct = id => {
    let newCart = $cartItems.filter(c => c.id !== id);
    $cartItems = newCart;
    localStorage.setItem("user_cart", JSON.stringify($cartItems));
    debouncedSaveOrder();
  };

  const removeProducer = id => {
    let newCart = $cartItems.filter(c => c.producer.id !== id);
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
        {#if $cartItems.length > 0}
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
        {#if $cartItems.length > 0}
          <div class="mx-0 overflow-x-auto w-full lg:w-8/12 lg:pr-12">
            {#if window.screen.width <= 1024}
              <div class="block lg:hidden mb-2">
                <CartMap id="cart-products-map" height="200px" />
              </div>
            {/if}
            <div
              class="align-middle inline-block min-w-full overflow-hidden items">
              {#each orderedCartItems as item, i (item.id)}
                {#if i === 0 || orderedCartItems[i - 1].producer.name !== item.producer.name}
                    <p style="border-bottom: 0;" class="font-semibold uppercase text-sm border border-gray-400 py-2 pl-3 bg-gray-100" class:mt-5={i >= 1} class:bg-orange-200={item.producer.disabled}>
                      <span
                        class="rounded-full inline-flex w-6 h-6 items-center
                        justify-center bg-primary mr-2 text-white font-semibold"
                        class:hidden={item.producer.disabled}>
                        {$cartItemsOrderedByProducer.find(producer => producer.id === item.producer.id) ? $cartItemsOrderedByProducer.find(producer => producer.id === item.producer.id).index : '-'}
                      </span>
                      {item.producer.name}
                    </p>
                    {#if item.producer.disabled}
                      <div class="bg-orange-200 py-2 pl-3 border-gray-400 border">
                        <p>Le producteur a désactivé ses points de vente.</p>
                        <button 
                          type="button"
                          class="btn-link text-sm"
                          on:click={() => removeProducer(item.producer.id)}>
                          Supprimer ce producteur
                        </button>
                      </div>
                    {:else}
                      <DeliveryModePicker
                        selected={item.producer.delivery}
                        selectedDeliveryHour={item.producer.deliveryHour}
                        data={producersDeliveries.find(p => p.id === item.producer.id)} 
                        isLoading={isLoadingDeliveries}
                        disabled={isLoadingPaymentInfo}
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
                    {#if !item.disabled && !item.producer.disabled}
                        <ProductCartQuantity productId={item.id} noMargin={true} minQuantity={1} disabled={isLoadingPaymentInfo} on:updateCart={debouncedSaveOrder} />
                    {/if}
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
                    <p class="text-sm text-gray-600" class:invisible={isLoadingPaymentInfo}>
                      {paymentInfo.productsCount} articles
                      {#if paymentInfo.returnablesCount >= 1}
                      dont {paymentInfo.returnablesCount} consigné{paymentInfo.returnablesCount > 1 ? 's' : ''}
                      {/if}
                    </p>
                  </div>
                  <div class="text-right" class:skeleton-box={isLoadingPaymentInfo}>
                    <p class="font-medium" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.totalOnSalePrice)}</p>
                    {#if paymentInfo.returnablesCount >= 1}
                      <p class="text-blue-500 font-medium text-sm" class:invisible={isLoadingPaymentInfo}>
                        dont 
                        <img src="./img/returnable.svg" alt="consigne" style="width: 15px; display: inline;"  /> 
                        {formatMoney(paymentInfo.totalReturnableOnSalePrice)}
                      </p>
                    {/if}
                  </div>
                </div>
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
                    <button class:invisible={isLoadingPaymentInfo} class="btn-link" on:click={showTransactionInfo}>C'est quoi ?</button>
                  </div>
                  <div class:skeleton-box={isLoadingPaymentInfo}>
                    <p class="font-medium" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.totalFees)}</p>
                  </div>
                </div>
                <div class="flex justify-between w-full lg:px-3 border-t border-gray-400 pt-2">
                  <div class="text-left" class:skeleton-box={isLoadingPaymentInfo}>
                    <p class="uppercase font-semibold" class:invisible={isLoadingPaymentInfo}>Total</p>
                  </div>
                  <div class:skeleton-box={isLoadingPaymentInfo}>
                    <p class="font-bold text-lg" class:invisible={isLoadingPaymentInfo}>{formatMoney(paymentInfo.totalPrice)}</p>
                  </div>
                </div>
              </div>
					  <div class="mt-3">
                <button
                  type="button"
                  on:click={validateCart}
                  class:disabled={paymentInfo.productsCount === 0 || isLoadingPaymentInfo}
                  class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
                  justify-center m-auto"
                  disabled={paymentInfo.productsCount === 0 || isLoadingPaymentInfo}
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