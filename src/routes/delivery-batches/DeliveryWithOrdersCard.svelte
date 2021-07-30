<script>
	import format from "date-fns/format";
	import { formatMoney } from "./../../helpers/app.js";
	import fr from "date-fns/locale/fr";
	import PurchaseOrderRoutes from "../purchase-orders/routes";
	import GetRouterInstance from "../../services/SheaftRouter";

	export let props;

	const routerInstance = GetRouterInstance();
</script>

<div class="py-3 px-4 store-card">
	<p class="font-semibold mb-1">{props.client.name}</p>
	<p class="text-gray-600">{props.address.line1}</p>
	<p class="text-gray-600">{props.address.zipcode} {props.address.city}</p>
	{#each props.purchaseOrders as purchaseOrder}
		<p class="mt-2">
			Commande (<a
				href="javascript:void(0)"
				on:click={() => routerInstance.goTo(PurchaseOrderRoutes.Details, { id: purchaseOrder.id })}
				>{purchaseOrder.reference}</a
			>) de {formatMoney(purchaseOrder.totalWholeSalePrice)} contenant {purchaseOrder.productsCount} produits
		</p>
		<p class="text-gray-500">passée le {format(new Date(purchaseOrder.createdOn), "PPPP", { locale: fr })}</p>
	{/each}
</div>

<style>
	@media (min-width: 375px) {
		.store-card {
			min-width: 340px;
		}
	}
</style>
