<script>
	import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { MARK_DELIVERIES_AS_BILLED } from "./mutations";
	import { GET_DELIVERIES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let onClose, close, deliveries;

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: MARK_DELIVERIES_AS_BILLED,
			variables: {
				ids: deliveries.map((d) => d.id),
			},
			errorsHandler,
			success: (res) => handleClose({ data: res, success: true }),
			successNotification: "Vos livraisons ont bien été archivées.",
			errorNotification: "Impossible d'archiver ces livraisons.",
			clearCache: [GET_DELIVERIES],
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
	title={deliveries.length > 1 ? "Archiver les livraisons" : "Archiver la livraison"}
	icon={faCheck}
	submit={handleSubmit}
	submitText="Archiver"
	closeText="Fermer"
	{isLoading}
	{close}
>
	<p class="leading-5 pt-2 pb-4">
		Vous vous apprêtez à archiver {deliveries.length > 1
			? "ces livraisons"
			: "cette livraison"}.
	</p>
	{#if deliveries.length > 1}
		<ul>
			{#each deliveries as delivery}
				<li>{delivery.reference} ({delivery.purchaseOrdersCount} commande(s))</li>
			{/each}
		</ul>
	{/if}
</ActionConfirm>
