<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { COMPLETE_PURCHASE_ORDERS } from "./mutations.js";
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
			mutation: COMPLETE_PURCHASE_ORDERS,
			variables: { ids: purchaseOrders.map((o) => o.id) },
			errorsHandler,
			success: async (res) => await handleClose(res),
			successNotification: "Commande terminée",
			errorNotification: "Impossible de terminer la commande.",
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
	title={purchaseOrders.length > 1 ? "Marquer ces commandes comme prêtes" : "Marquer cette commande comme prête"}
	submit={handleSubmit}
	submitText="Oui"
	closeText="Non"
	icon={faCheck}
	{isLoading}
	{close}
>
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
