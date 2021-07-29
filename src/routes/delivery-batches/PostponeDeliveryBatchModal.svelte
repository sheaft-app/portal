<script>
	import { getContext, onMount } from "svelte";
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_DELIVERY_BATCHES, GET_DELIVERY_BATCH_DETAILS } from "./queries";
	import { POSTPONE_DELIVERY_BATCH, COMPLETE_DELIVERY_BATCH } from "./mutations";
	import DeliveryBatchesRoutes from "./routes";
	import Loader from "../../components/Loader.svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import GetRouterInstance from "../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import DatePickerWrapper from "./../../components/controls/DatePickerWrapper.svelte";
	import TimePicker from "../../components/controls/TimePicker.svelte";
	import { timeToTimeSpan, getIsoDate } from "../../helpers/app";
	import DeliveryStatus from "../../enums/DeliveryStatus";

	export let id, close, onClose;

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	let isLoading = false;
	let isInitializing = true;
	let hasStartedDeliveryBatch = false;

	let reason,
		scheduledOn = new Date(),
		from = { hours: null, minutes: null };

	onMount(async () => {
		isInitializing = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id },
			errorsHandler,
			success: (res) => {
				hasStartedDeliveryBatch =
					res.deliveries.filter((d) =>
						[DeliveryStatus.Delivered.Value, DeliveryStatus.Rejected.Value].includes(d.status)
					).length >= 1;
			},
			error: () => close(),
			errorNotification: "Impossible de récupérer les informations de la livraison.",
		});
		isInitializing = false;
	});

	const postponeSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: POSTPONE_DELIVERY_BATCH,
			variables: { id, reason, scheduledOn: getIsoDate(scheduledOn), from: timeToTimeSpan(from) },
			errorsHandler,
			success: async (res) => await handleClose({ success: true, data: res }),
			successNotification: "Livraison décalée avec succès !",
			errorNotification: "Impossible de reporter la livraison",
			clearCache: [GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};

	const handleClose = async (res) => {
		if (onClose) await onClose(res);
		close();
	};

	const rescheduleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: COMPLETE_DELIVERY_BATCH,
			variables: { id, scheduledOn: getIsoDate(scheduledOn), from: timeToTimeSpan(from) },
			errorsHandler,
			success: (res) => routerInstance.goTo(DeliveryBatchesRoutes.Summary, { id }),
			successNotification: "Livraison décalée avec succès !",
			errorNotification: "Impossible de reporter la livraison",
			clearCache: [GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Reporter la livraison"
	submit={hasStartedDeliveryBatch ? rescheduleSubmit : postponeSubmit}
	{isLoading}
	{close}
	valid={scheduledOn && from.hours !== null && from.minutes !== null}
	submitText="Confirmer"
	icon={faCheck}
	closeText="Fermer"
>
	{#if !isInitializing}
		<p class="mb-3">Toutes les livraisons non complétées seront reportées :</p>
		<div class="form-control text-left" style="display:block;">
			<label>Reporter au *</label>
			<DatePickerWrapper bind:selected={scheduledOn} dateChosen={true} />
		</div>
		<div class="form-control text-left" style="display:block;">
			<label>Heure de départ * </label>
			<TimePicker bind:time={from} />
		</div>
		{#if !hasStartedDeliveryBatch}
			<div class="form-control text-left">
				<label for="reason">Raison </label>
				<input bind:value={reason} id="reason" type="text" placeholder="Expliquez brièvement le report" />
			</div>
		{/if}
		<p class="text-sm text-gray-600">* champs requis</p>
	{:else}
		<Loader />
	{/if}
</ActionConfirm>
