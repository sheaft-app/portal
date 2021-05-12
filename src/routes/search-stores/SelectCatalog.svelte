<script>
	import {onMount} from "svelte";
	import { GET_CATALOGS } from "./queries";
	import Loader from "../../components/Loader.svelte";
	import GetGraphQLInstance from "../../services/SheaftGraphQL.js";

	const graphQLInstance = GetGraphQLInstance();

	let catalogs = [];
	let isLoading = true;

	export let selectedCatalog = null;

	onMount(async () => {
		await fetchCatalogs();
	})

	const fetchCatalogs = async () => {
		const res = await graphQLInstance.query(GET_CATALOGS);

		isLoading = false;

		if (!res.success) {
			// todo
			return;
		}

		catalogs = res.data;
		isLoading = false;
	}
</script>

<div class="form-control mt-2" style="display: block;">
	<div class="mb-2">
		<label>Quel catalogue souhaitez-vous assigner à ce magasin ?</label>
	</div>
	{#if isLoading}
		<Loader/>
	{:else if catalogs.length > 0}
		{#each catalogs as catalog}
			<div
				class:active={selectedCatalog && selectedCatalog.id == catalog.id}
				on:click={() => selectedCatalog = catalog}
				class="mb-2 cursor-pointer hover:bg-gray-100 shadow px-3 py-2 bg-white rounded">
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
