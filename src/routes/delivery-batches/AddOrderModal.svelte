<script>
	import { getContext, onMount } from "svelte";
	import { GET_AVAILABLE_DELIVERY_BATCHES, GET_COMPLETED_ORDERS, GET_DELIVERY_BATCHES, GET_DELIVERY_BATCH_DETAILS } from "./queries";
	import { UPDATE_DELIVERY_BATCH } from "./mutations";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import { formatMoney } from "../../helpers/app";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import Loader from "../../components/Loader.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";

	export let close;
	export let deliveryBatch;

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	let availableOrders = [];
	let isLoading = false;
	let isFetching = true;

	onMount(async () => {
		await query({
			query: GET_COMPLETED_ORDERS,
			variables: { includeProcessingPurchaseOrders: false },
			errorsHandler,
			success: (res) => {
				availableOrders = res.data;
			},
			error: () => close(),
			errorNotification: "Impossible de récupérer les informations des commandes",
		});
		isFetching = false;
	});

	const handleSubmit = async () => {
		let deliveriesToSend = deliveryBatch.deliveries.map((o) => ({
			clientId: o.client.id,
			position: o.position,
			purchaseOrderIds: o.purchaseOrders.map((p) => p.id),
		}));

		availableOrders
			.filter((a) => a.checked)
			.forEach((availableOrder) => {
				const client = deliveriesToSend.find((d) => d.clientId === availableOrder.sender.id);

				if (client) {
					client.purchaseOrderIds = [...client.purchaseOrderIds, availableOrder.id];
				} else {
					deliveriesToSend = [
						...deliveriesToSend,
						{
							clientId: availableOrder.sender.id,
							position: deliveriesToSend.length,
							purchaseOrderIds: [availableOrder.id],
						},
					];
				}
			});

		isLoading = true;
		await mutate({
			mutation: UPDATE_DELIVERY_BATCH,
			variables: {
				id: deliveryBatch.id,
				name: deliveryBatch.name,
				deliveries: deliveriesToSend,
			},
			errorsHandler,
			success: () => {
				close();
				routerInstance.refresh();
			},
			successNotification: "Commande(s) ajoutée(s) avec succès !",
			errorNotification: "Impossible d'ajouter une commande",
			clearCache: [deliveryBatch.id, GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};
</script>

<div class="pb-2">
	<div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
		<h3 class="text-lg font-semibold text-white mb-0">Choisir des commandes à ajouter</h3>
	</div>
	{#if isFetching}
		<Loader />
	{:else if availableOrders.length > 0}
		{#each availableOrders as order}
			<div
				class="flex border-b border-gray-400 py-2 items-center cursor-pointer"
				on:click={() => (order.checked = !order.checked)}
			>
				<div class="w-1/12">
					<InputCheckbox checked={order.checked} />
				</div>
				<div class="px-4 py-2 shadow rounded">
					<p class="font-semibold mb-1 -mx-4 -my-2 bg-gray-200 px-4 py-2">{order.sender.name}</p>
					<p class="mb-1">Référence : {order.reference}</p>
					<p class="mb-1">Montant HT : {formatMoney(order.totalWholeSalePrice)}</p>
					<p class="mb-1">Produits dans la commande : {order.productsCount}</p>
					<p class="mb-2">
						Livraison demandée le {format(new Date(order.expectedDelivery.expectedDeliveryDate), "PP", { locale: fr })}
					</p>
				</div>
			</div>
		{/each}
		<button
			class="btn btn-accent btn-lg my-3 m-auto"
			type="button"
			class:disabled={isLoading}
			disabled={isLoading}
			on:click={handleSubmit}
		>
			{#if isLoading}
				<Icon data={faCircleNotch} spin />
			{/if}
			Ajouter ces commandes
		</button>
	{:else}
		<p class="my-3">Aucune commande disponible.</p>
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
	{/if}
</div>
