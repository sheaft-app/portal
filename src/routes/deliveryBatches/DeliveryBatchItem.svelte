<script>
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import { timeSpanToTime } from "../../helpers/app";
	import GetRouterInstance from "../../services/SheaftRouter";
	import DeliveryBatchesRoutes from "./routes";
	import DeliveryBatchStatus from "../../enums/DeliveryBatchStatus";

	export let deliveryBatch;

	const routerInstance = GetRouterInstance();
	const from = timeSpanToTime(deliveryBatch.from);

	const getFirstClientName = () => {
		const sortedClients = deliveryBatch.deliveries.sort((a, b) => (a.position >= b.position ? 1 : -1));
		return sortedClients[0].client;
	};
</script>

<div class="delivery-card rounded-3xl px-4 py-2 bg-white">
	<div class="flex justify-between py-2 border-b border-gray-300">
		<div>
			<p class="font-semibold text-xl">{deliveryBatch.name}</p>
			<p>{format(new Date(deliveryBatch.scheduledOn), "PPPP", { locale: fr })}</p>
			<p>débute à {from.hours}h{from.minutes == 0 ? "00" : from.minutes}</p>
		</div>
		<span class="rounded-full px-4 py-1 text-gray-800 bg-green-200 delivery-status"
			>{DeliveryBatchStatus.label(deliveryBatch.status)}</span
		>
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
	<div class="flex justify-between py-2 items-center flex-wrap space-x-4">
		<div>
			<p class="text-gray-500">Livré par</p>
			<p class="font-medium text-lg">{deliveryBatch.assignedTo.firstName}</p>
		</div>
		<button
			on:click={() => routerInstance.goTo(DeliveryBatchesRoutes.Edit, { id: deliveryBatch.id })}
			class="btn btn-lg btn-accent text-lg font-semibold">Vérifier</button
		>
	</div>
</div>

<style>
	.delivery-card {
		box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 10%);
		max-width: 500px;
	}

	.delivery-card .delivery-status {
		height: fit-content;
	}
</style>
