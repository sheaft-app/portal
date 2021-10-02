<script>
	import { slide } from "svelte/transition";
	import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
	import { formatMoney } from "./../../helpers/app.js";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
import DeliveryFeesApplication from "../../enums/DeliveryFeesApplication.js";

	export let producer;

	$: totalHT = producer.products.reduce((sum, product) => {
		return parseFloat(sum) + product.wholeSalePricePerUnit * (product.quantity || 0);
	}, 0);

	$: totalProductVAT = producer.products.reduce((sum, product) => {
		return parseFloat(sum) + product.vatPricePerUnit * (product.quantity || 0);
	}, 0);

	$: returnablesHT = producer.products.reduce((sum, product) => {
		return parseFloat(sum) + (product.returnable?.wholeSalePrice || 0) * (product.quantity || 0);
	}, 0);

	$: returnablesVAT = producer.products.reduce((sum, product) => {
		return parseFloat(sum) + (product.returnable?.vatPrice || 0) * (product.quantity || 0);
	}, 0);

	$: producerDeliveryFees = (producer) => {
		console.log(producer);
		if (
			producer.delivery &&
			producer.delivery.applyDeliveryFeesWhen &&
			producer.delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.TotalLowerThanPurchaseOrderAmount.Value
		) {
			let totalProducerOrder = producer.products.reduce((productSum, product) => {
				return (
					productSum +
					(product.wholeSalePricePerUnit + (product.returnable ? product.returnable.wholeSalePrice : 0)) *
						(product.quantity || 0)
				);
			}, 0);

			if (totalProducerOrder < producer.delivery.deliveryFeesMinPurchaseOrdersAmount)
				return {
					deliveryFeesHt: producer.delivery.deliveryFeesWholeSalePrice,
					deliveryFeesVat: producer.delivery.deliveryFeesVatPrice,
					deliveryFeesTtc: producer.delivery.deliveryFeesOnSalePrice,
				};
		} else if (
			producer.delivery &&
			producer.delivery.applyDeliveryFeesWhen &&
			producer.delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.Always.Value
		)
			return {
				deliveryFeesHt: producer.delivery.deliveryFeesWholeSalePrice,
				deliveryFeesVat: producer.delivery.deliveryFeesVatPrice,
				deliveryFeesTtc: producer.delivery.deliveryFeesOnSalePrice,
			};

		return {
			deliveryFeesHt: 0,
			deliveryFeesVat: 0,
			deliveryFeesTtc: 0,
		};
	};

	$: totalTTC = totalHT + totalProductVAT + returnablesHT + returnablesVAT + producerDeliveryFees(producer).deliveryFeesTtc;

	let productsExpanded = false;
</script>

<div class="px-4 py-2 shadow rounded">
	<p class="font-semibold mb-1 -mx-4 -my-2 bg-gray-200 px-4 py-2">{producer.name}</p>
	<p class="mb-1">Montant HT : {formatMoney(totalHT + returnablesHT)}</p>
	{#if producerDeliveryFees(producer).deliveryFeesHt > 0}
		<p class="mb-1">Livraison HT : {formatMoney(producerDeliveryFees(producer).deliveryFeesHt)}</p>
	{/if}
	<p class="mb-1">Montant TTC : {formatMoney(totalTTC)}</p>
	<p class="mb-2 mt-2">
		Livraison le {format(new Date(producer.deliveryHour.expectedDeliveryDate), "PP", { locale: fr })}
	</p>
	<div on:click={() => (productsExpanded = !productsExpanded)} class="font-semibold text-accent cursor-pointer mt-1">
		{#if !productsExpanded}
			<Icon data={faChevronDown} class="mr-2" />
			<span
				>{producer.products.length > 1
					? `Voir les ${producer.products.length} articles`
					: "Voir l'article"}</span
			>
		{:else}
			<Icon data={faChevronUp} class="mr-2" />
			<span>Replier le bandeau</span>
		{/if}
	</div>
	{#if productsExpanded}
		<div transition:slide|local class="w-12/12 py-5">
			{#each producer.products as product}
				<p class="font-semibold">{product.name} x{product.quantity}</p>
			{/each}
		</div>
	{/if}
</div>
