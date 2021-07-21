<script>
	import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { EXPORT_TIMERANGED_BILLINGS } from "./mutations";
	import { GET_DELIVERIES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import DatePickerWrapper from "../../components/controls/DatePickerWrapper.svelte";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let onClose, close;

	let isLoading = false;
	let from = new Date();
	let to = new Date();
	let name;
	let end = new Date();
	let start = new Date(end.getFullYear() - 2, end.getMonth(), end.getDate());

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: EXPORT_TIMERANGED_BILLINGS,
			variables: {
				from: from,
				to: to,
				name,
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
	title="Exporter les livraisons"
	icon={faCheck}
	submit={handleSubmit}
	submitText="Exporter"
	closeText="Fermer"
	{isLoading}
	{close}
>
	<p class="leading-5 pt-4 pb-6">
		Vous vous apprêtez à générer un fichier excel contenant les livraisons (non facturées) dans cette période :
	</p>
	<div class="form-control">
		<label>Date de début</label>
		<DatePickerWrapper bind:selected={from} {start} {end} />
	</div>
	<div class="form-control">
		<label>Date de fin</label>
		<DatePickerWrapper bind:selected={to} {start} {end} />
	</div>
	<form class="mt-2">
		<div class="form-control w-full">
			<label for="name">Nom </label>
			<input bind:value={name} id="name" type="text" placeholder="Donner un nom à votre export (optionnel)" />
		</div>
	</form>
</ActionConfirm>
