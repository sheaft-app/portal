<script>
	import { onMount } from "svelte";
	import InputCheckbox from "./../../components/controls/InputCheckbox.svelte";
	import Icon from "svelte-awesome";
	import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

	export let onClose, close, producers, producersDisplayed;

	let selectedProducers = [];

	onMount(() => {
		if (producersDisplayed.length > 0) {
			selectedProducers = producersDisplayed.map((p) => p.id);
		}
	});

	const handleClick = (producer) => {
		if (selectedProducers.includes(producer.id)) {
			selectedProducers = selectedProducers.filter((p) => p.id !== producer.id);
		} else {
			selectedProducers = [...selectedProducers, producer.id];
		}
	};

	async function closeModal() {
		await onClose(selectedProducers);
		close();
	}

</script>

<div class="flex justify-between items-center pb-2">
	<p class="text-lg font-medium">Producteurs</p>
	<button on:click={closeModal}>
		<Icon data={faTimesCircle} />
	</button>
</div>
<hr />
<div class="mt-6">
	{#each producers as producer}
		<div>
			<label class="cursor-pointer">
				<InputCheckbox checked={selectedProducers.includes(producer.id)} onClick={() => handleClick(producer)} />
				{producer.name}
			</label>
		</div>
	{/each}
</div>
