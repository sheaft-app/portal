<script>
    import MapStep from "./MapStep.svelte";

    let step = 1;
</script>

{#if step == 1}
    <MapStep />
{/if}