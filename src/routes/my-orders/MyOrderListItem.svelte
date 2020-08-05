<script>
	import DisplayStatusIcon from "./../../components/status/DisplayStatusIcon.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import MyOrderRoutes from "./routes";
  import OrderStatusKind from "./../../enums/OrderStatusKind";

  export let order;
  const routerInstance = GetRouterInstance();
</script>
<div
	class="px-6 py-6 md:mb-3 bg-white md:shadow md:border-none border-b border-gray-400">
	<div class="flex flex-row items-center">
		<DisplayStatusIcon status={order.status} type="order" />
		<div class="ml-3 leading-tight">
			<p class="font-semibold text-{OrderStatusKind.color(order.status)}">{OrderStatusKind.label(order.status)}</p>
			<span class="text-lg font-medium">{order.vendor.name}</span>
		</div>
	</div>
	<div class="text-base mt-5 flex flex-row mb-1">
		<p class="text-gray-600 w-full">Panier</p>
		<p class="text-normal font-semibold w-full">{order.totalOnSalePrice}€ ({order.productsCount} articles)</p>
	</div>
	<div class="text-base flex flex-row mb-1">
		<p class="text-gray-600 w-full">Passée le</p>
		<p class="text-normal font-semibold w-full">{format(new Date(order.createdOn), 'PP', { locale: fr })}</p>
	</div>
	<div class="text-base flex flex-row mb-1">
		<p class="text-gray-600 w-full">À récupérer le</p>
		<p class="text-normal font-semibold w-full">{format(new Date(order.expectedDelivery.expectedDeliveryDate), 'PP', { locale: fr })}</p>
	</div>
	<div class="mt-3">
		<a href="javascript:void(0)"
			on:click="{() => routerInstance.goTo(MyOrderRoutes.Details, {id: order.id})}">
			Détails de la commande
		</a>
	</div>
</div>