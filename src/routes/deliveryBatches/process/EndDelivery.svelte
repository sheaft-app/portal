<script>
    import { GET_DELIVERY_BATCH_DETAILS, GET_DELIVERY_BATCHES } from "../queries";
    import { COMPLETE_DELIVERY_BATCH } from "../mutations";
	import { onMount, getContext } from "svelte";
	import SheaftErrors from "../../../services/SheaftErrors";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import DeliveryBatchRoutes from "../routes";
    import DeliveryStatus from "../../../enums/DeliveryStatus";
    import SimpleStoreCard from "../../deliveries/SimpleStoreCard.svelte";
    import PostponeDeliveryBatchModal from "../PostponeDeliveryBatchModal.svelte";
    import Icon from "svelte-awesome";
    import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
    
    export let params = {};

    const { query, mutate } = getContext("api");
    const { open } = getContext("modal");
    const errorsHandler = new SheaftErrors();
    const routerInstance = GetRouterInstance();
    
    let skippedDeliveries = [];
    let deliveryBatch;
    let isSubmitting = false;
    let isLoading = true;

    onMount(async () => {
		isLoading = true;
		deliveryBatch = await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryBatchRoutes.List),
			errorNotification: "Impossible de récupérer l'état de la livraison, retour à l'accueil."
        });
        skippedDeliveries = deliveryBatch.deliveries.filter((d) => d.status == DeliveryStatus.Skipped.Value);
		isLoading = false;
    });

    const completeDelivery = async () => {
        isSubmitting = true;
        await mutate({
			mutation: COMPLETE_DELIVERY_BATCH,
			variables: { id: params.id },
			errorsHandler,
			success: (res) => routerInstance.goTo(DeliveryBatchesRoutes.Summary, { id: params.id }),
			successNotification: "Livraison terminée avec succès !",
			errorNotification: "Impossible de terminer la livraison",
			clearCache: [GET_DELIVERY_BATCHES, GET_DELIVERY_BATCH_DETAILS],
		});
        isSubmitting = false;
    }
</script>
    
{#if isLoading}
    <p>Chargement...</p>
{:else if deliveryBatch}
    <p class="text-2xl font-semibold">{deliveryBatch.name}</p>
    <p class="text-primary text-2xl font-semibold uppercase mt-5 mb-5">Terminée</p>

    <p class="font-semibold mb-2">Coup d'oeil</p>

    <p class="mb-2 text-gray-600">Produits retournés : <span class="text-red-500 font-semibold">{deliveryBatch.returnedProductsCount}</span></p>
    <p class="mb-2 text-gray-600">Consignes récupérées : <span class="text-green-500 font-semibold">{deliveryBatch.returnedReturnablesCount}</span></p>

    {#if skippedDeliveries.length >= 1}
        <p class="text-orange-500 mb-2">Vous avez passé ces magasins. Choisissez quand reprogrammer la livraison de leurs commandes :</p>
        {#each skippedDeliveries as skippedDelivery}
            <SimpleStoreCard props={{ ...skippedDelivery, name: skippedDelivery.client }} />
        {/each}
    {/if}

    <div class="bottom-cta fixed w-full px-4 space-y-3">
        {#if skippedDeliveries.length >= 1}
            <button 
                on:click={() => open(PostponeDeliveryBatchModal, { id: deliveryBatch.id })}
                class="block btn btn-lg btn-accent justify-center w-full">
                Reprogrammer
            </button>
        {:else}
            <button on:click={completeDelivery} disabled={isSubmitting} class:disabled={isSubmitting} class="block btn btn-lg btn-accent justify-center w-full">
                {#if isSubmitting}
                    <Icon data={faCircleNotch} spin class="mr-2" />
                {/if}
                Terminer
            </button>
        {/if}
    </div>
{/if}


<style>
    .bottom-cta {
        left: 0;
        bottom: 20px;
        margin: 0 auto;
        text-align: center;
    }
</style>