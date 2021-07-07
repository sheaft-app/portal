<script>
	import { getContext } from "svelte";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELETE_DELIVERY_BATCH } from "./mutations";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_DELIVERY_BATCH_DETAILS } from "./queries.js";

	export let deliveryBatch, close, onClose;

	const { mutate, isLoading } = getContext("api");
	const errorsHandler = new SheaftErrors();

	const handleSubmit = async () =>
		await mutate({
			mutation: DELETE_DELIVERY_BATCH,
			variables: { id: deliveryBatch.id },
			errorsHandler,
			success: (res) => handleClose(res),
			successNotification: `La programmation a bien été supprimé`,
			errorNotification: `Impossible de supprimer cette programmation`,
			clearCache: [deliveryBatch.id],
		});

	const handleClose = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	};

</script>

<ActionConfirm title="Suppression" level="danger" submit={handleSubmit} isLoading={$isLoading} {close} {errorsHandler}>
	<p class="leading-5">
		Vous vous apprêtez à
		<span class="text-gray-700">supprimer cette programmation</span>
	</p>
	<p>
		Cette opération est
		<span class="text-red-600 font-bold">irréversible.</span>
	</p>
</ActionConfirm>
