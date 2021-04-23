<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import SelectTime from "./SelectTime.svelte";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import { CREATE_AGREEMENT } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_AGREEMENTS } from "./queries";

	const errorsHandler = new SheaftErrors();

	export let onClosed, close, store, producerId;

	const graphQLInstance = GetGraphQLInstance();

	let selectedDelivery = null;
	let isLoading = false;

	$: isValid = selectedDelivery && selectedDelivery.openingHours.length > 0;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			CREATE_AGREEMENT,
			{
				storeId: store.id,
				producerId: producerId,
				deliveryId: selectedDelivery.id,
			},
			errorsHandler.Uuid,
			GET_AGREEMENTS
		);

		isLoading = false;

		if (!res.success) {
			// todo
			return;
		}

		return await closeModal(res);
	};

	async function closeModal(obj) {
		close();
		if (onClosed) await onClosed(obj);
	}
</script>

<ActionConfirm
	{errorsHandler}
	title="Demander un accord"
	icon={faCheck}
	submit={handleSubmit}
	{isLoading}
	valid={isValid}
	submitText="Confirmer"
	closeText="Annuler"
	{close}>
	<p class="leading-5">
		Vous vous apprêtez à demander un accord de partenariat avec {store.name}
	</p>
	<p class="leading-5 mb-5">
		Le magasin sera automatiquement notifié de votre demande.
	</p>
	<SelectTime bind:selectedDelivery />
</ActionConfirm>
