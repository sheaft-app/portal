<script>
	import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { MARK_TIME_RANGE_DELIVERIES_AS_BILLED } from "./mutations";
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
			mutation: MARK_TIME_RANGE_DELIVERIES_AS_BILLED,
			variables: {
				from: from,
				to: to
			},
			errorsHandler,
			success: (res) => handleClose({ data: res, success: true }),
			successNotification: `Les livraisons du ${from} au ${to} ont bien été archivées.`,
			errorNotification: "Impossible d'archiver les livraisons.",
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
	title="Archiver les livraisons"
	icon={faCheck}
	submit={handleSubmit}
	submitText="Archiver"
	closeText="Fermer"
	{isLoading}
	{close}
>
	<p class="leading-5 pt-4 pb-6">
		Vous vous apprêtez à archiver les commandes livrées dans la période suivante :
	</p>
	<div class="form-control">
		<label>Date de début</label>
		<DatePickerWrapper bind:selected={from} {start} {end} />
	</div>
	<div class="form-control">
		<label>Date de fin</label>
		<DatePickerWrapper bind:selected={to} {start} {end} />
	</div>
</ActionConfirm>
