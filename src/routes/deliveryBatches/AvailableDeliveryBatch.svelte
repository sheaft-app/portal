<script>
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import { timeSpanToTime } from "../../helpers/app";

	export let deliveryBatch;
	export let selected = null;

	const from = timeSpanToTime(deliveryBatch.from);
	const to = timeSpanToTime(deliveryBatch.to);

	const getFirstClientName = () => {
		const sortedClients = deliveryBatch.clients.sort((a, b) => (a.position >= b.position ? 1 : -1));
		return sortedClients[0].name;
	};
</script>

<div
	class="delivery-card rounded-3xl px-4 py-2 bg-white cursor-pointer"
	class:selected={selected == deliveryBatch.id}
	on:click={() => (selected = deliveryBatch.id)}
>
	<div class="py-2 border-b border-gray-300">
		<p class="font-semibold text-xl">{deliveryBatch.name}</p>
		<p>{format(new Date(deliveryBatch.expectedDeliveryDate), "PPPP", { locale: fr })}</p>
		<p>
			entre {from.hours}h{from.minutes == 0 ? "00" : from.minutes} et {to.hours}h{to.minutes == 0 ? "00" : to.minutes}
		</p>
	</div>
	<div class="flex justify-between py-2 w-full">
		<div>
			<p class="text-gray-500">Magasins</p>
			<p class="text-primary text-2xl font-medium">{deliveryBatch.clientsCount}</p>
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
</div>

<style>
	.delivery-card {
		box-shadow: 0px 0px 10px 0px rgb(0 0 0 / 10%);
		max-width: 500px;
	}

	.delivery-card .delivery-status {
		height: fit-content;
	}

	.selected {
		border: 1px solid #ff4081;
		box-shadow: 0px 0px 30px 0px #ff408055;
	}
</style>
