<script>
	import { faTimes } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { REFUSE_PURCHASE_ORDERS } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_ORDERS } from "./queries";
	import { getContext } from "svelte";

	export let onClose, close, purchaseOrders;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let isLoading = false;
	let reason = null;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: REFUSE_PURCHASE_ORDERS,
			variables: { ids: purchaseOrders.map((o) => o.id), reason },
			errorsHandler,
			success: async (res) => await handleClose({ success: true, data: res }),
			successNotification: "Commande refusée",
			errorNotification: "Impossible de refuser la commande.",
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
	title={purchaseOrders.length > 1 ? "Refuser ces commandes" : "Refuser cette commande"}
	level="danger"
	icon={faTimes}
	submitText="Refuser"
	closeText="Fermer"
	submit={handleSubmit}
	{isLoading}
	{close}
>
	<p class="leading-5">
		Refuser {purchaseOrders.length > 1 ? "ces commandes" : "cette commande"} alertera automatiquement {purchaseOrders.length >
		1
			? "vos clients"
			: "votre client"}.
	</p>
	<form class="mt-2">
		<div class="form-control w-full">
			<label for="reason"> Raison </label>
			<input bind:value={reason} id="reason" type="text" placeholder="Expliquez votre refus (optionnel)" />
		</div>
	</form>
</ActionConfirm>
