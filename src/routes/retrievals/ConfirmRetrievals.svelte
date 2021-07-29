<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { DELIVER_PURCHASE_ORDERS } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_PENDING_RETRIEVALS } from "./queries";
	import { getContext } from "svelte";

	export let onClose, close, retrievals;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: DELIVER_PURCHASE_ORDERS,
			variables: {
				ids: retrievals.reduce((acc, curr) => {
					return [...acc, ...curr.purchaseOrders.map((a) => a.id)];
				}, []),
			},
			errorsHandler,
			success: async (res) => await handleClose({ success: true, data: res }),
			successNotification: "Commande distribuée",
			errorNotification: "Impossible de marquer la commande comme distribuée.",
			clearCache: [GET_PENDING_RETRIEVALS],
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
	title={retrievals.length > 1 ? "Marquer ces commandes comme distribuées" : "Marquer cette commande comme distribuée"}
	submit={handleSubmit}
	submitText="Oui"
	closeText="Non"
	icon={faCheck}
	{isLoading}
	{close}
>
	<p class="leading-5">
		Marquer {retrievals.length > 1 ? "ces commandes comme distribuées" : "cette commande comme distribuée"}
		indiquera au client que sa commande a bien été récupérée.
	</p>
</ActionConfirm>
