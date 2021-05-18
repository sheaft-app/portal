<script>
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { DELETE_CATALOGS } from "./mutations";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_CATALOGS } from "./queries";
	import { getContext } from "svelte";

	const errorsHandler = new SheaftErrors();

	export let catalog, close, onClose;

	const { mutate, isLoading } = getContext("api");

	const handleSubmit = async () => await mutate({
		mutation: DELETE_CATALOGS,
		variables: { ids: [catalog.id] },
		errorsHandler,
		success: (res) => handleClose(res),
		successNotification: "Le catalogue a bien été supprimé",
		errorNotification: "Impossible de supprimer ce catalogue",
		clearCache: [GET_CATALOGS]
	});

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};
</script>

<ActionConfirm
	title="Suppression"
	level="danger"
	isLoading={$isLoading}
	submit={handleSubmit}
	{errorsHandler}
	{close}>
	<p class="leading-5">
		Vous vous apprêtez à
		<span class="text-gray-700">supprimer le catalogue {catalog.name}</span>
	</p>
	<p>
		Cette opération est
		<span class="text-red-600 font-bold">irréversible</span>
		.
	</p>
</ActionConfirm>
