<!-- détails d'un produit -->
<script>
    import { onMount, getContext } from "svelte";
    import { GET_BATCHES, GET_PICKING_DETAILS, GET_PICKINGS } from "../queries";
    import { SET_PICKING_PRODUCT_PREPARED_QUANTITY } from "../mutations";
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
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";

    export let params;
    
	const errorsHandler = new SheaftErrors();
    const { query, mutate } = getContext("api");
    const { open } = getContext("modal");
    const routerInstance = GetRouterInstance();
    
    let product = null;
    let batches = [];
    let isLoading = true;
    let isSubmitting = false;
    let selectedBatches = [];
    let stepper = 1;
    let displayedBatches = [];

    onMount(async () => {
		isLoading = true;
		await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
            errorsHandler,
            success: async (res) => {
                let products = res.productsToPrepare.filter(p => p.productId == params.productId);
                let preparedProducts = res.preparedProducts.filter(p => p.productId == params.productId);

                if (products.length == 0) {
                    routerInstance.goTo(PreparationRoutes.Process, { id: params.id });
                }  

                batches = await query({
                    query: GET_BATCHES,
                    errorsHandler,
                    errorNotification: "Impossible de charger les lots"
                });

                displayedBatches = batches;

                product = denormalizeProduct(products, preparedProducts);
            },
			error: () => routerInstance.goTo(PreparationRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
        });
    
		isLoading = false;
    });
    
    const handleSubmit = async (completed) => {
        console.log(product);
        isSubmitting = true;
        await mutate({
            mutation: SET_PICKING_PRODUCT_PREPARED_QUANTITY,
            variables: { 
                id: params.id,
                productId: params.productId,
                completed,
                batches: selectedBatches,
                preparedBy: "someone",
                preparedQuantities: product.clients.map((c) => ({
                    purchaseOrderId: c.purchaseOrderId,
                    preparedQuantity: c.prepared
                }))
            },
            errorsHandler,
            success: () => routerInstance.goTo(PreparationRoutes.Process, {id: params.id }),
            successNotification: "Préparation sauvegardée",
            errorNotification: "Impossible de sauvegarder la préparation",
            clearCache: [params.id, GET_PICKINGS]
        })
        isSubmitting = true;
    }

    const openCreateBatchModal = () => open(CreateBatchModal, {
        onClose: (res) => {
            batches = [res, ...batches];
            displayedBatches = batches;
            selectedBatches = [...selectedBatches, res.id];
        }
    });

    const handleFilterInput = e => {
        if (e.target.value) {
            displayedBatches = batches.filter(b => b.number.includes(e.target.value) || selectedBatches.includes(b.id));
        } else {
            displayedBatches = batches;
        }
    }

    const handleBatchSelect = id => {
        if (selectedBatches.includes(id)) {
            selectedBatches = selectedBatches.filter(b => b !== id);
        } else {
            selectedBatches = [...selectedBatches, id];
        }
    }

    $: disabledStep3 = isSubmitting;
</script>

<TransitionWrapper>
    <PageHeader 
        name={product?.name ? `Préparation ${product.name}` : "Préparation"} 
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
                <div class="mt-5 pb-5 w-full px-4">
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
                <div class="mt-5 pb-5 w-full px-4 space-y-3">
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
                {#if batches.length}
                    <div class="form-control">
                        <label>Chercher par numéro de lot</label>
                        <input on:input={handleFilterInput} placeholder="Tapez un numéro de lot" />
                    </div>
                    <button class="btn-link mb-2 mt-2" on:click={openCreateBatchModal}>+ Créer un autre lot</button>
                    {#each displayedBatches as batch}
                        <div class="mb-2 bg-white shadow rounded px-4 py-2 cursor-pointer" 
                        on:click={() => handleBatchSelect(batch.id)}
                        class:bg-primary={selectedBatches.includes(batch.id)}>
                            <p class="font-semibold">Lot {batch.number}</p>
                            {#if batch.dlc}
                                <p>DLC : {format(new Date(batch.dlc), "PPPP", { locale: fr })}</p>
                            {/if}
                            {#if batch.dluo}
                                <p>DLUO : {format(new Date(batch.dluo), "PPPP", { locale: fr })}</p>
                            {/if}
                        </div>
                    {/each}
                {:else}
                    <p>Si nécessaire, vous pouvez lier la préparation du produit à un lot. Commencez par créer un lot : </p>
                    <button class="btn btn-accent btn-lg mt-2" on:click={openCreateBatchModal}>Créer un lot</button>
                {/if}
                <div class="mt-5 pb-5 w-full px-4 space-y-3">
                    <button 
                        disabled={isSubmitting} 
                        on:click={() => stepper = 2}
                        type="button" 
                        class="block btn btn-lg btn-outline w-full text-center justify-center">Retour</button>
                    <button 
                        type="button"
                        class="block btn btn-lg btn-accent w-full text-center justify-center"
                        disabled={disabledStep3} 
                        class:disabled={disabledStep3} 
                        on:click={() => handleSubmit(false)}>Sauvegarder et continuer plus tard</button>
                    <button 
                        type="button"
                        class="block btn btn-lg btn-accent w-full text-center justify-center"
                        disabled={disabledStep3} 
                        class:disabled={disabledStep3} 
                        on:click={() => handleSubmit(true)}>
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