<script>
	import { slide } from "svelte/transition";
	import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
	import { formatMoney } from "./../../helpers/app.js";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let producer;

	$: totalHT =
		producer.products.reduce((sum, product) => {
			return parseFloat(sum) + product.wholeSalePricePerUnit * (product.quantity || 0);
		}, 0);

	$: returnablesHT =
		producer.products.reduce((sum, product) => {
			return parseFloat(sum) + product.returnable.wholeSalePrice * (product.quantity || 0);
		}, 0);

	$: returnablesVAT =
		producer.products.reduce((sum, product) => {
			return parseFloat(sum) + product.returnable.vatPrice * (product.quantity || 0);
		}, 0);

	$: totalTTC = totalHT + returnablesHT + returnablesVAT;

	let productsExpanded = false;
</script>

<div class="px-4 py-2 shadow rounded">
	<p class="font-semibold mb-1 -mx-4 -my-2 bg-gray-200 px-4 py-2">{producer.name}</p>
	<p class="mb-1">Montant HT : {formatMoney(totalHT)}</p>
	<p class="mb-1">Consignes HT : {formatMoney(returnablesHT)} (+ {formatMoney(returnablesVAT)} TVA)</p>
	<p class="mb-1">Montant TTC : {formatMoney(totalTTC)}</p>
	<p class="mb-2">Livraison le {format(new Date(producer.deliveryHour.expectedDeliveryDate), "PP", { locale: fr })}</p>
	<div on:click={() => (productsExpanded = !productsExpanded)} class="font-semibold text-accent cursor-pointer mt-1">
		{#if !productsExpanded}
			<Icon data={faChevronDown} class="mr-2" />
			<span>{producer.products.length > 1 ? `Voir les ${producer.products.length} articles` : "Voir l'article"}</span>
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
