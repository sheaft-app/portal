<script>
	import SvelteDatePicker from "./datepicker/SvelteDatePicker.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let placeholder = null;
	export let selected = new Date();
	export let dateChosen = false;
	export let start = new Date();
	export let end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
	export let props = {};

	let formattedSelected;
</script>

<SvelteDatePicker
	format={(date) => format(new Date(selected), "PPPP", { locale: fr })}
	{...props}
	{start}
	{end}
	bind:selected
	bind:dateChosen
	bind:formattedSelected
	style="width: 100%"
>
	<button type="button" class="bg-white py-3 px-4 rounded border border-gray-400" aria-label="Sélectionner une date">
		{#if dateChosen}
			{formattedSelected}
		{:else}
			{placeholder || "Sélectionnez une date"}
		{/if}
	</button>
</SvelteDatePicker>

<style lang="scss">
	button {
		&.active {
			@apply bg-white;
			color: #ff4081;
		}
	}
</style>
