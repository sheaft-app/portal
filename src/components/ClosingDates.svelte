<script>
	import Icon from "svelte-awesome";
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import DatePickerWrapper from "./controls/DatePickerWrapper.svelte";
	import Toggle from "./controls/Toggle.svelte";
	import Guid from "./../helpers/Guid";
	import { slide } from "svelte/transition";

	export let closings = [],
		mustBeInterval = false;

	const addClosing = () => {
		closings = [
			...closings,
			{
				id: "local-" + Guid.NewGuid(),
				isInterval: true,
				from: new Date(),
				to: new Date(),
				reason: null,
				dirtyFrom: false,
				dirtyTo: false,
			},
		];
	};

</script>

<div class="w-full">
	{#each closings as closing, index}
		<div transition:slide|local>
			{#if index >= 1}
				<hr class="my-5" />
			{/if}
			<div class="form-control justify-between" class:justify-end={!mustBeInterval}>
				{#if !mustBeInterval}
					<Toggle labelPosition="left" classNames="ml-1" bind:isChecked={closing.isInterval}>Intervalle</Toggle>
				{/if}
				<button
					type="button"
					on:click={() => (closings = closings.filter((c) => c.id !== closing.id))}
					class="text-accent">Retirer cette plage</button
				>
			</div>
			<div class="my-2">
				<div class="flex items-center mb-2">
					{#if closing.isInterval}
						<span class="ml-2 mr-2 w-24">Début : </span>
					{:else}
						<span class="ml-2 mr-2 w-24">Jour : </span>
					{/if}
					<DatePickerWrapper bind:dateChosen={closing.dirtyFrom} bind:iso={closing.from} />
				</div>
				{#if closing.isInterval}
					<div class="flex items-center mb-2">
						<span class="ml-2 mr-2 w-24">Fin : </span>
						<DatePickerWrapper
							bind:dateChosen={closing.dirtyTo}
							bind:iso={closing.to}
							props={{ start: closing.from }}
						/>
					</div>
				{/if}
				<div class="w-full form-control ml-2 mt-2">
					<input bind:value={closing.reason} type="text" placeholder="Donnez une raison pour la fermeture" />
				</div>
			</div>
		</div>
	{/each}
	<button type="button" on:click={addClosing} class="btn btn-lg btn-outline ml-2">
		<Icon data={faPlus} class="mr-2" />
		Ajouter une fermeture
	</button>
</div>
