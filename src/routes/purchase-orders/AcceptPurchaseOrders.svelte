<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { ACCEPT_PURCHASE_ORDERS } from "./mutations.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_ORDERS } from "./queries";

	export let onClose, close, purchaseOrders;

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			ACCEPT_PURCHASE_ORDERS,
			{
				ids: purchaseOrders.map((o) => o.id),
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
	title={purchaseOrders.length > 1 ? 'Accepter les commandes' : 'Accepter la commande'}
	level="success"
	icon={faCheck}
	submit={handleSubmit}
	submitText="Accepter"
	closeText="Fermer"
	{isLoading}
	close={() => handleClose({ success: false, data: null })}>
	<p class="leading-5">
		Vous vous apprêtez à accepter {purchaseOrders.length > 1 ? 'ces commandes' : 'cette commande'}.
	</p>
	<p class="leading-5">
		Le client sera automatiquement notifié de cette validation et débité du
		montant correspondant.
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
