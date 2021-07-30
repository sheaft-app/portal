<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import SelectTime from "./SelectTime.svelte";
	import SelectCatalog from "./SelectCatalog.svelte";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CREATE_AGREEMENT } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_AGREEMENTS } from "./queries";
	import { getContext } from "svelte";

	export let onClosed, close, store, producerId;

	const { mutate } = getContext("api");
	const errorsHandler = new SheaftErrors();

	let selectedDelivery = null;
	let selectedCatalog = null;
	let isLoading = false;

	$: isValid = selectedDelivery && selectedDelivery.deliveryHours.length > 0 && selectedCatalog;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_AGREEMENT,
			variables: { storeId: store.id, catalogId: selectedCatalog.id, producerId, deliveryId: selectedDelivery.id },
			errorsHandler,
			success: async (res) => closeModal(res),
			successNotification: "Demande de partenariat envoyée !",
			errorNotification: "Impossible de faire une demande de partenariat.",
			clearCache: [GET_AGREEMENTS],
		});
		isLoading = false;
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
	{close}
>
	<p class="leading-5">
		Vous vous apprêtez à demander un accord de partenariat avec {store.name}.
	</p>
	<p class="leading-5 mb-5">Le magasin sera automatiquement notifié de votre demande.</p>
	<SelectTime bind:selectedDelivery {errorsHandler} />
	<SelectCatalog bind:selectedCatalog {errorsHandler} />
</ActionConfirm>
