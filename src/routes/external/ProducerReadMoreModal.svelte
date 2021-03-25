<script>
  export let close, producer;
</script>

<div class="px-6 pt-8" style="max-width: 650px;">
  <h2 class="font-semibold">À propos de {producer.name}</h2>
  <span class="bg-primary h-1 w-20 block mt-2 mb-4"></span>
  {#each producer.description.match(/[^\n]+/gm) as line}
    <p>{line}</p>
  {/each}
  <button type="button" on:click={close} class="btn btn-lg mt-5 mb-5 border border-gray-400">Fermer</button>
</div>

<style lang="scss">
p {
  @apply mb-2;
  @apply text-lg;
}
</style>