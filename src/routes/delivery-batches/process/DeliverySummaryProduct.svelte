<script>
	import { slide } from "svelte/transition";
	import Icon from "svelte-awesome";
	import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
	import ProductCounter from "./ProductCounter.svelte";

	export let product;
	export let index;
	export let numberOfProducts;
	export let isExpandedByDefault = false;

	let displayQuantifier = isExpandedByDefault;
</script>

<div class="py-3 flex-wrap flex items-center justify-between">
	<div class="w-6/12">
		<p class="font-semibold">{product.name}</p>
		{#if !isExpandedByDefault && !displayQuantifier}
			<p>{product.delivered} livré(s)</p>
		{:else}
			<p>{product.quantity} attendu(s)</p>
		{/if}
	</div>
	{#if !isExpandedByDefault}
		<div>
			<button type="button" on:click={() => (displayQuantifier = !displayQuantifier)} class="btn btn-link"
				>{#if !displayQuantifier}Modifier{:else}Valider{/if}</button>
		</div>
	{/if}
	<div transition:slide|local>
		{#if displayQuantifier}
			<ProductCounter bind:value={product.delivered} label="livré(s)"/>
		{/if}
	</div>
</div>
