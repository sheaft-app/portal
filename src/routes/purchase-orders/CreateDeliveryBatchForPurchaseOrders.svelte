<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CREATE_DELIVERY_BATCH } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_ORDERS } from "./queries";
	import { getContext, onMount } from "svelte";
	import DeliveryBatchesRoutes from "../delivery-batches/routes";

	export let onClose, close, purchaseOrders;

	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let isLoading = false;
	let deliveries = [];
	let selectedDelivery = {
		name: null,
		from: null,
		expectedDeliveryDate: new Date(),
	};

	$: isValid = selectedDelivery.from && selectedDelivery.expectedDeliveryDate && Object.keys(deliveries).length > 0;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_DELIVERY_BATCH,
			variables: {
				from: `PT${selectedDelivery.from?.split(":")[0]}H`,
				name: selectedDelivery.name,
				scheduledOn: new Date(selectedDelivery.expectedDeliveryDate),
				deliveries: Object.keys(deliveries).map((c, index) => ({
					clientId: c,
					purchaseOrderIds: deliveries[c].map((p) => p.id),
					position: index,
				})),
			},
			success: async (res) => await routerInstance.goTo(DeliveryBatchesRoutes.Edit, { id: res.id }),
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
		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4" for="date">Prévue le *</label>
		<input
			bind:value={selectedDelivery.expectedDeliveryDate}
			class="appearance-none block w-full text-gray-700 border input-bg-clr
			rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
			focus:shadow-outline-green focus:bg-white"
			id="date"
			type="date"
		/>
		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4" for="time">A partir de *</label>
		<input
			bind:value={selectedDelivery.from}
			class="appearance-none block w-full text-gray-700 border input-bg-clr
			rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
			focus:shadow-outline-green focus:bg-white"
			id="time"
			type="time"
		/>
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
