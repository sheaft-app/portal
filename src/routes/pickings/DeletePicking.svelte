<script>
	import { getContext } from "svelte";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELETE_PICKING } from "./mutations";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_PICKINGS } from "./queries.js";

	export let picking, close, onClose;

	const { mutate, isLoading } = getContext("api");
	const errorsHandler = new SheaftErrors();

	const handleSubmit = async () =>
		await mutate({
			mutation: DELETE_PICKING,
			variables: { id: picking.id },
			errorsHandler,
			success: (res) => handleClose(res),
			successNotification: `La préparation a bien été supprimée`,
			errorNotification: `Impossible de supprimer la préparation`,
			clearCache: [GET_PICKINGS],
		});

	const handleClose = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	};
</script>

<ActionConfirm title="Suppression" level="danger" submit={handleSubmit} isLoading={$isLoading} {close} {errorsHandler}>
	<p class="leading-5">
		Vous vous apprêtez à
		<span class="text-gray-700">supprimer cette préparation</span>
	</p>
	<p>
		Cette opération est
		<span class="text-red-600 font-bold">irréversible.</span>
	</p>
</ActionConfirm>
