<script>
    import { getContext, onMount } from "svelte";
    import DeliveryStatus from "../../enums/DeliveryStatus";
    import { getProductsProgress, getPurchaseOrdersProductsQuantites, getDeliveryProductsQuantites } from "../../helpers/purchaseOrder";
    import Loader from "../Loader.svelte";
    import { GET_DELIVERY_DETAILS } from "./queries";

    import ProductsTable from "./ProductsTable.svelte";
    import SheaftErrors from "../../services/SheaftErrors";
    import GetRouterInstance from "../../services/SheaftRouter";
    import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";

	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
    
    export let deliveryId;

    let delivery = null;
    let progress = null;
    let isLoading = true;

    const retrieveDelivery = async (id) => {
        isLoading = true;
        await query({
			query: GET_DELIVERY_DETAILS,
			variables: { id: id },
			errorsHandler,
			success: (res) => {
				delivery = res;
			},
			errorNotification: "La récupération de la liste des produits de la livraison a échouée.",
			skipCache: routerInstance.shouldSkipCache(),
		});

		let { orderedProducts, preparedProducts, orderedReturnables, preparedReturnables } = getPurchaseOrdersProductsQuantites(delivery.purchaseOrders);
		let { deliveredProducts, deliveredReturnables, returnedReturnables } = getDeliveryProductsQuantites(delivery);

		progress = getProductsProgress(
			{orderedProducts, preparedProducts, deliveredProducts}, 
			{orderedReturnables, preparedReturnables, deliveredReturnables, returnedReturnables}, 
			{wholeSalePrice : delivery.deliveryFeesWholeSalePrice, vatPrice: delivery.deliveryFeesVatPrice, onSalePrice : delivery.deliveryFeesOnSalePrice},
            PurchaseOrderStatusKind.Completed.Value);

        isLoading = false;
    }

    onMount(async () => {
        await retrieveDelivery(deliveryId);
    });
</script>

{#if !isLoading && delivery}
    <ProductsTable 
        comment={delivery.comment}
        deliveryFees={progress.deliveryFees}
        total={progress.total}
        products={progress.products}
        returnables={progress.returnables}
        returnedReturnables={progress.returnedReturnables}
        showPrepared={true}
        showDelivered={delivery.status === DeliveryStatus.Delivered.Value} />
{:else}
    <Loader />
{/if}