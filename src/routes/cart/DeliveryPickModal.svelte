<script>
  import { onMount } from "svelte";
	import DeliveryKind  from './../../enums/DeliveryKind.js';
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { format } from "date-fns";
  import Icon from "svelte-awesome";
  import { timeSpanToFrenchHour } from "./../../helpers/app.js";
  import { faTimes, faClock, faCalendar, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
  import { fr } from "date-fns/locale";
  import Slider from "../../components/Slider.svelte";
  import Loader from "../../components/Loader.svelte";
  import { GetDistanceInfos } from "./../../helpers/distances.js";
  import orderBy from "lodash/orderBy";

  export let close, introEnded, data, onClose, selected, selectedDeliveryHour, storeDelivery;

  const routerInstance = GetRouterInstance();

  let isLoading = true;
  let scrolledBottom = true;
  let location = null;
  let slides = [];

  onMount(() => {
    location = JSON.parse(localStorage.getItem('user_location'));

    slides = data.deliveries.map((d) => {
      return {
        ...d,
        distanceInfos: location && d.address && d.address.latitude && d.address.longitude ? GetDistanceInfos(
          location.latitude,
          location.longitude,
          d.address.latitude,
          d.address.longitude
        ) : null,
      }
    })

    if (location) {
      slides = orderBy(slides, (d) => d.distanceInfos.distance, ['asc']);
    }

    isLoading = false;
  })

  async function updateSelectedValue(delivery, deliveryHour) {
    selectedDeliveryHour = deliveryHour;
    selected = delivery;

    close();
    if (onClose) await onClose(selected, selectedDeliveryHour);
  }
</script>

<div class="pb-2">
  <div class="flex justify-between bg-primary -mx-6 px-6 py-2 -my-2 mb-5 items-center md:rounded-t-l">
    <h3 class="text-lg font-semibold delivery-title text-white mb-0">
      {#if storeDelivery}
        Livraison {data.name}
      {:else}
        {data.name}
      {/if}
    </h3>
    <button type="button" on:click={close}>
      <Icon data={faTimes} />
    </button>
  </div>
  <form>
    {#if isLoading}
      <Loader />
    {:else}
      <Slider start={selected ? data.deliveries.findIndex((d) => d.kind == selected.kind) : 0} {slides} let:slide={delivery} let:index>
        <div class="w-full">
          <div>
            <div class="uppercase font-normal mb-5 lg:mr-5 text-center">
              <p class="font-semibold">{DeliveryKind.label(delivery.kind)}</p>
              {#if delivery.address}
                <p>{delivery.address.line1}</p>
                {#if delivery.address.line2}
                  <p>{delivery.address.line2}</p>
                {/if}
                <p>{delivery.address.zipcode} {delivery.address.city}</p>
              {/if}
              {#if delivery.distanceInfos}
                <div
                  class="distance-badge-content text-sm flex justify-center mt-2" style="color: {delivery.distanceInfos.color};">
                  <Icon data={faMapMarkerAlt} scale="1.4" class="pr-1" />
                  <p class="font-bold">{delivery.distanceInfos.label}</p>
                </div>
              {/if}
            </div>
          </div>
          <div>
            {#each delivery.deliveryHours as deliveryHour, index}
              <div
                class:active={(!delivery.address || delivery.address && selected && selected.address && delivery.address.line1 === selected.address.line1) && selectedDeliveryHour && deliveryHour.from === selectedDeliveryHour.from && deliveryHour.to === selectedDeliveryHour.to && deliveryHour.expectedDeliveryDate === selectedDeliveryHour.expectedDeliveryDate}
                class="mb-2 cursor-pointer hover:bg-gray-100 shadow px-3 py-2
                bg-white rounded"
                on:click={() => updateSelectedValue(delivery, deliveryHour)}>
                <p class="font-semibold">
                  <Icon data={faCalendar} class="mr-2 w-3 h-3"/>
                  {format(new Date(deliveryHour.expectedDeliveryDate), 'PPPP', {
                    locale: fr
                  })}
                </p>
                <p>
                  <Icon data={faClock} class="mr-2 w-3 h-3" />
                  de {`${timeSpanToFrenchHour(deliveryHour.from)}`}
                  à {`${timeSpanToFrenchHour(deliveryHour.to)}`}
                </p>
              </div>
            {/each}
          </div>
        </div>
      </Slider>
    {/if}
  </form>
</div>

<style lang="scss">
  .scroll {
    bottom: 130px;

    @media (max-width: 768px) {
      bottom: 30px;
      right: 30px;
    }
  }

  .delivery-title {
    @media (min-width: 769px) {
      max-width: 500px;
    }
  }

  .active {
    @apply bg-accent;
    @apply text-white;
    @apply cursor-default;

    &:hover {
      @apply bg-accent;
      @apply text-white;
      @apply cursor-default;
    }
  }
</style>
