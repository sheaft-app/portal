<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELETE_QUICKORDERS } from "./mutations.js";
	import { GET_QUICKORDERS } from "./queries.js";
	import { getContext } from "svelte";
	import SheaftErrors from "./../../services/SheaftErrors";

	const errorsHandler = new SheaftErrors();
	const { mutate, isLoading } = getContext("api");

	export let selectedItems, close, onClose;

	const handleSubmit = async () => {
		return mutate({
			mutation: DELETE_QUICKORDERS,
			variables: { ids: selectedItems.map((s) => s.id) },
			errorsHandler,
			success: (res) => handleClose(res),
			successNotification: "Le modèle de commande a bien été supprimé",
			errorNotification: "Impossible de supprimer ce modèle de commande",
			clearCache: [GET_QUICKORDERS],
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
		Cette opération supprimera tous les modèles ci-dessous. Cette opération est
		<span class="text-red-600 font-bold">irréversible.</span>
	</p>
	<ul class="text-gray-600 mt-2 font-semibold">
		{#each selectedItems as quickOrder}
			<li>{quickOrder.name}</li>
		{/each}
	</ul>
</ActionConfirm>
