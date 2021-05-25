<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { ACCEPT_PURCHASE_ORDERS } from "./mutations.js";
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
			mutation: ACCEPT_PURCHASE_ORDERS,
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
	title={purchaseOrders.length > 1 ? 'Accepter les commandes' : 'Accepter la commande'}
	icon={faCheck}
	submit={handleSubmit}
	submitText="Accepter"
	closeText="Fermer"
	{isLoading}
	{close}>
	<p class="leading-5">
		Vous vous apprêtez à accepter {purchaseOrders.length > 1 ? 'ces commandes' : 'cette commande'}.
	</p>
	<p class="leading-5">
		Le client sera automatiquement notifié de cette validation.
	</p>
</ActionConfirm>

<style lang="scss">
	button {
		&.selected {
			background-color: #33d7a3;
			color: #ffffff;
		}
	}
</style>
