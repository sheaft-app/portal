<script>
	import { GET_DELIVERY_BATCH_DETAILS } from "../queries";
	import { SET_NEXT_DELIVERY } from "../mutations";
	import DeliveryBatchStatus from "../../../enums/DeliveryBatchStatus";
	import DeliveryStatus from "../../../enums/DeliveryStatus";
	import { onMount, getContext } from "svelte";
	import SheaftErrors from "../../../services/SheaftErrors";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import DeliveryBatchRoutes from "../routes";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import SetDestinationModal from "./SetDestinationModal.svelte";
	import ErrorCard from "../../../components/ErrorCard.svelte";

	const { query, mutate } = getContext("api");
	const { open } = getContext("modal");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	export let params = {};

	let nextStop;
	let delivery;
	let readyDeliveries = [];
	let isLoading = true;
	let isSubmitting = false;

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryBatchRoutes.List),
			success: (res) => {
				delivery = res;
				readyDeliveries = res.deliveries.filter((d) => d.status == DeliveryStatus.Ready.Value);

				if (res.status == DeliveryBatchStatus.InProgress.Value) {
					if (res.deliveries.find((d) => d.status == DeliveryStatus.InProgress.Value)) {
						return routerInstance.goTo(DeliveryBatchRoutes.Process, { id: params.id });
					}

					if (readyDeliveries.length == 0) {
						return routerInstance.goTo(DeliveryBatchRoutes.EndDelivery, { id: params.id });
					}

					if (readyDeliveries.length > 1) {
						readyDeliveries = readyDeliveries.sort((a, b) => (a.position >= b.position ? 1 : -1));
					}

					nextStop = readyDeliveries[0];
				} else if (res.status == DeliveryBatchStatus.Completed.Value) {
					return routerInstance.goTo(DeliveryBatchRoutes.EndDelivery, { id: params.id });
				}
			},
			errorNotification: "Impossible de récupérer l'état de la livraison, retour à l'accueil.",
		});
		isLoading = false;
	});

	const openSetDestinationModal = () =>
		open(SetDestinationModal, {
			remainingStops: delivery.deliveries.filter((d) => d.status == DeliveryBatchStatus.Waiting.Value),
			onClose: (stop) => {
				nextStop = stop;
			},
		});

	const handleSubmit = async () => {
		isSubmitting = true;
		await mutate({
			mutation: SET_NEXT_DELIVERY,
			variables: {
				deliveryBatchId: params.id,
				deliveryId: nextStop.id,
				autostartDelivery: true,
			},
			errorsHandler,
			success: async () => {
				await routerInstance.goTo(DeliveryBatchRoutes.Process, { id: params.id });
			},
			successNotification: "Ok, on repart !",
			errorNotification: "Impossible de valider la nouvelle destination. Veuillez réessayer.",
			clearCache: [params.id],
		});
		isSubmitting = false;
	};
</script>

<ErrorCard {errorsHandler} />
{#if isLoading}
	<p>Chargement...</p>
{:else if nextStop}
	<div class="relative rounded-3xl py-2 h-full">
		<div class="flex justify-between">
			<p class="text-2xl font-semibold">{delivery.name}</p>
			<p>{nextStop.position + 1}/{delivery.deliveries.length}</p>
		</div>
		<div class="text-center absolute center-block">
			<p class="mb-5 text-lg">Prochain arrêt...</p>
			<div class="border bg-gray-200 rounded-3xl py-2 px-8">
				<p class="text-primary text-2xl font-semibold uppercase mt-2">{nextStop.client}</p>
				<p class="text-lg">{nextStop.address.line1}</p>
				<p class="text-lg">{nextStop.address.zipcode} {nextStop.address.city}</p>
			</div>
		</div>
		<div class="bottom-cta absolute w-full px-4 space-y-3">
			{#if readyDeliveries.length > 1}
				<button
					disabled={isSubmitting}
					type="button"
					class="block btn btn-lg btn-outline w-full text-center justify-center"
					on:click={openSetDestinationModal}>Changement de plan</button
				>
			{/if}
			<button
				type="button"
				class="block btn btn-lg btn-accent w-full text-center justify-center"
				disabled={isSubmitting}
				class:disabled={isSubmitting}
				on:click={handleSubmit}
			>
				{#if isSubmitting}
					<Icon data={faCircleNotch} class="mr-2" spin />
				{/if}
				Oui, allons-y !
			</button>
		</div>
	</div>
{/if}

<style>
	.center-block {
		top: calc(50% - 162px);
		left: calc(50% - 104.5px);
	}
</style>
