<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_AGREEMENTS } from "./queries.js";
	import SelectCatalog from "../search-stores/SelectCatalog.svelte";
	import { UPDATE_AGREEMENT_CATALOG } from "./mutations";
	import { getContext } from "svelte";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, agreement;
	const { mutate } = getContext("api");

	let isLoading = false;
	let selectedCatalog = null;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: UPDATE_AGREEMENT_CATALOG,
			variables: {
				agreementId: agreement.id,
				catalogId: selectedCatalog?.id,
			},
			errorsHandler,
			success: async (res) => await handleClose(res),
			errorNotification: "Impossible de modifier le catalogue",
			clearCache: [GET_AGREEMENTS],
		});
		isLoading = false;
	};

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};

</script>

<ActionConfirm
	{errorsHandler}
	title="Changer le catalogue"
	icon={faCheck}
	{isLoading}
	submit={handleSubmit}
	submitText="Confirmer"
	closeText="Annuler"
	valid={selectedCatalog != null}
	close={() => handleClose({ success: false, data: null })}
>
	<div class="leading-5 text-gray-600 mt-2 mb-5">Choisissez un nouveau catalogue pour ce magasin</div>
	<SelectCatalog bind:selectedCatalog />
</ActionConfirm>
