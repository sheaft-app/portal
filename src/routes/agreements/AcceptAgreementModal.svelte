<script>
	import {faCheck} from "@fortawesome/free-solid-svg-icons";

	;
	import SelectTime from "../search-stores/SelectTime.svelte";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import {ACCEPT_AGREEMENT} from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import {GET_AGREEMENTS} from "./queries.js";
	import AgreementStatusKind from "../../enums/AgreementStatusKind";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, agreement;

	const graphQLInstance = GetGraphQLInstance();

	let isLoading = false;
	let selectedDelivery = null;

	$: isFromProducer = agreement.status == AgreementStatusKind.WaitingForStoreApproval.Value;
	$: isValid = isFromProducer ? true : selectedDelivery && selectedDelivery.selectedHours.length > 0;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(ACCEPT_AGREEMENT, {
				id: agreement.id,
				selectedHours: isFromProducer ? null : selectedDelivery.selectedHours.map((selectedHour) => {
					return {
						days: [selectedHour.day],
						from: selectedHour.from,
						to: selectedHour.to
					}
				})
			},
			errorsHandler.Uuid,
			GET_AGREEMENTS);

		isLoading = false;

		if (!res.success) {
			// todo
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
	title='Accepter un accord'
	icon={faCheck}
	{isLoading}
	submit={handleSubmit}
	valid={isValid}
	submitText="Confirmer"
	closeText="Annuler"
	close={() => handleClose({success:false, data:null})}>
	<p class="leading-5 text-gray-600">
		Vous vous apprêtez à accepter l'accord
		avec {isFromProducer ? agreement.delivery.producer.name : agreement.store.name}
	</p>
	{#if !isFromProducer}
		<SelectTime bind:selectedDelivery={selectedDelivery}/>
	{/if}
</ActionConfirm>
