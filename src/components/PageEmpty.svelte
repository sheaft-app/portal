<script>
	import GetRouterInstance from "../services/SheaftRouter";

	export let noResultsPage;

	const routerInstance = GetRouterInstance();
</script>

<section class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
	<div class="text-xl text-gray-600">
		<p class="mb-3">{noResultsPage.Text}</p>
		<button
			on:click={() => routerInstance.goTo(noResultsPage)}
			class="btn btn-lg btn-accent justify-center">
			{noResultsPage.Name}
		</button>
	</div>
</section>
