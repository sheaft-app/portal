<script>
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELETE_DELIVERY } from "./mutations";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_DELIVERIES } from "./queries.js";

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	export let delivery, close, onClose;

	let isLoading = false;

	async function closeModal(obj) {
		close();
		if (onClosed) await onClose(obj);
	}

	const handleSubmit = async () => {
		isLoading = true;

		var res = await graphQLInstance.mutate(
			DELETE_DELIVERY,
			{ id: delivery.id },
			errorsHandler.Uuid,
			GET_DELIVERIES
		);

		isLoading = false;

		if (!res.success) {
			// todo
			return;
		}

		return await closeModal(res);
	};
</script>

<ActionConfirm
	title="Suppression"
	level="danger"
	submit={handleSubmit}
	{isLoading}
	{close}
	{errorsHandler}>
	<p class="leading-5">
		Vous vous apprêtez à
		<span class="text-gray-700">supprimer cette livraison</span>
	</p>
	<p>
		Cette opération est
		<span class="text-red-600 font-bold">irréversible.</span>
	</p>
</ActionConfirm>
