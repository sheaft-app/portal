<script>
	import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { EXPORT_BILLINGS } from "./mutations";
	import { GET_DELIVERIES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let onClose, close, deliveries;

	let isLoading = false;
	let name;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: EXPORT_BILLINGS,
			variables: {
				name: name,
				ids: deliveries.map((d) => d.id),
			},
			errorsHandler,
			success: (res) => handleClose({ data: res, success: true }),
			successNotification: "Demande d'export envoyée.",
			errorNotification: "Impossible de générer une demande d'export.",
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
	title={deliveries.length > 1 ? "Exporter ces livraisons" : "Exporter cette livraison"}
	icon={faCheck}
	submit={handleSubmit}
	submitText="Exporter"
	closeText="Fermer"
	{isLoading}
	{close}
>
	<p class="leading-5 pt-4 pb-6">
		Vous vous apprêtez à générer un fichier excel contenant {deliveries.length > 1
			? "ces livraisons regroupées par produit"
			: "cette livraison"}.
	</p>
	<div>
		{#each deliveries as delivery}
			<li>{delivery.reference} du {format(new Date(delivery.deliveredOn), "P", { locale: fr })}</li>
		{/each}
	</div>
	<form class="mt-4">
		<div class="form-control w-full">
			<label for="name">Nom </label>
			<input bind:value={name} id="name" type="text" placeholder="Donner un nom à votre export (optionnel)" />
		</div>
	</form>
</ActionConfirm>
