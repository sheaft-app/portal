<script>
    import MapStep from "./MapStep.svelte";

    export let params = {};
    let step = 1;
</script>

{#if step == 1}
    <MapStep deliveryId={params.id} />
{/if}