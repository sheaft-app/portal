<script>
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";

	export let picking;
	export let selected = null;
</script>

<div
	class="delivery-card rounded-3xl px-4 py-2 bg-white cursor-pointer"
	class:selected={selected == picking.id}
	on:click={() => (selected = picking.id)}
>
	<div class="py-2 border-b border-gray-300">
		<p class="text-gray-600">Préparation des produits pour :</p>
		<p class="font-semibold text-xl">{picking.name}</p>
		<p>{format(new Date(picking.expectedDeliveryDate), "PPPP", { locale: fr })}</p>
	</div>
	<div class="flex justify-between py-2 w-full">
		<div>
			<p class="text-gray-500">Produits</p>
			<p class="text-primary text-2xl font-medium">{picking.productsCount}</p>
		</div>
		<div>
			<p class="text-gray-500">Commandes</p>
			<p class="text-primary text-2xl font-medium">{picking.purchaseOrdersCount}</p>
		</div>
		<div>
			<p class="text-gray-500">Magasins</p>
			<p class="text-primary text-2xl font-medium">{picking.clientsCount}</p>
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
