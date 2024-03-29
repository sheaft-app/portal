<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { GET_COMPLETED_ORDERS, GET_DELIVERY_BATCHES } from "./queries.js";
	import { CREATE_DELIVERY_BATCH } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { getContext, onMount } from "svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import Loader from "../../components/Loader.svelte";
	import DatePickerWrapper from "../../components/controls/DatePickerWrapper.svelte";
	import groupBy from "lodash/groupBy";
	import uniqBy from "lodash/uniqBy";
	import TimePicker from "../../components/controls/TimePicker.svelte";
	import { timeSpanToTime } from "../../helpers/app";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	export let close,
		selectedItems = [];

	let isLoading = false;
	let purchaseOrders = [];
	let selectedIds = selectedItems.map((s) => s.id);
	let name = "";
	let scheduledOn = null;
	let from = { hours: null, minutes: null };

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_COMPLETED_ORDERS,
			success: (res) => {
				purchaseOrders = uniqBy(
					res.data.map((po) => {
						if (selectedIds.includes(po.id)) return { ...po, selected: true };
						return { ...po };
					}),
					(x) => x.id
				);

				purchaseOrders.map((po) => {
					let expectedDate = new Date(po.expectedDelivery.expectedDeliveryDate);
					if (!scheduledOn || expectedDate < scheduledOn) {
						scheduledOn = expectedDate;

						let timespan = timeSpanToTime(po.expectedDelivery.from);
						from.hours = timespan.hours;
						from.minutes = timespan.minutes;
					}

					return po;
				});

				purchaseOrders.map((po) => {
					let date = new Date(po.expectedDelivery.expectedDeliveryDate);

					if (
						date.getDate() == scheduledOn.getDate() &&
						date.getMonth() == scheduledOn.getMonth() &&
						date.getFullYear() == scheduledOn.getFullYear() &&
						!po.selected
					) {
						po.selected = true;
						selectedIds = [...selectedIds, po.id];
					}

					return po;
				});

				name = `Livraison du ${format(scheduledOn, "P", {
					locale: fr,
				})}`;
			},
			errorsHandler,
			errorNotification: "Impossible de charger les commandes en attente de livraison",
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_DELIVERY_BATCH,
			variables: {
				from: `PT${from.hours}H${from.minutes ? `${from.minutes}M` : ""}`,
				name: name,
				scheduledOn: scheduledOn,
				setAsReady: false,
				deliveries: getClientPurchaseOrders(purchaseOrders),
			},
			success: async (res) => {
				routerInstance.refresh();
				close();
			},
			errorsHandler,
			errorNotification: "Impossible de programmer la livraison",
			clearCache: [GET_COMPLETED_ORDERS, GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};

	const getClientPurchaseOrders = (items) => {
		let selected = items.filter((i) => i.selected);
		let grouped = groupBy(selected, (x) => x.sender.id);
		return Object.keys(grouped).map((clientId) => ({
			clientId: clientId,
			purchaseOrderIds: grouped[clientId].map((po) => po.id),
		}));
	};

	const toggleAll = () => {
		let checked = !allSelected;
		purchaseOrders = purchaseOrders.map((p) => ({
			...p,
			selected: checked,
		}));
	};

	$: allSelected = purchaseOrders.filter((p) => !p.selected).length === 0;
	$: isValid =
		purchaseOrders &&
		purchaseOrders.filter((s) => s.selected).length > 0 &&
		name &&
		name.length > 0 &&
		scheduledOn &&
		from &&
		from.hours !== null &&
		from.minutes !== null;
</script>

<ActionConfirm
	{errorsHandler}
	title="Programmer une livraison"
	{isLoading}
	{close}
	valid={isValid}
	submit={handleSubmit}
	submitText="Programmer"
	closeText="Annuler"
>
	{#if isLoading}
		<Loader />
	{:else if purchaseOrders && purchaseOrders.length > 0}
		<div class="form-control w-full my-3 text-left">
			<label for="name">Nom</label>
			<input bind:value={name} id="name" type="text" placeholder="Donnez un nom à votre livraison (optionnel)" />
		</div>
		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4 text-left">Prévue le *</label>
		<DatePickerWrapper bind:selected={scheduledOn} dateChosen={scheduledOn != null} />
		<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4 text-left">A partir de *</label
		>
		<TimePicker bind:time={from} />
		<div class="form-control w-full mt-4" style="margin-bottom: 0">
			<label>Commandes disponibles *</label>
		</div>
		<table>
			<thead>
				<tr class="bg-white">
					<th
						class="px-3 md:px-6 py-3 border-b border-gray-300
							text-left text-xs leading-4 font-medium text-gray-500 uppercase
							tracking-wider"
						on:click={() => toggleAll()}
					>
						<InputCheckbox checked={allSelected} />
					</th>
					<th
						class="px-3 md:px-6 py-3 border-b border-gray-300
							text-left text-xs leading-4 font-medium text-gray-500 uppercase
							tracking-wider">Commande</th
					>
					<th
						class="px-3 md:px-6 py-3 border-b border-gray-300
							text-left text-xs leading-4 font-medium text-gray-500 uppercase
							tracking-wider">Date livraison</th
					>
					<th
						class="px-3 md:px-6 py-3 border-b border-gray-300
							text-left text-xs leading-4 font-medium text-gray-500 uppercase
							tracking-wider hidden md:table-cell">Produits</th
					>
				</tr>
			</thead>
			<tbody>
				{#each purchaseOrders as purchaseOrder}
					<tr
						class=" cursor-pointer ripple border-b
							border-gray-200"
						on:click={() => (purchaseOrder.selected = !purchaseOrder.selected)}
					>
						<td
							class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200"><InputCheckbox checked={purchaseOrder.selected} /></td
						><td
							class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200"
						>
							<p>{purchaseOrder.sender.name}</p>
							<small>{purchaseOrder.reference}</small>
						</td>
						<td
							class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200 hidden"
							>{format(new Date(purchaseOrder.expectedDelivery.expectedDeliveryDate), "PPPP", {
								locale: fr,
							})}</td
						>
						<td
							class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200 md:table-cell"
							>{format(new Date(purchaseOrder.expectedDelivery.expectedDeliveryDate), "P", {
								locale: fr,
							})}</td
						>
						<td
							class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200 hidden md:table-cell">{purchaseOrder.productsCount}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
		<p class="mt-5">Vous pourrez par la suite joindre d'autres commandes à cette livraison si nécessaire.</p>
	{:else}
		<p>Aucune commande n'est en attente de livraison.</p>
	{/if}
</ActionConfirm>