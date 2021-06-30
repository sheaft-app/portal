<script>
    import DeliverySummaryProduct from "./DeliverySummaryProduct.svelte";
    import { GET_RETURNABLES } from "../queries";
    import { onMount, getContext } from "svelte";
    import SheaftErrors from "../../../services/SheaftErrors";
	import Select from "./../../../components/controls/select/Select.js";
	import ReturnableSelectItem from "../../products/ReturnableSelectItem.svelte";
    import ProductCounter from "./ProductCounter.svelte";
    
    export let delivery;
    export let numberOfDeliveries;
    
    const { query } = getContext("api");
    const errorsHandler = new SheaftErrors();

    let returnables = [];

    let isLoadingReturnables = true;
    let step = 1;
    
    onMount(async () => {
		isLoadingReturnables = true;
		returnables = await query({
			query: GET_RETURNABLES,
			errorsHandler,
			errorNotification: "Un problème est survenu pendant la récupération des consignes.",
		});
		isLoadingReturnables = false;
	});
</script>

<div class="relative">
    <div class="flex justify-between">
        <p class="uppercase text-gray-600">Compte-rendu</p>
        <p>{delivery.position + 1}/{numberOfDeliveries}</p>
    </div>
    <p class="text-primary text-xl font-semibold uppercase mt-2">{delivery.client}</p>
    <p>{delivery.address.line1}</p>
    <p>{delivery.address.zipcode} {delivery.address.city}</p>
    {#if step == 1}
        <p class="mt-2 text-gray-600">{delivery.productsToDeliverCount} produits attendus</p>
        <div class="pb-16">
            {#each delivery.products as product, index}
                <DeliverySummaryProduct {product} {index} numberOfProducts={delivery.products.length - 1} />
            {/each}
        </div>
        {#if !isLoadingReturnables}
            <div class="bottom-cta fixed lg:static w-full px-4 space-y-3 z-10">
                {#if returnables.length}
                    <button type="button" class="block btn btn-lg btn-outline w-full text-center justify-center" on:click={() => ++step}>Suivant</button>
                {:else}
                    <button type="button" class="block btn btn-lg btn-accent w-full text-center justify-center" on:click>Valider le compte-rendu</button>
                {/if}
            </div>
        {/if}
    {:else}
        <div class="py-2">
            <p class="text-lg font-medium">Avez-vous récupéré des consignes ?</p>
            <p class="text-gray-600">Si oui, vous pouvez les comptabiliser ici avant de valider le compte-rendu.</p>
        </div>
        {#each returnables as returnable}
            <div class="flex justify-between items-center space-x-2">
                <div>
                    <p>{returnable.name}</p>
                </div>
                <div class="w-1/2">
                    <ProductCounter bind:value={delivery.returnables} label="Récupérées" showLabel={false} color="gray-800" />
                </div>
            </div>
        {/each}
        <div class="bottom-cta fixed lg:static w-full px-4 space-y-3 z-10">
            <button type="button" class="block btn btn-lg btn-outline w-full text-center justify-center" on:click={() => --step}>Retour</button>
            <button type="button" class="block btn btn-lg btn-accent w-full text-center justify-center" on:click>Valider le compte-rendu</button>
        </div>
    {/if}
</div>

<style>
    .bottom-cta {
        left: 0;
        bottom: 20px;
        margin: 0 auto;
        text-align: center;
    }

    .themed {
		display: contents;
		--cursor: text;
		--padding: 16px 18px;
		--borderFocusColor: #a0aec0;
		--borderHoverColor: #a0aec0;
		--border: 1px solid #cbd5e0;
		--placeholderColor: #8290a2;
		--inputPadding: 18px;
		--inputColor: #205164;
	}
</style>