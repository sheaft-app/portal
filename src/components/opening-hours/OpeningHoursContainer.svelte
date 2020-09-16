<script>
	import Loader from "../Loader.svelte";
  import { slide } from  "svelte/transition";
	import { onMount } from "svelte";
	import OpeningHours from "./OpeningHours.svelte";
	import Guid from "./../../helpers/Guid";
	import { denormalizeOpeningHours } from "./../../helpers/app";

	export let openings = [];
	let isLoading = true;

	openings = denormalizeOpeningHours(openings);

	const addOpeningHour = () => {
		openings = [
			...openings,
			{
				id: Guid.NewGuid(),
				days: [],
				start: {
					hours: 0,
					minutes: 0
				},
				end: {
					hours: 0,
					minutes: 0
				}
			}
		]
	};

	const removeOpeningHour = (id) => {
		openings.filter((o) => o.id === id);
	}

	onMount(async () => {
		isLoading = false;
	});
</script>

{#if isLoading}
	<Loader />
{:else}
	{#each openings as opening, index (opening.id)}
		<div transition:slide|local>
			{#if index >= 1}
				<hr class="my-5" />
			{/if}
			<OpeningHours bind:opening={opening} />
			<div class="flex justify-end">
				<button type="button" 
				on:click={() => openings = openings.filter((o) => o.id !== opening.id)}
				class="text-accent">Retirer cet horaire</button>
			</div>
		</div>	
	{/each}
	<div>
		<button type="button" class="btn px-3 py-2 btn-accent my-2" on:click={addOpeningHour}>+ Ajouter un horaire</button>
	</div>
{/if}