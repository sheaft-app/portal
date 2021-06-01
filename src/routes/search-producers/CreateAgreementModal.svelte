<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CREATE_AGREEMENT } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_AGREEMENTS } from "./queries.js";
	import { getContext } from "svelte";

	const errorsHandler = new SheaftErrors();

	export let onClosed, close, producer, storeId;

	const { mutate } = getContext("api");

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_AGREEMENT,
			variables: { storeId, producerId: producer.id },
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
	submitText="Confirmer"
	closeText="Annuler"
	{close}
>
	<p class="leading-5">
		Vous vous apprêtez à demander un accord de partenariat avec {producer.name}
	</p>
	<p class="leading-5">Le producteur sera automatiquement notifié de votre demande.</p>
</ActionConfirm>
