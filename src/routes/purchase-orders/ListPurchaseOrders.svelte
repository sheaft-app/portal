<script>
	import { onMount, getContext } from "svelte";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import { fr } from "date-fns/locale";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetAuthInstance from "./../../services/SheaftAuth";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import PurchaseOrderRoutes from "./routes";
	import OrderStatusKind from "./../../enums/OrderStatusKind";
	import DeliveryKind from "./../../enums/DeliveryKind";
	import CreatePickingOrders from "./CreatePickingOrders.svelte";
	import AcceptPurchaseOrders from "./AcceptPurchaseOrders.svelte";
	import RefusePurchaseOrders from "./RefusePurchaseOrders.svelte";
	import CancelPurchaseOrders from "./CancelPurchaseOrders.svelte";
	import ProcessPurchaseOrders from "./ProcessPurchaseOrders.svelte";
	import CompletePurchaseOrders from "./CompletePurchaseOrders.svelte";
	import DeliverPurchaseOrders from "./DeliverPurchaseOrders.svelte";
	import {
		canCreatePickingOrders,
		canCancelOrders,
		canAcceptOrders,
		canRefuseOrders,
		canProcessOrders,
		canCompleteOrders,
		canDeliverOrders,
		canShipOrders,
	} from "./validators";
	import { formatMoney } from "./../../helpers/app";
	import {
		GET_ORDERS,
		HAS_PICKING_ORDERS_EXPORT_INPROGRESS,
	} from "./queries.js";
	import {
		faTimes,
		faBackspace,
		faCheckDouble,
		faCheck,
		faClipboardCheck,
		faTruckLoading,
		faPlay,
		faCircleNotch,
		faClock,
		faCalendarAlt,
		faFileImport,
		faFileExport,
		faMapMarkerAlt
	} from "@fortawesome/free-solid-svg-icons";
	import JobRoutes from "../jobs/routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";

	const errorsHandler = new SheaftErrors();
	const authInstance = GetAuthInstance();
	const routerInstance = GetRouterInstance();
	const graphQLInstance = GetGraphQLInstance();
	const { open } = getContext("modal");

	const headers = [
		{ name: "Commande", sortLabel: "reference" },
		{ name: "Panier" },
		{ name: "Livraison/Récupération", displayOn: "md" },
		{ name: "Statut", displayOn: "md" },
		{ name: "Passée le", displayOn: "md", sortLabel: "createdOn" },
	];

	let selectedItems = [];
	let items = [];
	let isLoading = true;
	let hasPendingJobs = false;
	let noResults = false;

	const checkHasExportInProgress = async () => {
		var res = await graphQLInstance.query(
			HAS_PICKING_ORDERS_EXPORT_INPROGRESS,
			null,
			errorsHandler.Uuid
		);
		if (!res.success) {
			hasPendingJobs = false;
		}

		hasPendingJobs = res.data;
	};

	onMount(async () => {
		await checkHasExportInProgress();
	});

	const createPickingOrder = async () => {
		handleOrdersModal(CreatePickingOrders);
		await checkHasExportInProgress();
	};

	const cancelOrders = () => {
		handleOrdersModal(CancelPurchaseOrders);
	};

	const refuseOrders = () => {
		handleOrdersModal(RefusePurchaseOrders);
	};

	const acceptOrders = () => {
		handleOrdersModal(AcceptPurchaseOrders);
	};

	const processOrders = () => {
		handleOrdersModal(ProcessPurchaseOrders);
	};

	const completeOrders = () => {
		handleOrdersModal(CompletePurchaseOrders);
	};

	const deliverOrders = () => {
		handleOrdersModal(DeliverPurchaseOrders);
	};

	const handleOrdersModal = (modal) => {
		open(modal, {
			purchaseOrders: selectedItems,
			onClose: async (res) => {
				if (res.success) {
					routerInstance.refresh();
					selectedItems = [];
				}
			},
		});
	};

	const getRowBackgroundColor = (item) => {
		return "";
	};

	const onRowClick = (item) => {
		routerInstance.goTo(PurchaseOrderRoutes.Details, { id: item.id });
	};

	$: hasSelectedOneItem =
		canCancelOrders(selectedItems) ||
		canProcessOrders(selectedItems) ||
		canRefuseOrders(selectedItems) ||
		canAcceptOrders(selectedItems) ||
		canShipOrders(selectedItems) ||
		canDeliverOrders(selectedItems) ||
		canCreatePickingOrders(selectedItems) ||
		canCompleteOrders(selectedItems);

	$: actions = [
		{
			click: () => acceptOrders(),
			disabled: !canAcceptOrders(selectedItems),
			icon: faCheck,
			text: "Accepter",
			color: "green",
		},
		{
			click: () => refuseOrders(),
			disabled: !canRefuseOrders(selectedItems),
			icon: faTimes,
			text: "Refuser",
			color: "red",
		},
		{
			click: () => cancelOrders(),
			disabled: !canCancelOrders(selectedItems),
			icon: faBackspace,
			text: "Annuler",
			color: "orange",
		},
		{
			click: () => processOrders(),
			disabled: !canProcessOrders(selectedItems),
			icon: faPlay,
			text: "Démarrer la préparation",
			color: "green",
			hideIfDisabled: true
		},
		{
			click: () => completeOrders(),
			disabled: !canCompleteOrders(selectedItems),
			icon: faClipboardCheck,
			text: "Terminer la préparation",
			color: "green",
			hideIfDisabled: true
		},
		{
			click: () => createPickingOrder(),
			disabled: !canCreatePickingOrders(selectedItems),
			icon: faFileExport,
			text: "Accepter et faire un bon de préparation",
			color: "indigo",
			hideIfDisabled: true
		},
		{
			click: () => deliverOrders(),
			disabled: !canDeliverOrders(selectedItems),
			icon: faTruckLoading,
			text: "Marquer comme livrées",
			color: "teal",
			hideIfDisabled: true
		},
	];
