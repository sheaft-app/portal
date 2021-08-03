<script>
	import GetAuthInstance from "./../../services/SheaftAuth";
	import DisplayStatusIcon from "./../../components/status/DisplayStatusIcon.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import MyOrderRoutes from "./routes";
	import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";
	import { timeSpanToFrenchHour, encodeQuerySearchUrl, formatMoney } from "./../../helpers/app";
	import Icon from "svelte-awesome";
	import { faMapMarkedAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
	import Roles from "./../../enums/Roles";

	export let order;

	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();
</script>

<div class="px-8 py-6 md:mb-3 bg-white md:shadow md:border-none border-b border-gray-400">
	<div class="flex flex-row items-center">
		<DisplayStatusIcon status={order.status} type="order" />
		<div class="ml-3 leading-tight">
			<p class="font-semibold text-{PurchaseOrderStatusKind.color(order.status)}">
				{PurchaseOrderStatusKind.label(order.status)}
			</p>
			<span class="text-lg font-medium">{order.vendor.name}</span>
		</div>
	</div>
	<div class="text-base mt-5 flex flex-row mb-1">
		{#if authInstance.isInRole([Roles.Store.Value])}
			<p class="text-gray-600 w-full">Commande</p>
		{:else}
			<p class="text-gray-600 w-full">Panier</p>
		{/if}
		<p class="text-normal font-semibold w-full">
			{formatMoney(order.totalOnSalePrice)} ({order.productsCount} articles)
		</p>
	</div>
	<div class="text-base flex flex-row mb-2">
		{#if authInstance.isInRole([Roles.Store.Value])}
			<p class="text-gray-600 w-full">Livraison prévue le</p>
		{:else}
			<p class="text-gray-600 w-full">À récupérer le</p>
		{/if}
		<div class="w-full">
			<p class="text-normal font-semibold w-full">
				{format(new Date(order.expectedDelivery.expectedDeliveryDate), "PPP", { locale: fr })}
			</p>
			<p class="text-normal font-semibold w-full">
				entre {timeSpanToFrenchHour(order.expectedDelivery.from)} et {timeSpanToFrenchHour(
					order.expectedDelivery.to
				)}
			</p>
		</div>
	</div>

	{#if !authInstance.isInRole([Roles.Store.Value]) && order.expectedDelivery.address}
		<div class="text-base flex flex-row mb-2">
			<p class="text-gray-600 w-full">Adresse</p>
			<div class="w-full">
				<p class="text-normal font-semibold w-full">{order.expectedDelivery.address.line1}</p>
				{#if order.expectedDelivery.address.line2}
					<p class="text-normal font-semibold w-full">{order.expectedDelivery.address.line2}</p>
				{/if}
				<p class="text-normal font-semibold w-full">
					{order.expectedDelivery.address.zipcode}
					{order.expectedDelivery.address.city}
				</p>
			</div>
		</div>
	{/if}
	{#if !authInstance.isInRole( [Roles.Store.Value] ) && (order.status != PurchaseOrderStatusKind.Refused.Value || order.status != PurchaseOrderStatusKind.Cancelled.Value || order.status != PurchaseOrderStatusKind.Delivered.Value)}
		<a
			target="_blank"
			class="btn px-3 py-1 bg-white text-accent shadow font-semibold hover:bg-gray-100"
			style="width: max-content"
			href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(
				order.expectedDelivery.address
			)}`}
		>
			<Icon data={faMapMarkedAlt} class="mr-2 w-4 h-4" />
			Voir le lieu sur Google Maps
		</a>
	{/if}
	<div class="mt-3">
		<a
			href="javascript:void(0)"
			class="btn px-3 py-1 bg-white text-accent shadow font-semibold hover:bg-gray-100"
			style="width: max-content"
			on:click={() => routerInstance.goTo(MyOrderRoutes.Details, { id: order.id })}
		>
			<Icon data={faChevronRight} class="mr-2 w-4 h-4" />
			Voir détails de la commande
		</a>
	</div>
</div>
