<script>
	import Loader from "../Loader.svelte";
	import { slide } from "svelte/transition";
	import { onMount } from "svelte";
	import Guid from "./../../helpers/Guid";
	import { denormalizeOpeningHours } from "./../../helpers/app";
	import LetterCheckbox from "../controls/LetterCheckbox.svelte";
	import TimePicker from "../controls/TimePicker.svelte";

	export let openings = [];
	let isLoading = true;

	const addOpeningHour = () => {
		const newOpening = denormalizeOpeningHours([
			{
				id: Guid.NewGuid(),
				days: [],
				from: 0,
				to: 0,
			},
		]);

		openings = [...openings, ...newOpening];
	};

	const removeOpeningHour = (id) => {
		openings.filter((o) => o.id === id);
	};

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
			<div class="flex flex-wrap items-center my-2">
				<form class="inline-flex w-full">
					{#each opening.days as day, index}
						<label style="display: flex;" class="day-letter items-center p-2 cursor-pointer">
							<LetterCheckbox
								checked={day.checked}
								onClick={() => (day.checked = !day.checked)}
								sign={day.Label.charAt(0)}
							/>
						</label>
					{/each}
				</form>
				<div class="inline-flex items-center mb-2 sm:mb-0">
					<span class="ml-2 mr-2 hidden sm:block">de</span>
					<span class="ml-2 mr-2 block sm:hidden w-24">Début : </span>
					<TimePicker bind:time={opening.start} />
				</div>
				<div class="inline-flex items-center">
					<span class="ml-2 mr-2 hidden sm:block">à</span>
					<span class="ml-2 mr-2 block sm:hidden w-24">Fin : </span>
					<TimePicker bind:time={opening.end} />
				</div>
			</div>
			<div class="flex justify-end">
				<button
					type="button"
					on:click={() => (openings = openings.filter((o) => o.id !== opening.id))}
					class="text-accent">Retirer cet horaire</button
				>
			</div>
		</div>
	{/each}
	<div>
		<button type="button" class="btn px-3 py-2 btn-outline my-2" on:click={addOpeningHour}>+ Ajouter un horaire</button>
	</div>
{/if}
