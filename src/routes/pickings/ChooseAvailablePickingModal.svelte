<script>
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_ACCEPTED_ORDERS, GET_PICKINGS } from "./queries.js";
	import { CREATE_PICKING } from "./mutations.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import { getContext, onMount } from "svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import PickingRoutes from "./routes";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import Loader from "../../components/Loader.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	export let close,
		selectedItems = [];

	let isLoading = false;
	let purchaseOrders = [];
	let selectedIds = selectedItems.map((s) => s.id);
	let name = `Préparation du ${format(new Date(), "P", {
		locale: fr,
	})}`;

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_ACCEPTED_ORDERS,
			success: (res) => {
				purchaseOrders = res.data.map((po) => {
					if (selectedIds.includes(po.id)) return { ...po, selected: true };
					else return po;
				});
			},
			errorsHandler,
			errorNotification: "Impossible de charger les commandes en attente de préparation",
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_PICKING,
			variables: {
				name: name,
				autostart: true,
				purchaseOrderIds: purchaseOrders.filter((s) => s.selected).map((s) => s.id),
			},
			success: async (res) => await routerInstance.goTo(PickingRoutes.Process, { id: res.id }),
			errorsHandler,
			errorNotification: "Impossible de créer la préparation",
			clearCache: [GET_ACCEPTED_ORDERS, GET_PICKINGS],
		});
		isLoading = false;
	};

	const toggleAll = () => {
		let checked = !allSelected;
		purchaseOrders = purchaseOrders.map((p) => ({
			...p,
			selected: checked,
		}));
	};

	$: allSelected = purchaseOrders.filter((p) => !p.selected).length === 0;
	$: isValid = purchaseOrders && purchaseOrders.filter((s) => s.selected).length > 0 && name && name.length > 0;
</script>

<ActionConfirm
	{errorsHandler}
	title="Créer une préparation"
	{isLoading}
	{close}
	valid={isValid}
	submit={handleSubmit}
	submitText="Préparer"
	closeText="Annuler"
>
	{#if isLoading}
		<Loader />
	{:else if purchaseOrders && purchaseOrders.length > 0}
		<div class="form-control w-full my-3">
			<label for="name">Nom</label>
			<input bind:value={name} id="name" type="text" placeholder="Donnez un nom à votre préparation (optionnel)" />
		</div>
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
							>{format(new Date(purchaseOrder.expectedDelivery.expectedDeliveryDate), "PPPP", { locale: fr })}</td
						>
						<td
							class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200 md:table-cell"
							>{format(new Date(purchaseOrder.expectedDelivery.expectedDeliveryDate), "P", { locale: fr })}</td
						>
						<td
							class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200 hidden md:table-cell">{purchaseOrder.productsCount}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
		<p class="mt-5">Vous pourrez par la suite joindre d'autres commandes à cette préparation si nécessaire.</p>
	{:else}
		<p>Aucune commande n'est en attente de préparation.</p>
	{/if}
</ActionConfirm>
