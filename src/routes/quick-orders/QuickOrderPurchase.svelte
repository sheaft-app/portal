<script>
  import { getContext, onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import SheaftErrors from "./../../services/SheaftErrors.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import InputCheckbox from "./../../components/controls/InputCheckbox.svelte";
  import DeliveryModePicker from "../cart/DeliveryModePicker.svelte";
  import FilterProducersModal from './FilterProducersModal.svelte';
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import { formatMoney } from "./../../helpers/app.js";
  import { CREATE_BUSINESS_ORDER } from "./mutations.js";
  import { GET_STORE_DELIVERIES_FOR_PRODUCERS, GET_ALL_PRODUCTS } from "./queries.js";
  import Select from "./../../components/controls/select/Select";
  import MyOrdersRoutes from "../my-orders/routes";
  import SearchProducerRoutes from "../search-producers/routes";
  import DeliveryKind from "../../enums/DeliveryKind";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import Loader from "./../../components/Loader.svelte";

  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();

  let normalizedProducts = [];
  let producerDeliveries = [];
  let producersDisplayed = [];
  let selectedDeliveries = [];
  let isLoading = false;
  let acceptCgv = false;
  let dirty = false;
  let isLoadingDeliveries = true;
  let comment = "";

  $: isCreatingOrder = false;

  $: isValid = acceptCgv && !producerDeliveries.find(d => !d.deliveryHour);

  const getAllAvailableProducts = async () => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_ALL_PRODUCTS, null, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      // todo
      return;
    }

    normalizedProducts = res.data.map((i) => {
      return {
        ...i,
        quantity: 0
      }
    }).sort((a, b) => a.producer.name >= b.producer.name ? 1 : -1);

    if (normalizedProducts.length > 1) {
      loadDeliveries(res.data.map((p) => p.producer.id).reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], []));
    }

    dirty = false;
  }

  const loadDeliveries = async (ids) => {
    var res = await graphQLInstance.query(GET_STORE_DELIVERIES_FOR_PRODUCERS, {
      input: {
        ids,
        kinds: [DeliveryKind.ProducerToStore.Value]
      }
    }, errorsHandler.Uuid);

    if (!res.success) {
      // todo
      isLoadingDeliveries = false;
      return;
    }

    producerDeliveries = res.data;
    selectedDeliveries = res.data.map((d) => {   
      return {
        id: d.id,
        name: d.name,
        selectedDelivery: d.deliveries[0],
        selectedDeliveryHour: d.deliveries[0].deliveryHours[0]
      }
    })

    isLoadingDeliveries = false;
  }

  const handleLess = productId => {
    let product = normalizedProducts.find(p => p.id === productId);

    if (product.quantity !== 0) {
      product.quantity = (product.quantity || 1) - 1;
      normalizedProducts[product] = product;
    }

    if (!dirty) dirty = true;
  };

  const handleMore = productId => {
    let product = normalizedProducts.find(p => p.id === productId);
    product.quantity = (product.quantity || 0) + 1;
    normalizedProducts[product] = product;

    if (!dirty) dirty = true;
  };

  const handleSubmit = async (products) => {
    isCreatingOrder = true;
    const productsFiltered = normalizedProducts.filter(p => p.quantity > 0);

    var res = await graphQLInstance.mutate(CREATE_BUSINESS_ORDER, {
      products: productsFiltered.map(product => {
        return {
          id: product.id,
          quantity: product.quantity
        };
      }),
      producersExpectedDeliveries: selectedDeliveries.map((d) => {
        return {
          producerId: d.id,
          deliveryModeId: d.selectedDelivery.id, 
          expectedDeliveryDate: d.selectedDeliveryHour.expectedDeliveryDate
        }
      })
    }, errorsHandler.Uuid);

    if (!res.success) {
      // todo 
      return;
    }

    isCreatingOrder = false;

    routerInstance.goTo(MyOrdersRoutes.List);
  }

  const showFilterProducersModal = () => {
    open(FilterProducersModal, {
      submit: () => {},
      producers: producerDeliveries,
      producersDisplayed,
      onClose: (res) => {
        producersDisplayed = res;
      }
    });
  };

  onMount(async () => {
    await getAllAvailableProducts();
  })

  $: productsCount = normalizedProducts.reduce((sum, product) => {
    return sum + (product.quantity || 0);
  }, 0);
  // todo calculer le deposit
  $: deposit = 0;
  $: totalHt = normalizedProducts.reduce((sum, product) => {
    return parseFloat(sum) + product.wholeSalePricePerUnit * (product.quantity || 0);
  }, 0);
  $: totalVat = normalizedProducts.reduce((sum, product) => {
    return parseFloat(sum) + product.vatPricePerUnit * (product.quantity || 0);
  }, 0);
  $: totalTtc = deposit + normalizedProducts.reduce((sum, product) => {
    return parseFloat(sum) + (product.wholeSalePricePerUnit + product.vatPricePerUnit) * (product.quantity || 0);
  }, 0);
