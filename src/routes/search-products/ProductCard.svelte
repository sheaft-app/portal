<script>
  import ProductCartQuantity from "./../../components/controls/ProductCartQuantity.svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import GetAuthInstance from "../../services/SheaftAuth.js";
  import Icon from "svelte-awesome";
  import { faMapMarkerAlt, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
  import { selectedItem } from "./../../stores/app.js";
  import cart from "./../../stores/cart";
  import { GetDistanceInfos } from "./../../helpers/distances.js";
  import { formatMoney, formatConditioningDisplay } from "./../../helpers/app";
import { config } from "../../configs/config";

  const routerInstance = GetRouterInstance();
  export let product, hoveredProduct = null, displayProducerData = true;

  const observer = new IntersectionObserver(onIntersect);
  let src = "";

  function lazyLoad(node) {
    observer.observe(node);
    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }

  function onIntersect(entries) {
    if (!src && entries[0].isIntersecting) {
      const img = new Image();
      let picture = null;
      
      if (document.documentElement.clientWidth <= 1023) {
        picture = product.imageSmall;
      } else {
        picture = product.imageMedium;
      }

      img.src = picture;
      img.onload = () => {
        src = picture;
      };

      return;
    }
  }

  const hoverProduct = product => {
    hoveredProduct = product;
  };

  let values = routerInstance.getQueryParams();
  let distanceInfos = displayProducerData ? GetDistanceInfos(values["latitude"],
      values["longitude"],
      product.producer.address.latitude,
      product.producer.address.longitude) : null;
</script>

<div 
  style="margin-bottom:1px;"
  class="cursor-pointer rounded hover:bg-gray-100 transition duration-200
  ease-in-out focus:outline-none"
  class:opacity-50={!product.available}
  use:lazyLoad
  on:click={() => selectedItem.set(product.id)}
  on:mouseenter={() => hoverProduct(product)}
  on:mouseleave={() => (hoveredProduct = null)}>
  <div class="shadow-md h-full bg-white">
    <div
      class="relative pb-5/6 overflow-hidden bg-black rounded-t-md lg:block
      hidden">
      {#if $cart.products.find((i) => i.id == product.id)}
        <TransitionWrapper
          classNames="absolute w-full h-full"
          style="z-index: 1; top: 40%;">
          <span class="bg-white px-3 py-2 uppercase">dans le panier</span>
        </TransitionWrapper>
      {/if}
      <div
        style="height: 150px; background-image: url({src}); background-size:
        cover; background-position: top;"
        class:opacity-50={$cart.products.find((i) => i.id == product.id)}
        class:skeleton-box={!src}
        class="transition duration-200 ease-in-out w-full rounded-t-md">
          {#if src.includes("pictures/tags/images/") && !$cart.products.find((i) => i.id == product.id)}
            <div class="absolute" style="z-index: 1; left: 50%; top: 40%; margin-left: -105px;">
              <div class="text-white text-lg p-1 bg-gray-800">
                Aucune image disponible
              </div>
            </div>
          {/if}
        </div>
    </div>
    <div class="relative lg:block flex p-3 lg:p-0">
      <div class="block lg:hidden w-1/4 text-xs">
        <div
          style="background-image: url({src}); background-size: cover;
          background-position: top;"
          class:skeleton-box={!src}
          class="h-20 mt-1 rounded-lg flex items-center justify-center mb-2 relative">
            {#if $cart.products.find((i) => i.id == product.id)}
              <div class="rounded-full p-1 w-6 h-6 text-center bg-white text-normal" style="
                line-height: 0;
                z-index: 1;
                box-shadow: rgba(0, 0, 0, .6) 0px 0px 5px 3px;">
                <Icon data={faShoppingCart} style="width: 14px;" />
              </div>
            {/if}
            {#if src.includes("pictures/tags/images/") && !$cart.products.find((i) => i.id == product.id)}
              <div class="absolute" style="bottom: 10%; font-size: .50rem;">
                <div class="text-white p-1 bg-gray-800">
                  Aucune image
                </div>
              </div>
            {/if}
          </div>
          {#if displayProducerData}
            <div class="text-center">
              <div class="w-full distance-badge inline-block text-xs font-bold px-2 py-1 rounded-full border" style="color: {distanceInfos.color}; border-color: {distanceInfos.color};">
                <div class="inline distance-badge-content">
                  <Icon
                    data={faMapMarkerAlt}
                    scale=".8"
                    class="ml-1 mr-1 distance-icon"
                    style="margin-top:-4px;" />
                  {distanceInfos.label}
                </div>
              </div>
            </div>
          {/if}
      </div>
      <div class="bg-white rounded-lg p-0 pl-3 lg:p-4 w-full">
        <div style="width: 30px; right: 15px;" class="absolute">
          {#if product.tags && product.tags.map(t => t.name).includes('bio')}
            <img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Bio" class="mb-1" />
          {/if}
          {#if product.isReturnable}
            <img src="./img/returnable.svg" alt="Consigné" class="mb-1" style="transform: scale(0.7);" />
          {/if}
        </div>
        <div class="pr-8">
          {#if displayProducerData}
            <div class="hidden lg:inline-block mb-2 text-xs font-bold px-2 py-1 rounded-full border" style="color: {distanceInfos.color}; border-color: {distanceInfos.color};">
              <Icon
                data={faMapMarkerAlt}
                scale=".8"
                class="ml-1 mr-1 distance-icon"
                style="margin-top:-4px;" />
              {distanceInfos.label}
            </div>
          {/if}
          <h4
            class="font-semibold text-base lg:text-lg leading-tight -mb-2
            lg:mb-0">
            {product.name}
          </h4>
          <div
            class="mt-2 md:mt-0 inline-flex items-center w-full text-xxs
            lg:text-sm">
            <RatingStars rating={product.rating} />
            <span class="text-gray-600 ml-2 hidden lg:block">
              {product.rating || 'Aucun avis'}
            </span>
          </div>
          <div
            class="text-base lg:text-lg w-full font-semibold mb-2
            justify-between items-center hidden lg:block">
            {formatMoney(product.onSalePricePerUnit)}
            <span class="text-xxs lg:text-sm lg:inline hidden font-normal">
              {formatConditioningDisplay(product.conditioning, product.quantityPerUnit, product.unit)}
            </span>
          </div>
          {#if displayProducerData}
            <div
              class="text-gray-600 text-xxs lg:text-xs uppercase font-semibold
              tracking-wide hidden lg:block">
              <p>{product.producer.name}</p>
            </div>
            <div
              class="text-xs text-gray-600 uppercase font-semibold hidden lg:block">
              <p>
                {product.producer.address.zipcode} {product.producer.address.city}
              </p>
            </div>
            <div
              class="mt-1 text-gray-600 text-xxs lg:text-xs uppercase
              font-semibold tracking-wide lg:mr-6 block lg:hidden">
              <p>{product.producer.name}</p>
            </div>
            <div
              class="text-xxs text-gray-600 uppercase font-semibold block
              lg:hidden">
              <p>
                {product.producer.address.zipcode} {product.producer.address.city}
              </p>
            </div>
          {/if}
        </div>
        <div class="flex mt-2 lg:mt-0 items-center justify-between">
          <div
            class="text-base lg:text-lg w-3/12 lg:w-full font-semibold lg:hidden">
            {formatMoney(product.onSalePricePerUnit)}
            <div class="text-xxs">{formatConditioningDisplay(product.conditioning, product.quantityPerUnit, product.unit)}</div>
          </div>
          {#if !GetAuthInstance().isInRole(["STORE", "PRODUCER"])}
              <div class="w-7/12 lg:w-full lg:mt-4">
                {#if !product.available}
                  <div>Non disponible</div>
                {:else}
                  <ProductCartQuantity productId={product.id} />
                {/if}
              </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @media (max-width: 375px) {
    .distance-badge {
      @apply px-1;
      @apply w-full;
      @apply text-center;
    }
  }
</style>
