<script>
	import { faTimes } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CANCEL_PURCHASE_ORDERS } from "./mutations.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_ORDERS } from "./queries";

	export let onClose, close, purchaseOrders;

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();

	let isLoading = false;
	let reason = null;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			CANCEL_PURCHASE_ORDERS,
			{
				ids: purchaseOrders.map((o) => o.id),
				reason: reason,
			},
			errorsHandler.Uuid,
			GET_ORDERS
		);

		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		await handleClose(res);
	};

	const handleClose = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	};
</script>

<ActionConfirm
	{errorsHandler}
	title={purchaseOrders.length > 1 ? 'Annuler ces commandes' : 'Annuler cette commande'}
	level="danger"
	{isLoading}
	icon={faTimes}
	submit={handleSubmit}
	submitText="Confirmer l'annulation"
	closeText="Fermer"
	{close}>
	<p class="leading-5">
		Annuler {purchaseOrders.length > 1 ? 'ces commandes' : 'cette commande'}
		alertera automatiquement votre client.
	</p>
	<form class="mt-2">
		<label
			class="block uppercase tracking-wide text-gray-700 text-xs font-bold"
			for="reason">
			Raison
		</label>
		<input
			bind:value={reason}
			class="appearance-none block w-full text-gray-700 border input-bg-clr
			rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
			focus:shadow-outline-green focus:bg-white"
			id="reason"
			type="text"
			placeholder="Expliquez l'annulation (optionnel)" />
	</form>
</ActionConfirm>
