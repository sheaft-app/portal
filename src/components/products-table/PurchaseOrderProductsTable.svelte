<script>
	import { getPurchaseOrdersProductsQuantites } from './../../helpers/purchaseOrder.js';
	import PurchaseOrderStatusKind from './../../enums/PurchaseOrderStatusKind';
    import { getContext, onMount } from "svelte";
    import { getProductsProgress } from "../../helpers/purchaseOrder";
    import Loader from "../Loader.svelte";
    import { GET_PURCHASE_ORDER_DETAILS } from "./queries";

    import ProductsTable from "./ProductsTable.svelte";
    import SheaftErrors from '../../services/SheaftErrors';
    import GetRouterInstance from '../../services/SheaftRouter';

	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
    
    export let purchaseOrderId;

    let purchaseOrder = null;
    let progress = null;
    let isLoading = true;

    const retrieveDelivery = async (id) => {
        isLoading = true;
        await query({
			query: GET_PURCHASE_ORDER_DETAILS,
			variables: { id: id },
			errorsHandler,
			success: (res) => {
				purchaseOrder = res;
			},
			errorNotification: "La récupération de la liste des produits de la commande a échouée.",
			skipCache: routerInstance.shouldSkipCache(),
		});

		let { orderedProducts, preparedProducts, orderedReturnables, preparedReturnables } = getPurchaseOrdersProductsQuantites([purchaseOrder]);

		progress = getProductsProgress(
			{
                orderedProducts, 
                preparedProducts, 
                deliveredProducts : []
            }, 
			{
                orderedReturnables, 
                preparedReturnables, 
                deliveredReturnables : [], 
                returnedReturnables : []
            }, 
			{
                wholeSalePrice : purchaseOrder.expectedDelivery.deliveryFeesWholeSalePrice, 
                vatPrice: purchaseOrder.expectedDelivery.deliveryFeesVatPrice, 
                onSalePrice : purchaseOrder.expectedDelivery.deliveryFeesOnSalePrice
            },
            purchaseOrder.status);

        isLoading = false;
    }

    onMount(async () => {
        await retrieveDelivery(purchaseOrderId);
    });
</script>

{#if !isLoading && purchaseOrder}
    <ProductsTable 
        delivery={purchaseOrder.delivery}
        comment={purchaseOrder.comment}
        deliveryFees={progress.deliveryFees}
        total={progress.total}
        products={progress.products}
        returnables={progress.returnables}
        returnedReturnables={progress.returnedReturnables}
        showPrepared={purchaseOrder.status === PurchaseOrderStatusKind.Completed.Value || purchaseOrder.status === PurchaseOrderStatusKind.Delivered.Value}
        showDelivered={false} />
{:else}
    <Loader />
{/if}