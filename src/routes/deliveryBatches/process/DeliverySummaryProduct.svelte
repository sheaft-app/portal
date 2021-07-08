<script>
    import { slide } from "svelte/transition";
    import Icon from "svelte-awesome";
    import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
    import ProductCounter from "./ProductCounter.svelte";

    export let product;
    export let index;
    export let numberOfProducts;

    let displayQuantifier = false;
</script>

<div class="py-3 flex-wrap border-b border-gray-300 flex justify-between" class:border-b={index !== numberOfProducts}>
    <div class="w-6/12">
        <p class="font-semibold">{product.name}</p>
        <p>{product.quantity} attendus</p>
        {#if !displayQuantifier}
            {#if product.broken}
                <p class="text-red-500 font-semibold">{product.broken} cassé(s)</p>
            {/if}
            {#if product.missing}
                <p class="text-orange-500 font-semibold">{product.missing} manquant(s)</p>
            {/if}
            {#if product.excess}
                <p class="text-blue-500 font-semibold">{product.excess} en trop</p>
            {/if}
            {#if !product.broken && !product.missing && !product.excess}
                <p class="text-primary font-semibold">Tout accepté</p>
            {/if}
        {/if}
    </div>
    <div>
        <button type="button" on:click={() => displayQuantifier = !displayQuantifier} class="btn btn-link">{#if !displayQuantifier}Modifier{:else}Valider{/if}</button>
    </div>
    <div class="w-full" transition:slide|local>
        {#if displayQuantifier}
            <ProductCounter bind:value={product.broken} max={product.quantity} label="Cassés" color="red-500" />
            <ProductCounter bind:value={product.missing} max={product.quantity} label="Manquants" disabled={product.excess > 0} color="orange-500" />
            <ProductCounter bind:value={product.excess} label="En trop" disabled={product.missing > 0} color="blue-500" />
            <small class="font-semibold"><Icon data={faInfoCircle} scale="0.8" class="mr-2" />Ajoutez des produits en trop seulement si le magasin garde le(s) produit(s) concerné(s).</small>
        {/if}
    </div>
</div>
