<script>
	import Map from "./Map.svelte";
	import { GET_DELIVERY_BATCH_DETAILS } from "../queries";
	import { onMount, getContext } from "svelte";
	import SheaftErrors from "../../../services/SheaftErrors";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import DeliveryBatchRoutes from "../routes";
	import DeliveryBatchStatus from "../../../enums/DeliveryBatchStatus";

	export let deliveryId;

	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let meLocation = [];
	let otherStops = [];

	let destination;
	let destinationLocation = [];

	let isLoading = true;
	
	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: deliveryId },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryBatchRoutes.List),
			success: (res) => {
				const deliveries = res.deliveries;

				destination = deliveries.find((d) => d.status == DeliveryBatchStatus.InProgress.Value);
				otherStops = deliveries.filter((d) => d.status == DeliveryBatchStatus.Waiting.Value).map((d) => [d.address.latitude, d.address.longitude]);

				const completedDeliveries = deliveries.filter((d) => d.status == DeliveryBatchStatus.Completed.Value);

				if (completedDeliveries.length == 0) {
					meLocation = [res.assignedTo.address.latitude, res.assignedTo.address.longitude];
				} else {
					lastCompletedDelivery = completedDeliveries.sort((a, b) => a.position >= b.position ? -1 : 1)[0];
					meLocation = [lastCompletedDelivery.address.latitude, lastCompletedDelivery.address.longitude];
				}
			},
			errorNotification: "Impossible de récupérer l'état de la livraison, retour à l'accueil."
		});
		isLoading = false;
	});
</script>

{#if !isLoading}
	<Map 
		{meLocation} 
		{otherStops}
		{destination} />
	<div class="fixed left-0 bg-white w-full bottom-0 shadow-xl rounded-t-3xl py-2 px-4" style="z-index: 99999;">
		<p class="text-gray-600 text-lg">On se dirige vers...</p>
		<p class="text-primary text-2xl uppercase font-semibold">{destination.client}</p>
		<div class="text-lg">
			<p>{destination.address.line1}</p>
			<p>{destination.address.zipcode} {destination.address.city}</p>
		</div>
		<div class="flex justify-end space-x-2">
			<button class="btn btn-outline btn-lg">Quitter le module</button>
			<button class="btn btn-accent btn-lg">Je suis arrivé</button>
		</div>
	</div>
{/if}