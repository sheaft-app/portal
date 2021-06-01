<script>
	import { getContext } from "svelte";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELETE_DELIVERY } from "./mutations";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_DELIVERIES } from "./queries.js";

	export let delivery, close, onClose;

	const { mutate, isLoading } = getContext("api");
	const errorsHandler = new SheaftErrors();

	const handleSubmit = async () =>
		await mutate({
			mutation: DELETE_DELIVERY,
			variables: { id: delivery.id },
			errorsHandler,
			success: (res) => handleClose(res),
			successNotification: `Le créneau a bien été supprimé`,
			errorNotification: `Impossible de supprimer ce créneau`,
			clearCache: [GET_DELIVERIES],
		});

	const handleClose = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	};

</script>

<ActionConfirm title="Suppression" level="danger" submit={handleSubmit} isLoading={$isLoading} {close} {errorsHandler}>
	<p class="leading-5">
		Vous vous apprêtez à
		<span class="text-gray-700">supprimer cette livraison</span>
	</p>
	<p>
		Cette opération est
		<span class="text-red-600 font-bold">irréversible.</span>
	</p>
</ActionConfirm>
