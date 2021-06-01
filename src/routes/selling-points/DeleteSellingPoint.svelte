<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELETE_SELLING_POINT } from "./mutations";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_SELLING_POINTS } from "./queries";
	import { getContext } from "svelte";

	const errorsHandler = new SheaftErrors();
	const { mutate, isLoading } = getContext("api");

	export let sellingPoint, close, onClose;

	const handleSubmit = async () => {
		mutate({
			mutation: DELETE_SELLING_POINT,
			variables: { id: sellingPoint.id },
			errorsHandler,
			success: async (res) => await handleClose(res),
			successNotification: "Le point de vente a été supprimé avec succès",
			errorNotification: "Impossible de supprimer le point de vente",
			clearCache: [GET_SELLING_POINTS],
		});
	};

	const handleClose = async (res) => {
		if (onClose) await onClose(res);
		close();
	};

</script>

<ActionConfirm
	title="Suppression"
	level="danger"
	isLoading={$isLoading}
	submit={handleSubmit}
	close={() => handleClose({ success: false, data: null })}
	{errorsHandler}
>
	<p class="leading-5 text-gray-600">
		Vous vous apprêtez à <span class="text-gray-700">supprimer ce point de vente</span>
	</p>
	<p class="text-gray-600">
		Cette opération est <span class="text-red-600 font-bold">irréversible.</span>
	</p>
</ActionConfirm>
