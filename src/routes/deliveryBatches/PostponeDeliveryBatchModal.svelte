<script>
    import { getContext, onMount } from "svelte";
    import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_DELIVERY_BATCHES, GET_DELIVERY_BATCH_DETAILS } from "./queries";
	import { POSTPONE_DELIVERY_BATCH } from "./mutations";
	import DeliveryBatchesRoutes from "./routes";
    import { denormalizeDeliveryBatch } from "./deliveryBatchForm";
    import Loader from "../../components/Loader.svelte";
    import { faCheck } from "@fortawesome/free-solid-svg-icons";
    import SimpleStoreCard from "../deliveries/SimpleStoreCard.svelte";
    import GetRouterInstance from "../../services/SheaftRouter";
    import SheaftErrors from "../../services/SheaftErrors";
	import DatePickerWrapper from "./../../components/controls/DatePickerWrapper.svelte";
    import TimePicker from "../../components/controls/TimePicker.svelte";
    import { timeToTimeSpan, getIsoDate } from "../../helpers/app";

    export let id, close;

    const errorsHandler = new SheaftErrors();
    const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

    let isLoading = false;
    let deliveries = [];

    let reason, scheduledOn = new Date(), from = { hours: null, minutes: null };
    $: console.log(scheduledOn);

    // onMount(async () => {
	// 	isInitializing = true;
	// 	await query({
	// 		query: GET_DELIVERY_BATCH_DETAILS,
	// 		variables: { id },
	// 		errorsHandler,
	// 		success: (res) => (deliveries = denormalizeDeliveryBatch(res).deliveries),
	// 		error: () => close(),
	// 		errorNotification: "Impossible de récupérer les informations de la livraison.",
	// 	});
	// 	isInitializing = false;
    // });
    
    const submit = async () => {
        isLoading = true;

		await mutate({
			mutation: POSTPONE_DELIVERY_BATCH,
			variables: { id, reason, scheduledOn: getIsoDate(scheduledOn), from: timeToTimeSpan(from) },
			errorsHandler,
			success: (res) => routerInstance.goTo(DeliveryBatchesRoutes.Edit, { id: res.id }),
			successNotification: "Livraison décalée avec succès !",
			errorNotification: "Impossible de décaler la livraison",
			clearCache: [GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Décaler la livraison"
	{submit}
	{isLoading}
    {close}
    valid={scheduledOn && from.hours >= 0 && from.minutes >= 0}
	submitText="Confirmer"
	icon={faCheck}
	closeText="Fermer"
>
    <div class="form-control" style="display:block;">
        <label>Reporté au *</label>
        <DatePickerWrapper bind:selected={scheduledOn} dateChosen={true} />
    </div>
	
    <div class="form-control" style="display:block;">
        <label>Heure de départ * </label>
        <TimePicker bind:time={from} />
    </div>


	<div class="form-control">
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold" for="reason">Raison </label>
        <input
            bind:value={reason}
            id="reason"
            type="text"
            placeholder="Expliquez brièvement le report"
        />
    </div>

    <p class="text-sm text-gray-600">* champs requis</p>
</ActionConfirm>