<script>
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_RETURNABLES } from "./queries";
	import { DELETE_RETURNABLE } from "./mutations";
	import SheaftErrors from "../../services/SheaftErrors";
	import { getContext } from "svelte";

	const { mutate, isLoading } = getContext("api");
	const errorsHandler = new SheaftErrors();

	export let returnable, close, onClose;

	const handleSubmit = async () => {
		mutate({
			mutation: DELETE_RETURNABLE,
			variables: { id: returnable.id },
			errorsHandler,
			success: async (res) => await handleClose(res),
			successNotification: "La consigne a été supprimée avec succès",
			errorNotification: "Impossible de supprimer la consigne",
			clearCache: [GET_RETURNABLES],
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
	{errorsHandler}
	close={() => handleClose({ success: false, data: null })}
>
	<p class="leading-5">
		Vous vous apprêtez à
		<span class="text-gray-700">supprimer la consigne {returnable.name}</span>
	</p>
	<p>
		Cette opération est
		<span class="text-red-600 font-bold">irréversible</span>
		.
	</p>
</ActionConfirm>
