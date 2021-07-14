<!-- liste des produits -->
<script>
	import { onMount, getContext } from "svelte";
	import GetRouterInstance from "./../../../services/SheaftRouter.js";
	import { GET_PICKING_DETAILS } from "../queries";
	import SheaftErrors from "../../../services/SheaftErrors";
    import PreparationRoutes from "../routes";
	import TransitionWrapper from "../../../components/TransitionWrapper.svelte";
    import PageHeader from "../../../components/PageHeader.svelte";
    import { denormalizePreparationProducts } from "../preparationForm";
	import PageBody from "../../../components/PageBody.svelte";

    export let params;

	const { query } = getContext("api");
	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();

    let preparation = null;
    let products = [];
	let isLoading = true;
	let loadingMessage = "Chargement des informations de la préparation en cours...";

	onMount(async () => {
		isLoading = true;
		preparation = await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
            errorsHandler,
            success: (res) => products = denormalizePreparationProducts(res.productsToPrepare, res.preparedProducts),
			error: () => routerInstance.goTo(PreparationRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
		});
        isLoading = false;
	});
</script>

<TransitionWrapper>
	<PageHeader name="Préparation en cours" previousPage={PreparationRoutes.List} subname={preparation?.name || "Chargement..."} />
	<PageBody {errorsHandler} {isLoading} noResultsPage={null} loadingMessage="Chargement de la préparation...">
        {#if !isLoading}
            <div>
                {#each products as product}
                    <div 
                    class="bg-white shadow px-4 py-2 rounded mb-2 flex justify-between flex-wrap" >
                        <div>
                            <p class="text-lg font-semibold">{product.name}</p>
                            <p>{product.total} à préparer</p>
                        </div>
                        <div class="w-full md:w-auto mt-2 md:mt-0">
                            {#if product.completed}
                                <p class="text-green-500">Terminée</p>
                            {:else}
                                <button 
                                    type="button"
                                    on:click={routerInstance.goTo(PreparationRoutes.ProcessProduct, { id: preparation.id, productId: product.id })}
                                    class="btn btn-accent btn-lg">
                                    Préparer
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </PageBody>
</TransitionWrapper>