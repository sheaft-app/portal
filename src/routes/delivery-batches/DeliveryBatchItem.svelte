<script>
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import { timeSpanToTime } from "../../helpers/app";
	import GetRouterInstance from "../../services/SheaftRouter";
	import DeliveryBatchesRoutes from "./routes";
	import Icon from "svelte-awesome";
	import { faChevronRight, faEye, faCheck } from "@fortawesome/free-solid-svg-icons";
	import DeliveryBatchStatus from "../../enums/DeliveryBatchStatus";
	import { getContext } from "svelte";
	import StartDeliveryModal from "./StartDeliveryModal.svelte";
	import PostponeDeliveryBatchModal from "./PostponeDeliveryBatchModal.svelte";
	import SetDeliveryBatchAsReadyModal from "./SetDeliveryBatchAsReadyModal.svelte";

	export let deliveryBatch;

	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const from = timeSpanToTime(deliveryBatch.from);

	const getFirstClientName = () => {
		const sortedClients = deliveryBatch.deliveries.sort((a, b) => (a.position >= b.position ? 1 : -1));
		return sortedClients[0].client.name;
	};
</script>

<div class="delivery-card rounded-3xl px-4 py-2 bg-white">
	<div class="flex justify-between py-2 border-b border-gray-300 flex-wrap flex-col-reverse xl:flex-nowrap xl:flex-row">
		<div style="max-width: 190px;">
			<p class="font-semibold text-xl">{deliveryBatch.name}</p>
			<p>{format(new Date(deliveryBatch.scheduledOn), "PPPP", { locale: fr })}</p>
			<p>débute à {from.hours}h{from.minutes == 0 ? "00" : from.minutes}</p>
		</div>
		<div class="flex justify-between xl:justify-end items-top xl:flex-wrap xl:text-right">
			<span class="rounded-full px-4 py-1 text-gray-800 bg-green-200 delivery-status mb-1 xl:mb-0">
				{DeliveryBatchStatus.label(deliveryBatch.status)}
			</span>
			{#if deliveryBatch?.deliveryFormsUrl}
				<div class="xl:w-full">
					<a target="_blank" href={deliveryBatch.deliveryFormsUrl} class="btn-link" style="display: inline-block;">
						<Icon data={faEye} class="mr-1" />
						Voir les B.L
					</a>
				</div>
			{/if}
		</div>
	</div>
	<div class="flex justify-between py-2 border-b border-gray-300 w-full">
		<div>
			<p class="text-gray-500">Magasins</p>
			<p class="text-primary text-2xl font-medium">{deliveryBatch.deliveriesCount}</p>
		</div>
		<div>
			<p class="text-gray-500">Commandes</p>
			<p class="text-primary text-2xl font-medium">{deliveryBatch.purchaseOrdersCount}</p>
		</div>
		<div style="max-width: 160px;">
			<p class="text-gray-500 m-0">Premier magasin</p>
			<p class="m-0 mb-2">{getFirstClientName()}</p>
		</div>
	</div>
	<div class="flex justify-between py-2 items-center flex-wrap md:space-x-4">
		<div>
			<p class="text-gray-500">Livré par</p>
			<p class="font-medium text-lg">{deliveryBatch.assignedTo.firstName}</p>
		</div>
		<div class="flex space-x-2 w-full md:w-auto justify-center md:justify-start mt-1 md:mt-0">
			{#if deliveryBatch.status == DeliveryBatchStatus.InProgress.Value || deliveryBatch.status == DeliveryBatchStatus.Ready.Value}
				<button
					on:click={() => open(PostponeDeliveryBatchModal, { id: deliveryBatch.id })}
					class="btn btn-lg btn-outline text-lg font-semibold"
					>Décaler
				</button>

				{#if deliveryBatch.status == DeliveryBatchStatus.Ready.Value}
					<button
						on:click={() => open(StartDeliveryModal, { id: deliveryBatch.id })}
						class="btn btn-lg btn-accent text-lg font-semibold"
						>Lancer
						<Icon class="ml-2" data={faChevronRight} />
					</button>
				{:else}
					<button
						on:click={() => routerInstance.goTo(DeliveryBatchesRoutes.Process, { id: deliveryBatch.id })}
						class="btn btn-lg btn-accent text-lg font-semibold"
						>Reprendre
						<Icon class="ml-2" data={faChevronRight} />
					</button>
				{/if}
			{:else if deliveryBatch.status == DeliveryBatchStatus.Waiting.Value}
				<button
					on:click={() => routerInstance.goTo(DeliveryBatchesRoutes.Edit, { id: deliveryBatch.id })}
					class="btn btn-lg btn-outline text-lg font-semibold"
					>Modifier
				</button>
				<button
					on:click={() => open(SetDeliveryBatchAsReadyModal, { id: deliveryBatch.id })}
					class="btn btn-lg btn-accent text-lg font-semibold"
					>Confirmer
					<Icon class="ml-2" data={faCheck} />
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.delivery-card {
		box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 10%);
		max-width: 500px;
	}

	.delivery-card .delivery-status {
		height: fit-content;
		width: fit-content;
	}
</style>
