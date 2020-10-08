<script>
	import DisplayStatusIcon from "./../../components/status/DisplayStatusIcon.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import MyOrderRoutes from "./routes";
  import OrderStatusKind from "./../../enums/OrderStatusKind";
	import { timeSpanToFrenchHour, encodeQuerySearchUrl } from "./../../helpers/app";
	import Icon from "svelte-awesome";
	import { faMapMarkedAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";

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
	<div class="text-base flex flex-row mb-2">
		<p class="text-gray-600 w-full">À récupérer le</p>
		<div class="w-full">
			<p class="text-normal font-semibold w-full">{format(new Date(order.expectedDelivery.expectedDeliveryDate), 'PPP', { locale: fr })}</p>
			<p class="text-normal font-semibold w-full">entre {timeSpanToFrenchHour(order.expectedDelivery.from)} et {timeSpanToFrenchHour(order.expectedDelivery.to)}</p>
		</div>
	</div>
	<div class="text-base flex flex-row mb-2">
		<p class="text-gray-600 w-full">Lieu de récupération</p>
		<div class="w-full">
			<p class="text-normal font-semibold w-full">{order.expectedDelivery.address.line1}</p>
			{#if order.expectedDelivery.address.line2}
				<p class="text-normal font-semibold w-full">{order.expectedDelivery.address.line2}</p>
			{/if}
			<p class="text-normal font-semibold w-full">{order.expectedDelivery.address.zipcode} {order.expectedDelivery.address.city}</p>
		</div>
	</div>
	{#if order.status != OrderStatusKind.Refused.Value || order.status != OrderStatusKind.Cancelled.Value || order.status != OrderStatusKind.Delivered.Value}
		<a
			target="_blank"
			class="btn px-3 py-1 bg-white text-accent shadow font-semibold hover:bg-gray-100"
			style="width: fit-content"
			href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(order.expectedDelivery.address)}`}>
			<Icon data={faMapMarkedAlt} class="mr-2 w-4 h-4" />
			Voir le lieu sur Google Maps
		</a>
	{/if}
	<div class="mt-3">
		<a href="javascript:void(0)" 
			class="btn px-3 py-1 bg-white text-accent shadow font-semibold hover:bg-gray-100"
			style="width: fit-content"
			on:click="{() => routerInstance.goTo(MyOrderRoutes.Details, {id: order.id})}">
			<Icon data={faChevronRight} class="mr-2 w-4 h-4" />
			Voir détails de la commande
		</a>
	</div>
</div>