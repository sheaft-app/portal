<script>
	import GetRouterInstance from "../services/SheaftRouter";

	export let noResultsPage;

	const routerInstance = GetRouterInstance();
</script>

<div class="flex justify-center">
	<div class="text-xl text-gray-600 text-center">
		<p class="my-3">{noResultsPage.Text}</p>
		{#if noResultsPage.Name}
			<button on:click={() => routerInstance.goTo(noResultsPage)} class="btn btn-lg btn-accent m-auto">
				{noResultsPage.Name}
			</button>
		{/if}
	</div>
</div>
