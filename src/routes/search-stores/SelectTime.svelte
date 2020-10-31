<script>
	import DayOfWeekKind from './../../enums/DayOfWeekKind.js';
  import { onMount, onDestroy } from "svelte";
  import { GET_DELIVERIES } from "./queries";
  import Loader from "./../../components/Loader.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import { timeSpanToFrenchHour } from "./../../helpers/app";
  import DeliveryRoutes from "./../deliveries/routes";

  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let delivery = null;
  let isLoading = true;
  let mustGiveDeliveries = false;

  export let selectedDelivery = null;

  onMount(async () => {
    await fetchDelivery();
  })

  const fetchDelivery = async () => {
    const res = await graphQLInstance.query(GET_DELIVERIES);

    isLoading = false;

    if (!res.success) {
      // todo
      return;
    }

    if (res.data.length <= 0) {
      mustGiveDeliveries = true;
      return console.error("Producer must provide delivery hours");
    }

    isLoading = false;
    delivery = res.data[0];
  }

  const selectDelivery = (deliveryId, openingHour, index) => {
    let selectedHours = selectedDelivery ? selectedDelivery.selectedHours : [];

    if (selectedHours.find((h) => h.index === index)) {
      return selectedDelivery.selectedHours = selectedHours.filter((h) => h.index !== index);
    }

    return selectedDelivery = {
      deliveryId: delivery.id,
      selectedHours: [
        ...selectedHours,
        {
          index,
          ...openingHour
        }
      ]
    }
  }

  onDestroy(() => delivery = null)
</script>

<div class="form-control mt-2" style="display: block;">
  <div class="mb-2">
    <label for="grid-timestamp">Quels horaires préférez-vous pour livrer ce magasin ? (choix multiples) *</label>
  </div>
  {#if isLoading}
    <Loader />
  {:else if mustGiveDeliveries}
    <p>Vous devez renseigner vos horaires de livraison pour demander un accord.</p>
    <button class="btn btn-accent btn-lg" on:click={() => routerInstance.goTo(DeliveryRoutes.Create)}>Renseigner mes horaires de livraison</button>
  {:else if delivery}
    {#each delivery.openingHours as openingHour, index}
      <div 
        class:active={selectedDelivery && selectedDelivery.selectedHours && selectedDelivery.selectedHours.find((h) => h.index === index)}
        on:click={() => selectDelivery(delivery.id, openingHour, index)} 
        class="mb-2 cursor-pointer hover:bg-gray-100 shadow px-3 py-2 bg-white rounded">
        Le {DayOfWeekKind.label(openingHour.day).toLowerCase()} entre {timeSpanToFrenchHour(openingHour.from)} et {timeSpanToFrenchHour(openingHour.to)}
      </div>
    {/each}
  {/if}
</div>

<style lang="scss">
  .active {
    @apply bg-accent;
    @apply text-white;

    &:hover {
      @apply bg-accent;
      @apply text-white;
    }
  }
</style>