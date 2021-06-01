<script>
	import { getContext, onMount } from "svelte";
	import { GET_CATALOGS } from "./queries";
	import Loader from "../../components/Loader.svelte";

	const { query } = getContext("api");

	let catalogs = [];
	let isLoading = true;

	export let selectedCatalog = null,
		errorsHandler;

	onMount(async () => {
		catalogs = await query({
			query: GET_CATALOGS,
			errorsHandler,
			errorNotification: "Impossible de récupérer les informations des catalogues.",
		});
		isLoading = false;
	});

</script>

<div class="form-control mt-2" style="display: block;">
	<div class="mb-2">
		<label>Quel catalogue souhaitez-vous assigner à ce magasin ?</label>
	</div>
	{#if isLoading}
		<Loader />
	{:else if catalogs.length > 0}
		{#each catalogs as catalog}
			<div
				class:active={selectedCatalog && selectedCatalog.id == catalog.id}
				on:click={() => (selectedCatalog = catalog)}
				class="mb-2 cursor-pointer hover:bg-gray-100 shadow px-3 py-2 bg-white rounded"
			>
				{catalog.name}
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.active {
		@apply bg-accent;
		@apply text-white;
		@apply font-semibold;

		&:hover {
			@apply bg-accent;
			@apply text-white;
		}
	}

</style>
