<script>
	export let onClose, close, remainingStops;

	const handleClose = (stop) => {
		onClose(stop);
		close();
	};
</script>

<div class="py-3">
	{#each remainingStops as stop}
		<div on:click={() => handleClose(stop)} class="cursor-pointer bg-white rounded-lg shadow-lg px-4 py-2">
			<p class="font-semibold mb-2">{stop.client.name}</p>
			<p>{stop.address.line1}</p>
			<p>{stop.address.zipcode} {stop.address.city}</p>
		</div>
	{/each}
</div>
