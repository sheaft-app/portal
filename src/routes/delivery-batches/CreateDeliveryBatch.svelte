<script>
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import DeliveryBatchForm from "./DeliveryBatchForm.svelte";
	import { CREATE_DELIVERY_BATCH } from "./mutations";
	import { GET_DELIVERY_BATCHES, GET_COMPLETED_ORDERS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import { getContext } from "svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import DeliveryBatchesRoutes from "./routes";

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let deliveryBatch = undefined;

	const handleSubmit = async () =>
		await mutate({
			mutation: CREATE_DELIVERY_BATCH,
			variables: deliveryBatch,
			errorsHandler,
			success: async () => await routerInstance.goTo(DeliveryBatchesRoutes.List),
			successNotification: "Votre livraison a bien été programmée",
			errorNotification: "Impossible de programmer la livraison",
			clearCache: [GET_COMPLETED_ORDERS, GET_DELIVERY_BATCHES],
		});
</script>

<TransitionWrapper>
	<PageHeader name="Programmer une livraison" previousPage={DeliveryBatchesRoutes.List} />
	<PageBody {errorsHandler}>
		<DeliveryBatchForm submit={handleSubmit} bind:deliveryBatch />
	</PageBody>
</TransitionWrapper>
