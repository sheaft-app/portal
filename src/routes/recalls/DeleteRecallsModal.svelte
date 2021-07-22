<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELETE_RECALLS } from "./mutations.js";
	import { GET_RECALLS } from "./queries.js";
	import { getContext } from "svelte";
	import SheaftErrors from "./../../services/SheaftErrors";

	const errorsHandler = new SheaftErrors();
	const { mutate, isLoading } = getContext("api");

	export let selectedItems, close, onClose;

	const handleSubmit = async () => {
		await mutate({
			mutation: DELETE_RECALLS,
			variables: { ids: selectedItems.map((s) => s.id) },
			errorsHandler,
			success: async (res) => await handleClose({ success: true }),
			successNotification: "La campagne de rappel a bien été supprimée",
			errorNotification: "Impossible de supprimer cette campagne de rappel",
			clearCache: [GET_RECALLS],
		});
	};

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
	close={() => handleClose({ success: false, data: null })}
>
	<p>
		Cette opération supprimera toutes les campagnes ci-dessous. Cette opération est
		<span class="text-red-600 font-bold">irréversible.</span>
	</p>
	<ul class="text-gray-600 mt-2 font-semibold">
		{#each selectedItems as recall}
			<li>{recall.name}</li>
		{/each}
	</ul>
</ActionConfirm>
