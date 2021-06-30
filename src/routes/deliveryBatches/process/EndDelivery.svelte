<script>
    import { GET_DELIVERY_BATCH_DETAILS } from "../queries";
	import { onMount, getContext } from "svelte";
	import SheaftErrors from "../../../services/SheaftErrors";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import DeliveryBatchRoutes from "../routes";
    
    export let params = {};

    const { query } = getContext("api");
    const errorsHandler = new SheaftErrors();
    const routerInstance = GetRouterInstance();
    
    let deliveryBatch;
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
		isLoading = false;
    });
</script>

{#if isLoading}
    <p>Chargement...</p>
{:else if deliveryBatch}
    <p class="text-2xl font-semibold">{deliveryBatch.name}</p>
    <p class="text-primary text-2xl font-semibold uppercase mt-5 mb-5">Terminée</p>

    <p class="font-semibold mb-2">Coup d'oeil</p>

    <p class="mb-2 text-gray-600">Produits retournés : <span class="text-red-500 font-semibold">{deliveryBatch.returnedProductsCount}</span></p>
    <p class="mb-2 text-gray-600">Consignes récupérées : <span class="text-green-500 font-semibold">{deliveryBatch.returnedReturnablesCount}</span></p>

    <div class="bottom-cta fixed w-full px-4 space-y-3">
        <button class="block btn btn-lg btn-accent justify-center w-full">Terminer</button>
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