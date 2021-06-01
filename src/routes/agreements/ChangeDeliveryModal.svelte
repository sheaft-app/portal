<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_AGREEMENTS } from "./queries.js";
	import SelectTime from "../search-stores/SelectTime.svelte";
	import { UPDATE_AGREEMENT_DELIVERY } from "./mutations";
	import { getContext } from "svelte";

	export let onClose, close, agreement;

	const { mutate } = getContext("api");
	const errorsHandler = new SheaftErrors();

	let isLoading = false;
	let selectedDelivery = null;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: UPDATE_AGREEMENT_DELIVERY,
			variables: {
				agreementId: agreement.id,
				deliveryId: selectedDelivery?.id,
			},
			errorsHandler,
			success: async (res) => await handleClose(res),
			errorNotification: "Impossible de modifier le créneau de livraison",
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
	title="Changer le créneau de livraison"
	icon={faCheck}
	{isLoading}
	submit={handleSubmit}
	submitText="Confirmer"
	closeText="Annuler"
	valid={selectedDelivery != null}
	{close}
>
	<div class="leading-5 text-gray-600 mt-2 mb-5">Choisissez un nouveau créneau de livraison</div>
	<SelectTime bind:selectedDelivery />
</ActionConfirm>