</script>

<svelte:head>
  <title>Passer commande</title>
</svelte:head>

<TransitionWrapper>
  <form on:submit|preventDefault={handleSubmit}>
    <h1 class="font-semibold uppercase mb-0">Passer une commande</h1>
    <span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>
    <ErrorCard {errorsHandler} />
    {#if isLoading}
      <Loader />
    {:else if normalizedProducts.length > 0}
      {#if producerDeliveries.length > 1}
      <div class="hidden lg:block mb-5">
        <div class="themed w-full lg:w-1/2">
          <Select
            items={producerDeliveries}
            getOptionLabel={(l) => l.name}
            getSelectionLabel={(l) => l.name}
            showChevron={true}
            hideSelectedOnFocus={true}
            on:select={(selectedVal) => { producersDisplayed = selectedVal.detail ? selectedVal.detail.map((d) => d.id) : [] }}
            optionIdentifier="id"
            placeholder="Filtrez les producteurs"
            noOptionsMessage="Aucun producteur trouvé"
            isSearchable={true}
            isMulti={true}
            isClearable={false}
            containerStyles="font-weight: 600; color: #4a5568; height: 43px;" />
        </div>
      </div>
      {/if}
      <!-- <div class="block lg:hidden">
        <button on:click={showFilterProducersModal} type="button" class="btn btn-lg bg-white shadow">Filtrer les producteurs</button>
      </div> -->
      <div class="lg:flex lg:flex-row">
        <div class="mx-0 overflow-x-auto w-full lg:w-8/12 lg:pr-12">
          <div
            class="align-middle inline-block min-w-full overflow-hidden items">
            {#each (producersDisplayed.length > 0 ? normalizedProducts.filter((p) => producersDisplayed.includes(p.producer.id)) : normalizedProducts) as item, i (item.id)}
              {#if i === 0 || (producersDisplayed.length > 0 ? normalizedProducts.filter((p) => producersDisplayed.includes(p.producer.id)) : normalizedProducts)[i - 1].producer.name !== item.producer.name}
                <p style="border-bottom: 0;" class="text-lg font-semibold uppercase text-sm border border-gray-400 py-2 pl-3 bg-gray-100" class:mt-5={i >= 1}>
                  {item.producer.name}
                </p>
                <DeliveryModePicker 
                  selected={item.producer.delivery}
                  selectedDeliveryHour={item.producer.deliveryHour}
                  data={producerDeliveries.find(p => p.id === item.producer.id)}
                  storeDelivery={true} 
                  displayLocation={false}
                  isLoading={isLoadingDeliveries}
                />
              {/if}
              <div
              class="px-2 md:px-3 py-4 block md:flex md:flex-row bg-white border-b border-l border-r
              border-gray-400 border-solid items-center" class:bg-blue-100={item.quantity > 0}>
                <div class="md:w-6/12 px-3">
                  <div class="text-lg leading-5 font-medium">
                    <p>{item.name}</p>
                  </div>
                  <div class="text-sm leading-5">{formatMoney(item.wholeSalePricePerUnit)} / unité</div>
                </div>
                <div class="md:w-2/12 px-3 block md:hidden">
                    <p>
                      <span class="font-bold text-xl">
                        {formatMoney(item.wholeSalePricePerUnit * item.quantity || 0)} HT
                      </span>
                    </p>
                  </div>
                <div class="w-12/12 md:w-5/12 xl:w-3/12 px-3">
                    <div
                    class="flex m-auto border border-gray-400 border-solid rounded-full product-quantity">
                    <button
                      disabled={item.quantity === 0}
                      style="height: 36px;"
                      type="button"
                      aria-label="Retirer 1"
                      class="font-bold
                      transition duration-300 ease-in-out text-sm w-full rounded-l-full focus:outline-none  hover:bg-accent hover:text-white text-accent"
                      on:click|stopPropagation={() => handleLess(item.id)}>
                      -
                    </button>
                     <input
                      min="0"
                      max="999"
                      type="number"
                      on:click|stopPropagation
                      on:input={e => {
                        if (!dirty) dirty = true;

                        if (e.target.value.length > e.target.maxLength) {
                          e.target.value = e.target.value.slice(0, e.target.maxLength);
                        }
                      }}
                      maxLength="3"
                      bind:value={item.quantity}
                      class:font-bold={item.quantity > 0}
                      class="text-center w-full border-none rounded-none p-1 text-sm lg:text-base"
                      class:bg-blue-100={item.quantity > 0} />
                    <button
                      type="button"
                      style="height: 36px;"
                      class="font-bold
                      transition duration-300 ease-in-out text-sm w-full rounded-r-full focus:outline-none text-accent hover:bg-accent hover:text-white"
                      aria-label="Ajouter 1"
                      on:click|stopPropagation={() => handleMore(item.id)}>
                      +
                    </button>
                  </div>
                </div>
                <div class="md:w-3/12 px-3 text-right hidden md:block">
                  <p class="font-semibold text-lg">
                    {formatMoney(item.wholeSalePricePerUnit * item.quantity || 0)}
                  </p>
                  <p class="text-sm">H.T</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
        <div class="w-full lg:w-4/12">
          <div
            class="py-2 mb-6 pb-5 px-2 lg:px-6 lg:py-8 static lg:block
            bg-white shadow w-full"
            style="height: fit-content;">
            <div class="flex justify-between w-full px-3">
              <div class="text-left">
                <p>Montant HT</p>
                <p class="text-sm text-gray-600">
                  {#if productsCount > 0}
                    {productsCount} article{productsCount > 1 ? 's' : ''}
                  {:else}Aucun article{/if}
                </p>
              </div>
              <div>
                <p>{formatMoney(totalHt)}</p>
              </div>
            </div>
            <div class="flex justify-between w-full px-3">
              <div class="text-left">
                <p>TVA</p>
              </div>
              <div>
                <p>{formatMoney(totalVat)}</p>
              </div>
            </div>
            <div class="flex justify-between w-full px-3">
              <div class="text-left">
                <p>Consignes TTC</p>
              </div>
              <p>{formatMoney(deposit)}</p>
            </div>
            <div class="flex justify-between w-full px-3">
              <div class="text-left">
                <p>Total TTC</p>
              </div>
              <p class="font-bold text-lg">{formatMoney(totalTtc)}</p>
            </div>
            <div class="pt-2 lg:pt-3">
              <div class="pt-4 pb-8 px-2">
                <label class="cursor-pointer">
                  <InputCheckbox
                    checked={acceptCgv}
                    onClick={() => (acceptCgv = !acceptCgv)} />
                  Je reconnais avoir lu et compris
                  <a href="https://www.sheaft.com/legals" target="_blank">
                    les CGV
                  </a>
                  et je les accepte
                </label>
              </div>
              <button
                type="submit"
                class:disabled={productsCount === 0 || isCreatingOrder || !isValid}
                disabled={productsCount === 0 || isCreatingOrder || !isValid}
                class="btn btn-primary btn-lg uppercase w-full lg:w-8/12
                justify-center m-auto"
                style="padding-left: 50px; padding-right: 50px;">
                {#if isCreatingOrder}
                  <Icon data={faCircleNotch} spin />
                {:else}Valider{/if}
              </button>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="lg:flex lg:flex-row">
        <div
          class="text-center text-gray-600 flex w-full h-full justify-center
          items-center">
          <div>
            <p class="text-2xl">Vous n'avez aucun producteur avec qui échanger.</p>
            <p class="mb-5 text-2xl">Commençons par trouver des producteurs qui vous intéressent.</p>
            <button
              on:click={() => routerInstance.goTo(SearchProducerRoutes.Search)}
              type="button"
              aria-label="Accéder à la recherche de producteurs"
              class="btn btn-lg btn-accent mt-3 m-auto">
              Je me lance
            </button>
          </div>
        </div>
      </div> 
    {/if}
  </form>
</TransitionWrapper>


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

  .themed {
    --cursor: text;
    --padding: 22px 16px;
    --borderFocusColor: #a0aec0;
    --borderHoverColor: #a0aec0;
    --border: 1px solid #cbd5e0;
    --placeholderColor: #205164;
    --inputPadding: 45px;
    --inputColor: #205164;
    --multiItemMargin: 0 5px;
    --multiItemActiveBG: #edf2f7;
    --multiItemActiveColor: #205164;
    --multiClearHoverFill: #ff4081;
  }

</style>