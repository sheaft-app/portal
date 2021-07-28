<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELIVER_PURCHASE_ORDERS } from "./mutations.js";
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
			mutation: DELIVER_PURCHASE_ORDERS,
			variables: { ids: purchaseOrders.map((o) => o.id) },
			errorsHandler,
			success: async (res) => await handleClose({ success: true, data: res }),
			successNotification: "Commande livrée",
			errorNotification: "Impossible de marquer la commande comme livrée.",
			clearCache: [GET_ORDERS],
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
	title={purchaseOrders.length > 1 ? "Marquer ces commandes comme livrées" : "Marquer cette commande comme livrée"}
	submit={handleSubmit}
	submitText="Oui"
	closeText="Non"
	icon={faCheck}
	{isLoading}
	{close}
>
	<p class="leading-5">
		Marquer {purchaseOrders.length > 1 ? "ces commandes comme livrées" : "cette commande comme livrée"}
		indiquera au client que la commande a été réceptionnée.
	</p>
</ActionConfirm>
