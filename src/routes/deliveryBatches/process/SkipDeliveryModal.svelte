<script>
    import { getContext } from "svelte";
    import ActionConfirm from "../../../components/modal/ActionConfirm.svelte";
	import { GET_DELIVERY_BATCHES } from "../queries";
	import { SKIP_DELIVERY } from "../mutations";
	import DeliveryBatchesRoutes from "../routes";
    import { faForward } from "@fortawesome/free-solid-svg-icons";
    import GetRouterInstance from "../../../services/SheaftRouter";
    import SheaftErrors from "../../../services/SheaftErrors";

    export let id, deliveryBatchId, close;

    const errorsHandler = new SheaftErrors();
    const routerInstance = GetRouterInstance();
	const { mutate } = getContext("api");

    let isLoading = false;
    
    const submit = async () => {
		isLoading = true;
		await mutate({
			mutation: SKIP_DELIVERY,
			variables: { id },
			errorsHandler,
			success: () => routerInstance.goTo(DeliveryBatchesRoutes.NextDelivery, { id: deliveryBatchId }),
			successNotification: "Livraison passée",
			errorNotification: "Impossible de passer la livraison",
			clearCache: [GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Passer cette livraison"
	{submit}
	{isLoading}
	{close}
	submitText="Confirmer"
	icon={faForward}
	closeText="Annuler"
>
	<p class="pt-2 pb-1 leading-5">Vous vous apprêtez à passer cette livraison.</p>
</ActionConfirm>