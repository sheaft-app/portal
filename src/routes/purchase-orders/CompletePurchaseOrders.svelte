<script>
	import {faCheck} from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import {COMPLETE_PURCHASE_ORDERS} from "./mutations.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import SheaftErrors from "./../../services/SheaftErrors";
	import {GET_ORDERS} from "./queries";

	export let onClose, close, purchaseOrders;

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			COMPLETE_PURCHASE_ORDERS,
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
	title={purchaseOrders.length > 1 ? 'Marquer ces commandes comme prêtes' : 'Marquer cette commande comme prête'}
	submit={handleSubmit}
	submitText="Oui"
	closeText="Non"
	icon={faCheck}
	{isLoading}
	close={() => handleClose({ success: false, data: null })}>
	<p class="leading-5">
		{#if purchaseOrders.length > 1}
			Marquer ces commandes comme prêtes alertera automatiquement leur client que tout est prêt pour venir la récupérer
			aux heures choisies.
		{:else}
			Marquer cette commande comme prête alertera automatiquement votre client que tout est prêt pour venir la récupérer
			à l'heure choisie.
		{/if}
	</p>
</ActionConfirm>
