<script>
	export let close, entity;

</script>

<div class="px-6 pt-8" style="max-width: 650px;">
	<button type="button" on:click={close} class="btn btn-lg mb-5 border border-gray-400">Fermer</button>
	<h2 class="font-semibold">À propos de {entity.name}</h2>
	<span class="bg-primary h-1 w-20 block mt-2 mb-4" />
	{#each entity.description.match(/[^\n]+/gm) as line}
		<p>{line}</p>
	{/each}
</div>

<style lang="scss">
	p {
		@apply mb-2;
		@apply text-lg;
	}

</style>