</script>

<svelte:head>
	<title>Commandes</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if hasPendingJobs}
		<div
			class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 bg-white
			text-gray-600 shadow rounded mb-5">
			<div class="flex">
				<Icon data={faCircleNotch} spin scale="1.3" class="mr-5" />
				<div>
					<p class="uppercase font-bold leading-none mb-2">
						Génération de bons de préparations
					</p>
					<p>
						Plusieurs bons de préparations sont en train d'être générés. Nous
						vous informerons quand ce sera terminé.
					</p>
					<div class="mt-2">
						<a
							href="javascript:void(0)"
							on:click={() => routerInstance.goTo(JobRoutes.List)}
							class="btn btn-large bg-white shadow font-semibold text-normal
							hover:bg-gray-100"
							style="width: fit-content;">
							Voir les tâches en cours
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}
	{#if !noResults}
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
	{/if}
	<Table
		let:rowItem={order}
		bind:items
		bind:noResults
		{headers}
		{isLoading}
		graphQuery={GET_ORDERS}
		{errorsHandler}
		defaultSearchValues={PurchaseOrderRoutes.List.Params.Query}
		bind:selectedItems
		disableRowSelection={(order) => order && (order.status == OrderStatusKind.Cancelled.Value || order.status == OrderStatusKind.Refused.Value)}
		{getRowBackgroundColor}
		{onRowClick}>
		<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-xs leading-5 font-semibold text-{OrderStatusKind.color(order.status)} block md:hidden">
				{OrderStatusKind.label(order.status)}
			</div>
			<div
				class="text-sm leading-5 font-medium text-gray-900 truncate"
				style="max-width: 180px;">
				{order.sender.name}
			</div>
			<div class="text-sm leading-5 text-gray-600">#{order.reference}</div>
		</td>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5 text-gray-900">
				{formatMoney(order.totalOnSalePrice)}
			</div>
			<div class="text-sm leading-5 text-gray-600">
				{order.productsCount} produits
			</div>
		</td>
		<td
			class="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden md:table-cell">
			{#if order.expectedDelivery.expectedDeliveryDate}
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class=" inline" />
						{format(
							new Date(order.expectedDelivery.expectedDeliveryDate),
							'PP',
							{
								locale: fr,
							}
						)}
					</p>
					<p class="text-gray-600">
						<Icon data={faMapMarkerAlt} scale=".8" class=" inline" />
						{DeliveryKind.label(order.expectedDelivery.kind)}
					</p>
				</div>
			{/if}
		</td>
		<td class="px-6 py-4 whitespace-no-wrap hidden md:table-cell">
			<span
				class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-{OrderStatusKind.color(order.status)}
				text-white">
				{OrderStatusKind.label(order.status)}
			</span>
		</td>
		<td
			class="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden md:table-cell">
			<div>
				<p>
					<Icon data={faCalendarAlt} scale=".8" class=" inline" />
					{format(new Date(order.createdOn), 'PP', { locale: fr })}
				</p>
				<p class="text-gray-600">
					<Icon data={faClock} scale=".8" class=" inline" />
					{format(new Date(order.createdOn), 'p', { locale: fr })}
				</p>
			</div>
		</td>
	</Table>

	{#if noResults}
		<div class="w-full h-full flex justify-center">
			<div class="text-center text-xl text-gray-600 m-auto px-6">
				<p>Aucune commande pour le moment.</p>
				<p class="mb-5">Ne vous en faites pas, ça ne va pas tarder !</p>
				<img
					src="/img/no_orders.svg"
					class="m-auto"
					style="width: 200px; height: auto"
					alt="Aucune commande ici" />
			</div>
		</div>
	{/if}
</TransitionWrapper>

<style lang="scss">
	tr {
		&:hover {
			box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0,
				0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
		}
	}

	/* Ripple effect */
	.ripple {
		background-position: center;
		transition: background 0.8s;

		&:hover {
			background: #f7fafc radial-gradient(circle, transparent 1%, #edf2f7 1%)
				center/15000%;
		}

		&:active {
			background-size: 100%;
			transition: background 0s;
		}
	}
</style>
