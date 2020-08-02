<script>
	import OrderStatusKind from './../../enums/OrderStatusKind.js';
    import Icon from "svelte-awesome";

    export let status, withLabel = true;

    const data = OrderStatusKind.get(status);

</script>

<div class="text-center">
    <div class={`m-auto w-10 h-10 rounded-full flex items-center text-white justify-center bg-${data.Color}`}>
        <Icon data={data.Icon} />
    </div>
    {#if withLabel}
        <p class={`uppercase text-sm font-semibold mt-2 text-${data.Color}`}>{data.Label}</p>
    {/if}
</div>