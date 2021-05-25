<script>
	import {faCheck} from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetAuthInstance from "../../services/SheaftAuth";
	import SheaftErrors from "./../../services/SheaftErrors";
	import {GET_AGREEMENTS} from "./queries.js";
	import SelectTime from "../search-stores/SelectTime.svelte";
	import {UPDATE_AGREEMENT_DELIVERY} from "./mutations";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, agreement;
	const graphQLInstance = GetGraphQLInstance();
	const authInstance = GetAuthInstance();

	let isLoading = false;
	let selectedDelivery = null;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(UPDATE_AGREEMENT_DELIVERY, {
				agreementId: agreement.id,
				deliveryId: selectedDelivery?.id
			},
			errorsHandler.Uuid,
			GET_AGREEMENTS);

		if (!res.success) {
			// todo
			isLoading = false;
			return;
		}

		await handleClose(res);
	}

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	}
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
	close={() => handleClose({success:false, data:null})}>
	<div class="leading-5 text-gray-600 mt-2 mb-5">
		Choisissez un nouveau créneau de livraison
	</div>
	<SelectTime bind:selectedDelivery/>
</ActionConfirm>
