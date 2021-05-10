<script>
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import { DELETE_CATALOGS } from "./mutations";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_CATALOGS } from "./queries";

	const errorsHandler = new SheaftErrors();

	export let catalog, close, onClose;

	let isLoading = false;
	const graphQLInstance = GetGraphQLInstance();

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			DELETE_CATALOGS, { ids: [catalog.id] },
			errorsHandler.Uuid,
			GET_CATALOGS
    );
    
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		return await handleClose(res);
	};

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};
</script>

<ActionConfirm
	title="Suppression"
	level="danger"
	{isLoading}
	submit={handleSubmit}
	{errorsHandler}
	close={() => handleClose({ success: false, data: null })}>
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
