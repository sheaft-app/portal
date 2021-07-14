<!-- détails d'un produit -->
<script>
    import { onMount, getContext } from "svelte";
    import { GET_PICKING_DETAILS } from "../queries";
    import GetRouterInstance from "../../../services/SheaftRouter";
    import SheaftErrors from "../../../services/SheaftErrors";
    import ProductCounter from "../../deliveryBatches/process/ProductCounter.svelte";
    import { denormalizeProduct } from "../preparationForm";
    import PreparationRoutes from "../routes";
	import TransitionWrapper from "../../../components/TransitionWrapper.svelte";
	import PageHeader from "../../../components/PageHeader.svelte";
    import PageBody from "../../../components/PageBody.svelte";
    import Icon from "svelte-awesome";
    import CreateBatchModal from "./CreateBatchModal.svelte";
    import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

    export let params;
    
	const errorsHandler = new SheaftErrors();
    const { query, mutate } = getContext("api");
    const { open } = getContext("modal");
    const routerInstance = GetRouterInstance();
    
    let product = null;
    let isLoading = true;
    let isSubmitting = false;
    let stepper = 1;

    onMount(async () => {
		isLoading = true;
		await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
            errorsHandler,
            success: (res) => {
                let products = res.productsToPrepare.filter(p => p.productId == params.productId);
                let preparedProducts = res.preparedProducts.filter(p => p.productId == params.productId);

                if (products.length == 0) {
                    routerInstance.goTo(PreparationRoutes.Process, { id: params.id });
                }

                product = denormalizeProduct(products, preparedProducts);
            },
			error: () => routerInstance.goTo(PreparationRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
    });
    
    const handleSubmit = async (postpone) => {
        await mutate({
            mutation: SET_PICKING_PRODUCT_PREPARED_QUANTITY,
            variables: { 
                id: params.id,
                productId: params.productId,
                completed: postpone,
                preparedBy: "someone",
                preparedQuantities: clients.map((c) => ({
                    purchaseOrderId: c.purchaseOrder.id,
                    preparedQuantity: c.prepared
                }))
            },
            errorsHandler,
            success: () => routerInstance.goTo(PreparationRoutes.Process, {id: params.id }),
            successNotification: "Préparation sauvegardée",
            errorNotification: "Impossible de sauvegarder la préparation"
        })
    }

    const openCreateBatchModal = () => open(CreateBatchModal, {
        onClose: (res) => {
            // populate batches with the one we just created
            // auto-select it
        }
    })
</script>

<TransitionWrapper>
    <PageHeader 
        name={product?.name || "Chargement..."} 
        previousPage={PreparationRoutes.Process} 
        previousPageParams={{ id: params.id }} 
        subname={`${product?.total} à préparer` || "Chargement..."} />
	<PageBody {errorsHandler} {isLoading} noResultsPage={null} loadingMessage="Chargement du produit...">
        {#if !isLoading}
            {#if stepper == 1}
            <div class="m-auto">
                {#each product.clients as client, index}
                    <div class="flex flex-wrap justify-between border-gray-300 pb-2 items-center" class:border-b={index !== product.clients.length - 1}>
                        <div>
                            <p class="font-semibold">{client.name}</p>
                            <p>{client.expected} commandés</p>
                        </div>
                        <div class="w-1/2">
                            <ProductCounter label="préparé(s)" bind:value={client.prepared} /> 
                        </div>
                    </div>
                {/each}
            </div>
            <div class="bottom-cta absolute w-full px-4">
                <button 
                    type="button"
                    class="block btn btn-lg btn-accent w-full text-center justify-center"
                    on:click={() => stepper = 2}>
                    Suivant
                </button>
            </div>
            {:else if stepper == 2}
                <p class="mb-3">Vous allez valider la préparation de {product.name} : </p>
                {#each product.clients as client}
                    <p class="text-lg"><span class="font-semibold">x{client.prepared}</span> pour {client.name}</p>
                {/each}
                <div class="bottom-cta absolute w-full px-4 space-y-3">
                    <button 
                        on:click={() => stepper = 1}
                        type="button" 
                        class="block btn btn-lg btn-outline w-full text-center justify-center">Retour</button>
                    <button 
                        type="button"
                        class="block btn btn-lg btn-accent w-full text-center justify-center"
                        on:click={() => stepper = 3}>
                        Suivant
                    </button>
                </div>
            {:else if stepper == 3}
                <button class="btn-link" on:click={openCreateBatchModal}>+ Rattacher à un autre lot</button>
                <div class="bottom-cta absolute w-full px-4 space-y-3">
                    <button 
                        disabled={isSubmitting} 
                        on:click={() => stepper = 2}
                        type="button" 
                        class="block btn btn-lg btn-outline w-full text-center justify-center">Retour</button>
                    <button 
                        type="button"
                        class="block btn btn-lg btn-accent w-full text-center justify-center"
                        disabled={isSubmitting} 
                        class:disabled={isSubmitting} 
                        on:click={() => handleSubmit(true)}>Sauvegarder et continuer plus tard</button>
                    <button 
                        type="button"
                        class="block btn btn-lg btn-accent w-full text-center justify-center"
                        disabled={isSubmitting} 
                        class:disabled={isSubmitting} 
                        on:click={() => handleSubmit(false)}>
                        {#if isSubmitting}
                            <Icon data={faCircleNotch} class="mr-2" spin />
                        {/if}
                        Terminer la préparation
                    </button>
                </div>
            {/if}
        {/if}
    </PageBody>
</TransitionWrapper>