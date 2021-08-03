<script>
	import { onMount, getContext } from "svelte";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import PurchaseOrderRoutes from "./routes";
	import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";
	import DeliveryKind from "./../../enums/DeliveryKind";
	import AcceptPurchaseOrders from "./AcceptPurchaseOrders.svelte";
	import RefusePurchaseOrders from "./RefusePurchaseOrders.svelte";
	import CancelPurchaseOrders from "./CancelPurchaseOrders.svelte";
	import DeliverPurchaseOrders from "./DeliverPurchaseOrders.svelte";
	import ChooseAvailablePickingModal from "./../pickings/ChooseAvailablePickingModal.svelte";
	import CreateDeliveryBatchForPurchaseOrders from "./CreateDeliveryBatchForPurchaseOrders.svelte";
	import Select from "./../../components/controls/select/Select.js";
	import {
		canCancelOrders,
		canAcceptOrders,
		canRefuseOrders,
		canProcessOrders,
		canDeliverOrders,
		canShipOrder,
		canShipOrders,
	} from "./validators";
	import { formatMoney } from "./../../helpers/app";
	import { GET_ORDERS } from "./queries.js";
	import {
		faTimes,
		faBackspace,
		faCheck,
		faClipboardList,
		faTruckLoading,
		faCircleNotch,
		faClock,
		faCalendarAlt,
		faMapMarkerAlt,
		faPlus,
		faHistory,
	} from "@fortawesome/free-solid-svg-icons";
	import JobRoutes from "../jobs/routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import { toggleMoreActions } from "./../../stores/app";
	import JobKind from "../../enums/JobKind";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import RetrievalRoutes from "../retrievals/routes";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const { query } = getContext("api");

	const headers = [
		{ name: "Commande", sortLabel: "reference" },
		{ name: "Panier" },
		{ name: "Livraison/Distribution", displayOn: "md" },
		{ name: "Statut", displayOn: "md" },
		{ name: "Passée le", displayOn: "md", sortLabel: "createdOn" },
	];

	let selectedItems = [];
	let selectedStatus = null;
	let items = [];
	let isLoading = true;
	let hasPendingJobs = false;
	let noResults = false;

	$: routerInstance.replaceQueryParams({
		where: selectedStatus ? "status_in" : null,
		whereValues: selectedStatus ? selectedStatus.map((s) => s.value) : null,
	});

	const filterStatus = Object.entries(PurchaseOrderStatusKind)
		.map(([key, value]) => {
			if (value.List && value.Value && value.Label) {
				return {
					value: value.Value,
					label: value.Label,
				};
			}
		})
		.filter((p) => p);

	const newOrders = () => routerInstance.goTo(PurchaseOrderRoutes.Create);

	const cancelOrders = () => handleOrdersModal(CancelPurchaseOrders);

	const refuseOrders = () => handleOrdersModal(RefusePurchaseOrders);

	const acceptOrders = () => handleOrdersModal(AcceptPurchaseOrders);

	const processOrders = () => {
		open(ChooseAvailablePickingModal, {
			selectedItems: selectedItems,
		});
	};

	const deliverOrders = () => handleOrdersModal(DeliverPurchaseOrders);

	const shipOrders = () => handleOrdersModal(CreateDeliveryBatchForPurchaseOrders);

	const handleOrdersModal = (modal) =>
		open(modal, {
			purchaseOrders: selectedItems,
			onClose: (res) => {
				if (res.success) {
					routerInstance.refresh();
					toggleMoreActions.set(false);
					selectedItems = [];
				}
			},
		});

	const getRowBackgroundColor = (item) => "";

	const onRowClick = (item) => {
		routerInstance.goTo(PurchaseOrderRoutes.Details, { id: item.id });
	};

	$: actions = [
		{
			click: () => newOrders(),
			icon: faPlus,
			text: "Créer une commande",
			color: "green",
		},
		{
			click: () => acceptOrders(),
			disabled: !canAcceptOrders(selectedItems),
			icon: faCheck,
			text: "Accepter",
			color: "green",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => refuseOrders(),
			disabled: !canRefuseOrders(selectedItems),
			icon: faTimes,
			text: "Refuser",
			color: "red",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => cancelOrders(),
			disabled: !canCancelOrders(selectedItems),
			icon: faTimes,
			text: "Annuler",
			color: "orange",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => processOrders(),
			disabled: !canProcessOrders(selectedItems),
			icon: faClipboardList,
			text: "Préparer",
			color: "teal",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => deliverOrders(),
			disabled: !canDeliverOrders(selectedItems),
			icon: faTruckLoading,
			text: "Marquer comme distribuée(s)",
			color: "teal",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => shipOrders(),
			disabled: !canShipOrders(selectedItems),
			icon: faTruckLoading,
			text: "Planifier la livraison",
			color: "teal",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => routerInstance.goTo(PurchaseOrderRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Commandes en attente" />
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
		<Table
			let:rowItem={order}
			bind:items
			bind:noResults
			{headers}
			bind:isLoading
			graphQuery={GET_ORDERS}
			{errorsHandler}
			loadingMessage="Chargement de vos commandes en cours."
			defaultSearchValues={PurchaseOrderRoutes.List.Params.Query}
			bind:selectedItems
			disableRowSelection={(order) =>
				order &&
				(order.status === PurchaseOrderStatusKind.Cancelled.Value ||
					order.status === PurchaseOrderStatusKind.Refused.Value ||
					order.status === PurchaseOrderStatusKind.Withdrawned.Value ||
					order.status === PurchaseOrderStatusKind.Delivered.Value ||
					order.status === PurchaseOrderStatusKind.Expired.Value)}
			{getRowBackgroundColor}
			{onRowClick}
		>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
				<div
					class="text-xs leading-5 font-semibold text-{PurchaseOrderStatusKind.color(
						order.status
					)} block md:hidden"
				>
					{PurchaseOrderStatusKind.label(order.status)}
				</div>
				<div class="text-sm leading-5 font-medium text-gray-900 truncate" style="max-width: 180px;">
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
			<td class="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden md:table-cell">
				{#if order.expectedDelivery.expectedDeliveryDate}
					<div>
						<p>
							<Icon data={faCalendarAlt} scale=".8" class=" inline" />
							{format(new Date(order.expectedDelivery.expectedDeliveryDate), "PP", {
								locale: fr,
							})}
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
					class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full
				{order.status == PurchaseOrderStatusKind.Delivered.Value
						? `bg-white border border-green-500 text-green-500`
						: `bg-${PurchaseOrderStatusKind.color(order.status)} text-white`}"
				>
					{PurchaseOrderStatusKind.label(order.status)}
				</span>
			</td>
			<td class="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden md:table-cell">
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class=" inline" />
						{format(new Date(order.createdOn), "PP", { locale: fr })}
					</p>
					<p class="text-gray-600">
						<Icon data={faClock} scale=".8" class=" inline" />
						{format(new Date(order.createdOn), "p", { locale: fr })}
					</p>
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>

<style lang="scss">
	.themed {
		--cursor: pointer;
		--multiItemMargin: 5px 2px;
		--multiItemActiveBG: #ebedef;
		--multiItemDisabledHoverBg: #ebedef;
		--multiItemActiveColor: #205164;
		--borderFocusColor: rgba(160, 174, 192, 1);
	}

	tr {
		&:hover {
			box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60, 64, 67, 0.3),
				0 1px 3px 1px rgba(60, 64, 67, 0.15);
		}
	}

	/* Ripple effect */
	.ripple {
		background-position: center;
		transition: background 0.8s;

		&:hover {
			background: #f7fafc radial-gradient(circle, transparent 1%, #edf2f7 1%) center/15000%;
		}

		&:active {
			background-size: 100%;
			transition: background 0s;
		}
	}
</style>
