<script>
	import Map from "./Map.svelte";
	import { GET_DELIVERY_BATCH_DETAILS } from "../queries";
	import { onMount, getContext } from "svelte";
	import SheaftErrors from "../../../services/SheaftErrors";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import DeliveryBatchRoutes from "../routes";
	import DeliverySummaryModal from "./DeliverySummaryModal.svelte";
    import DeliveryBatchStatus from "../../../enums/DeliveryBatchStatus";
    
    export let params = {};

	const { query } = getContext("api");
	const { open } = getContext("modal");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let meLocation = [];
	let otherStops = [];

	let destination;
	let deliveries = [];

	let isLoading = true;
	
	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryBatchRoutes.List),
			success: (res) => {
				deliveries = res.deliveries;

				destination = deliveries.find((d) => d.status == DeliveryBatchStatus.InProgress.Value);
				
				if (!destination) {
					if (deliveries.find((d) => d.status == DeliveryBatchStatus.Waiting.Value)) {
						return routerInstance.goTo(DeliveryBatchRoutes.NextDelivery, { id: params.id });
					} else if (res.status == DeliveryBatchStatus.Completed.Value) {
						return routerInstance.goTo(DeliveryBatchRoutes.EndDelivery, { id: params.id});
					} else {
						return routerInstance.goTo(DeliveryBatchRoutes.List);
					}
				}

				otherStops = deliveries.filter((d) => d.status == DeliveryBatchStatus.Waiting.Value).map((d) => [d.address.latitude, d.address.longitude]);

				const completedDeliveries = deliveries.filter((d) => d.status == DeliveryBatchStatus.Delivered.Value);

				if (completedDeliveries.length == 0) {
					meLocation = [res.assignedTo.address.latitude, res.assignedTo.address.longitude];
				} else {
					let lastCompletedDelivery = [];

					if (completedDeliveries.length > 1) {
						lastCompletedDelivery = completedDeliveries.sort((a, b) => a.position >= b.position ? -1 : 1)[0];
					} else {
						lastCompletedDelivery = completedDeliveries[0];
					}

					meLocation = [lastCompletedDelivery.address.latitude, lastCompletedDelivery.address.longitude];
				}
			},
			errorNotification: "Impossible de récupérer l'état de la livraison, retour à l'accueil."
		});
		isLoading = false;
	});
</script>

{#if !isLoading && destination}
	<Map 
		{meLocation} 
		{otherStops}
		{destination} />
	<div class="fixed left-0 bg-white w-full bottom-0 shadow-xl rounded-t-3xl py-2 px-4" style="z-index: 99999;">
		<div class="flex justify-between">
			<p class="text-gray-600 text-lg">On se dirige vers...</p>
			<p>{destination.position+1}/{deliveries.length}</p>
		</div>
		<p class="text-primary text-2xl uppercase font-semibold">{destination.client}</p>
		<div class="text-lg">
			<p>{destination.address.line1}</p>
			<p>{destination.address.zipcode} {destination.address.city}</p>
		</div>
		<div class="flex justify-end space-x-2 mt-3">
			<button class="btn btn-outline btn-lg">Quitter le module</button>
			<button 
				class="btn btn-accent btn-lg" 
				on:click={() => open(DeliverySummaryModal, { delivery: destination, numberOfDeliveries: deliveries.length, deliveryBatchId: params.id })}>
				Je suis arrivé
			</button>
		</div>
	</div>
{/if}