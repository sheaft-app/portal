<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { GET_AVAILABLE_DELIVERY_BATCHES, GET_DELIVERY_BATCHES } from "./queries.js";
	import { CREATE_DELIVERY_BATCH } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { getContext, onMount } from "svelte";
	import AvailableDeliveryBatch from "./AvailableDeliveryBatch.svelte";
	import Guid from "../../helpers/Guid";
	import GetRouterInstance from "../../services/SheaftRouter";
	import DeliveryBatchesRoutes from "./routes";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	export let close;

	let isLoading = false;
	let selected = null;
	let deliveries = [];

	onMount(async () => {
		await query({
			query: GET_AVAILABLE_DELIVERY_BATCHES,
			variables: { includeProcessingPurchaseOrders: false },
			success: (res) => (deliveries = res.data.map((r) => ({ ...r, id: Guid.NewGuid() }))),
			errorsHandler,
			errorNotification: "Impossible de charger les livraisons disponibles",
		});
	});

	const handleSubmit = async () => {
		const selectedDelivery = deliveries.find((d) => d.id == selected);
		isLoading = true;
		await mutate({
			mutation: CREATE_DELIVERY_BATCH,
			variables: {
				from: selectedDelivery.from,
				name: selectedDelivery.name,
				scheduledOn: selectedDelivery.expectedDeliveryDate,
				deliveries: selectedDelivery.clients.map((c) => ({
					clientId: c.id,
					purchaseOrderIds: c.purchaseOrders.map((p) => p.id),
					position: c.position,
				})),
			},
			success: async (res) => {
				routerInstance.refresh();
				close();
			},
			errorsHandler,
			errorNotification: "Impossible de programmer la livraison",
			clearCache: [GET_AVAILABLE_DELIVERY_BATCHES, GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Programmer une livraison"
	{isLoading}
	{close}
	valid={selected !== null}
	submit={handleSubmit}
	submitText="Confirmer"
	closeText="Annuler"
>
	{#if deliveries && deliveries.length > 0}
		<p>Sélectionnez la livraison à programmer.</p>
		<p class="mb-3">
			Vous pourrez ensuite configurer l'horaire de départ ainsi que les commandes à ajouter (s'il y en a).
		</p>
		{#each deliveries as deliveryBatch}
			<div class="mb-2">
				<AvailableDeliveryBatch {deliveryBatch} bind:selected />
			</div>
		{/each}
	{:else}
		<p>Aucune livraison n'est prête à être programmée.</p>
		<p>Nous vous proposerons automatiquement des livraisons quand des commandes seront prêtes.</p>
	{/if}
</ActionConfirm>
