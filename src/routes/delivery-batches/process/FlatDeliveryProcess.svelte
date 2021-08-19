<!-- détails d'un produit -->
<script>
	import { fly } from "svelte/transition";
	import { getContext, onMount } from "svelte";
    import GetRouterInstance from "../../../services/SheaftRouter";
    import { GET_DELIVERY_BATCH_DETAILS, GET_RETURNABLES } from "../queries";
	import ProductCounter from "./ProductCounter.svelte";
	import DeliverySummaryProduct from "./DeliverySummaryProduct.svelte";
    import { COMPLETE_DELIVERY } from "../mutations";
	import SheaftErrors from "../../../services/SheaftErrors";
	import ErrorCard from "../../../components/ErrorCard.svelte";
    import DeliveryBatchesRoutes from "../routes";
	import TransitionWrapper from "../../../components/TransitionWrapper.svelte";
	import PageHeader from "../../../components/PageHeader.svelte";
	import PageBody from "../../../components/PageBody.svelte";
    import DeliveryBatchStatus from "../../../enums/DeliveryBatchStatus";

    export let params = {};

	const errorsHandler = new SheaftErrors();
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

    let isSubmitting = false;
    let isLoading = true;
    let deliveries = [];
    let comment = null;
    let returnables = [];
    let receptionedBy = null;
    let stepper = 0;

	// const previous = () => {
	// 	if (stepper > 0) {
	// 		previousStepper = stepper;
	// 		--stepper;
	// 	}
	// }

	const next = async (delivery, end) => {
        await handleSubmit(delivery, end);
		if (stepper < deliveries.length - 1) {
			++stepper;
		}
	}

    onMount(async () => {
        isLoading = true;
        await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryBatchesRoutes.List),
            success: async (res) => 
                deliveries = res.deliveries.filter(
                    d => 
                    [DeliveryBatchStatus.InProgress.Value, DeliveryBatchStatus.Ready.Value, DeliveryBatchStatus.Waiting.Value].includes(d.status)
                ),
			errorNotification: "Impossible de récupérer l'état de la livraison, retour à l'accueil.",
		});
        isLoading = false;

		returnables = await query({
			query: GET_RETURNABLES,
			errorsHandler,
			errorNotification: "Un problème est survenu pendant la récupération des consignes.",
		});
	});

	const handleSubmit = async (delivery, end) => {
		isSubmitting = true;

		let returnedProducts = [];
		delivery.products.forEach((p) => {
			["EXCESS", "MISSING", "BROKEN"].map((status) => {
				if (p[status.toLowerCase()] > 0) {
					returnedProducts = [
						...returnedProducts,
						{
							id: p.productId,
							kind: status,
							quantity: p[status.toLowerCase()],
						},
					];
				}
			});
		});

		await mutate({
			mutation: COMPLETE_DELIVERY,
			variables: {
				id: delivery.id,
				receptionedBy,
				comment,
				returnedProducts,
				returnedReturnables: returnables
					.filter((r) => r.count > 0)
					.map((r) => ({ id: r.id, quantity: r.count })),
            },
            success: (res) => {
                returnables = returnables.map(r => ({ ...r, count: 0 }));
                receptionedBy = null;
                comment = null;

                if (end) {
                    routerInstance.goTo(DeliveryBatchesRoutes.List);
                }
            },
			errorsHandler,
			errorNotification: "Impossible de compléter la livraison. Veuillez réessayer.",
			clearCache: [params.id],
		});
		isSubmitting = false;
    };
</script>

<TransitionWrapper>
	<PageHeader name="Bilan de la livraison" previousPage={DeliveryBatchesRoutes.List} />
    <PageBody {errorsHandler} {isLoading}>
        <ErrorCard {errorsHandler} />
        {#each deliveries as delivery, index (delivery.id)}
            {#if index == stepper}
                <div in:fly|local={{ x: 800, duration: 400 }}>
                    <p class="text-xl text-primary font-semibold">{delivery.client.name}</p>
                    <p class="text-xl text-primary font-semibold">{stepper + 1}/{deliveries.length}</p>
                    <p>{delivery.address.line1}</p>
                    <p>{delivery.address.zipcode} {delivery.address.city}</p>
                    <p class="mt-2 text-gray-600">{delivery.productsToDeliverCount} produits attendus</p>
                    <div>
                        {#each delivery.products as product, index}
                            <DeliverySummaryProduct {product} {index} isExpandedByDefault numberOfProducts={delivery.products.length - 1} />
                        {/each}
                    </div>
                    {#if returnables && returnables.length > 0}
                        <div class="py-2">
                            <p class="text-lg font-medium">Avez-vous récupéré des consignes ?</p>
                        </div>
                        {#each returnables as returnable}
                            <div class="flex justify-between items-center space-x-2">
                                <div>
                                    <p>{returnable.name}</p>
                                </div>
                                <div class="w-1/2">
                                    <ProductCounter
                                        bind:value={returnable.count}
                                        disabled={isSubmitting}
                                        label="Récupérées"
                                        showLabel={false}
                                        color="gray-800"
                                    />
                                </div>
                            </div>
                        {/each}
                    {/if}
                    <div class="form-control w-full mt-3">
                        <label for="receptionedBy">Livraison réceptionnée par *</label>
                        <input
                            id="receptionedBy"
                            bind:value={receptionedBy}
                            disabled={isSubmitting}
                            type="text"
                            placeholder="ex: Stéphanie A."
                        />
                    </div>
                    <div class="form-control w-full">
                        <label for="comment">Commentaire (optionnel)</label>
                        <textarea id="comment" bind:value={comment} class="block" />
                    </div>
                    <div class="mt-5 pb-5 w-full px-4 space-y-3 m-auto" style="max-width: 500px;">
                        <!-- <button
                            disabled={isSubmitting}
                            class:disabled={stepper == 0}
                            on:click={previous}
                            type="button"
                            class="block btn btn-lg btn-outline w-full text-center justify-center">Retour</button> -->
                        <button
                            type="button"
                            class="block btn btn-lg btn-accent w-full text-center justify-center"
                            disabled={isSubmitting}
                            class:disabled={isSubmitting}
                            on:click={() => next(delivery, index == deliveries.length - 1)}>
                            {#if index == deliveries.length - 1}
                                Terminer la livraison
                            {:else}
                                Valider et continuer
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}
        {/each}
    </PageBody>
</TransitionWrapper>