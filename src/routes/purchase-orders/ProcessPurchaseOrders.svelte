<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { PROCESS_PURCHASE_ORDERS } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_ORDERS } from "./queries";
	import { getContext } from "svelte";

	export let onClose, close, purchaseOrders;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: PROCESS_PURCHASE_ORDERS,
			variables: { ids: purchaseOrders.map((o) => o.id) },
			errorsHandler,
			success: async (res) => await handleClose(res),
			successNotification: "Commande acceptée",
			errorNotification: "Impossible d'accepter la commande.",
			clearCache: [GET_ORDERS]
		});
		isLoading = false;
	};

	const handleClose = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	};
</script>

<ActionConfirm
	{errorsHandler}
	title={purchaseOrders.length > 1 ? 'Préparer ces commandes' : 'Préparer cette commande'}
	icon={faCheck}
	submitText="Préparer"
	closeText="Fermer"
	submit={handleSubmit}
	{isLoading}
	{close}>
	<p class="leading-5">
		Préparer {purchaseOrders.length > 1 ? 'ces commandes' : 'cette commande'}
		alertera automatiquement votre client que vous avez débuté la préparation
		de sa commande.
	</p>
</ActionConfirm>
