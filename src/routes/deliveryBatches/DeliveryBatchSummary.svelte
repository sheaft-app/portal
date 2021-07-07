<script>
    import { GET_DELIVERY_BATCH_DETAILS } from "./queries";
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import GetRouterInstance from "../../services/SheaftRouter";
    import DeliveryBatchesRoutes from "./routes";
    import Icon from "svelte-awesome";
    import { faEye } from "@fortawesome/free-solid-svg-icons";
    import { denormalizeDeliveryBatchProducts } from "./deliveryBatchForm";
    import DeliveryBatchStatus from "../../enums/DeliveryBatchStatus";
    
    export let params = {};

    const { query } = getContext("api");
    const errorsHandler = new SheaftErrors();
    const routerInstance = GetRouterInstance();
    
    let deliveryBatch;
    let isLoading = true;

    onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: params.id },
            errorsHandler,
            success: (res) => {
                deliveryBatch = {
                    ...res,
                    deliveries: res.deliveries.map((d) => ({
                        ...d,
                        products: denormalizeDeliveryBatchProducts(d.products)
                    }))
                }
            },
			error: () => routerInstance.goTo(DeliveryBatchesRoutes.History),
			errorNotification: "Impossible de récupérer l'état de la livraison, retour à l'accueil."
		});
		isLoading = false;
    });
</script>
    

<TransitionWrapper>
	<PageHeader name="Résumé de la livraison" previousPage={DeliveryBatchesRoutes.History} />
	<PageBody {errorsHandler} {isLoading}>
		<p class="text-2xl font-semibold">{deliveryBatch.name}</p>
        <p 
            class="text-primary text-2xl font-semibold uppercase mt-5 mb-5" 
            class:text-primary={deliveryBatch.status == DeliveryBatchStatus.Completed.Value}>
            {DeliveryBatchStatus.label(deliveryBatch.status)}
        </p>
        <p class="mb-2 text-gray-600">Produits cassés : <span class="text-red-500 font-semibold">{deliveryBatch.brokenProductsCount}</span></p>
        <p class="mb-2 text-gray-600">Produits manquants : <span class="text-orange-500 font-semibold">{deliveryBatch.missingProductsCount}</span></p>
        <p class="mb-2 text-gray-600">Produits livrés : <span class="text-green-500 font-semibold">{deliveryBatch.productsDeliveredCount}</span></p>
        <p class="mb-2 text-gray-600">Consignes récupérées : <span class="text-green-500 font-semibold">{Math.abs(deliveryBatch.returnedReturnablesCount)}</span></p>
        <a target="_blank" href={deliveryBatch.deliveryFormUrl} class="btn-link mt-1 mb-3">
            <Icon data={faEye} class="mr-2" />
            Voir tous les bons de livraison
        </a>
        {#each deliveryBatch.deliveries as delivery (delivery.id)}
            <div class="px-4 bg-white mb-3 mt-3 rounded-lg shadow py-3">
                <p class="font-semibold text-xl">{delivery.client}</p>
                <a target="_blank" href={delivery.deliveryFormUrl} class="btn-link mt-1">
                    <Icon data={faEye} class="mr-2" />
                    Voir le bon de livraison
                </a>
                <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 md:mb-5 mt-2">
                    <div class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8">
                        <div class="w-full">
                            <section>
                                <div class="-mx-4 lg:-mx-8">
                                    <table class="min-w-full leading-normal border-t border-gray-400">
                                        <thead>
                                            <tr>
                                                <th
                                                    class="px-4 md:px-8 py-3 border-b border-l border-gray-400
                                                bg-gray-100 text-left text-xs font-semibold text-gray-600
                                                uppercase tracking-wider"
                                                >
                                                    Produit
                                                </th>
                                                <th
                                                    class="px-4 md:px-8 py-3 border-b border-gray-400
                            bg-gray-100 text-left text-xs font-semibold text-gray-600
                            uppercase tracking-wider"
                                                >
                                                    Attendus
                                                </th>
                                                <th
                                                    class="px-4 md:px-8 py-3 border-b border-gray-400
                            bg-gray-100 text-center md:text-left text-xs font-semibold
                            text-gray-600 uppercase tracking-wider"
                                                >
                                                    Refusé
                                                </th>
                                                <th
                                                    class="px-4 md:px-8 py-3 border-b border-gray-400
                            bg-gray-100 text-center md:text-left text-xs font-semibold
                            text-gray-600 uppercase tracking-wider"
                                                >
                                                    Manquant
                                                </th>
                                                <th
                                                    class="px-4 md:px-8 py-3 border-b border-r border-gray-400
                            bg-gray-100 text-right text-xs font-semibold text-gray-600
                            uppercase tracking-wider"
                                                >
                                                    Excès
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#each delivery.products as product}
                                                <tr>
                                                    <td
                                                        class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                                bg-white text-sm lg:text-base"
                                                    >
                                                        <div class="items-center">
                                                            <p>{product.name}</p>
                                                        </div>
                                                    </td>
                                                    <td
                                                        class="px-4 md:px-8 py-5 border-b border-gray-400
                                bg-white text-sm lg:text-base"
                                                    >
                                                        <p class="whitespace-no-wrap">
                                                            {product.productsToDeliver}
                                                        </p>
                                                    </td>
                                                    <td
                                                        class="px-4 md:px-8 py-5 border-b border-gray-400
                                bg-white text-sm lg:text-base text-center md:text-left"
                                                    >
                                                        <p class="whitespace-no-wrap">
                                                            {product.productsBroken}
                                                        </p>
                                                    </td>
                                                    <td
                                                        class="px-4 md:px-8 py-5 border-b border-gray-400
                                bg-white text-sm lg:text-base text-center md:text-left"
                                                    >
                                                        <p class="whitespace-no-wrap">
                                                            {product.productsMissing}
                                                        </p>
                                                    </td>
                                                    <td
                                                        class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                                bg-white text-sm lg:text-base text-right"
                                                    >
                                                        <p class="whitespace-no-wrap">
                                                            {product.productsInExcess}
                                                        </p>
                                                    </td>
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
	</PageBody>
</TransitionWrapper>

<style>
    .bottom-cta {
        left: 0;
        bottom: 20px;
        margin: 0 auto;
        text-align: center;
    }
</style>