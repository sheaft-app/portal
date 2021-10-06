<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CREATE_DELIVERY_BATCH } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_ORDERS } from "./queries";
	import { getContext, onMount } from "svelte";
	import DeliveryBatchesRoutes from "../delivery-batches/routes";
	import DatePickerWrapper from "../../components/controls/DatePickerWrapper.svelte";
	import TimePicker from "../../components/controls/TimePicker.svelte";

	export let onClose, close, purchaseOrders;

	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let isLoading = false;
	let deliveries = [];
	let selectedDelivery = {
		name: null,
		from: { hours: null, minutes: null },
		expectedDeliveryDate: new Date(),
	};

	$: isValid = selectedDelivery.from && selectedDelivery.expectedDeliveryDate && Object.keys(deliveries).length > 0;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_DELIVERY_BATCH,
			variables: {
				from: `PT${selectedDelivery.from.hours ?? 0}H${selectedDelivery.from.minutes ?? 0}M`,
				name: selectedDelivery.name,
				setAsReady: false,
				scheduledOn: new Date(selectedDelivery.expectedDeliveryDate),
				deliveries: Object.keys(deliveries).map((c, index) => ({
					clientId: c,
					purchaseOrderIds: deliveries[c].map((p) => p.id),
					position: index,
				})),
			},
			success: async (res) => await routerInstance.goTo(DeliveryBatchesRoutes.List),
			errorsHandler,
			errorNotification: "Impossible de programmer la livraison",
			clearCache: [GET_ORDERS],
		});
	};

	const handleClose = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	};

	onMount(() => {
		for (let i = 0; i < purchaseOrders.length; i++) {
			let purchaseOrder = purchaseOrders[i];
			if (!deliveries[purchaseOrder.sender.id]) deliveries[purchaseOrder.sender.id] = [purchaseOrder];
			else deliveries[purchaseOrder.sender.id] = [...deliveries[purchaseOrder.sender.id], purchaseOrder];
		}
	});
</script>

<ActionConfirm
	{errorsHandler}
	title={purchaseOrders.length > 1
		? "Planifier la livraison de ces commandes"
		: "Planifier la livraison de cette commande"}
	submit={handleSubmit}
	submitText="Valider"
	closeText="Annuler"
	icon={faCheck}
	{isLoading}
	{close}
	valid={isValid}
>
	<p class="leading-5">Livraison</p>
	<form class="mt-2">
		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4">Prévue le *</label>
		<DatePickerWrapper bind:selected={selectedDelivery.expectedDeliveryDate} dateChosen={false} />
		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4">A partir de *</label>
		<TimePicker bind:time={selectedDelivery.from} />
		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4" for="name">Nom</label>
		<input
			bind:value={selectedDelivery.name}
			class="appearance-none block w-full text-gray-700 border input-bg-clr
			rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
			focus:shadow-outline-green focus:bg-white"
			id="name"
			type="text"
			placeholder="Nom d'affichage (optionnel)"
		/>
	</form>
</ActionConfirm>
