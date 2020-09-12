<script>
  import { slide } from "svelte/transition";

  export let field;
</script>

{#if field && field.dirty && field.errors.length >= 1}
  <p in:slide class="text-red-500">
    {#if field.errors.includes('required')}
      Champ requis
    {:else if field.errors.includes('min')}
      {#if typeof field.data.value === 'string'}
        {field.data.validators[field.data.validators.findIndex((n) => n.includes('min'))].split(':')[1]} caractères minimum
      {:else}
        Valeur minimale : {field.data.validators[field.data.validators.findIndex((n) => n.includes('min'))].split(':')[1]}
      {/if}
    {:else if field.errors.includes('max')}
      Le champ ne doit pas dépasser {field.data.validators[field.data.validators.findIndex((n) => n.includes('max'))].split(':')[1]} caractères
    {/if}
  </p>
{/if}