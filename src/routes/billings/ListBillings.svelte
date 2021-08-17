<script>
	import { faCheck, faFileExport, faCalendarCheck, faPlus, faHistory, faArchive } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_DELIVERIES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import MarkDeliveriesAsBilled from "./MarkDeliveriesAsBilled.svelte";
	import ExportTimeRangeAccounting from "./ExportTimeRangeAccounting.svelte";
	import ExportSelectedAccountings from "./ExportSelectedAccountings.svelte";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import BillingRoutes from "./routes";
	import MarkTimeRangeDeliveriesAsBilled from "./MarkTimeRangeDeliveriesAsBilled.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{ name: "Reference" },
		{ name: "Client" },
		{ name: "Livrée le", sortLabel: "deliveredOn" },
		{ name: "Commandes" },
	];

	const onRowClick = (item) => {
		routerInstance.goTo(BillingRoutes.Details, { id: item.id });
	};

	const markSelectionAsBilled = () => {
		open(MarkDeliveriesAsBilled, {
			deliveries: selectedItems,
			onClose: (res) => {
				if (res.success) {
					routerInstance.refresh();
					selectedItems = [];
				}
			},
		});
	};

	const markTimeRangeAsBilled = () => {
		open(MarkTimeRangeDeliveriesAsBilled, {
			onClose: (res) => {
				if (res.success) 
					routerInstance.refresh();
			},
		});
	};

	const exportTimeRange = () => {
		open(ExportTimeRangeAccounting);
	};

	const exportSelectionToBill = () => {
		open(ExportSelectedAccountings, {
			deliveries: selectedItems,
			onClose: (res) => {
				if (res.success) selectedItems = [];
			},
		});
	};

	const canSelect = (selected) => {
		return selectedItems && selectedItems.length > 0 && selectedItems.filter((i) => i.billedOn).length === 0;
	};

	const canTimeRange = (selected) => {
		return items && items.length > 0 && (!selectedItems || selectedItems.length < 1);
	};

	$: actions = [
		{
			click: () => exportSelectionToBill(),
			disabled: !canSelect(selectedItems),
			text: "Exporter ces livraisons",
			icon: faFileExport,
			color: "teal",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => markSelectionAsBilled(),
			disabled: !canSelect(selectedItems),
			text: "Archiver ces livraisons",
			icon: faArchive,
			color: "green",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => exportTimeRange(),
			disabled: !canTimeRange(items, selectedItems),
			text: "Exporter",
			icon: faFileExport,
			color: "teal",
			hideIfDisabled: true,
		},
		{
			click: () => markTimeRangeAsBilled(),
			disabled: !canTimeRange(items, selectedItems),
			text: "Archiver",
			icon: faArchive,
			color: "green",
			hideIfDisabled: true,
		},
		{
			click: () => routerInstance.goTo(BillingRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Livraisons à facturer" />
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={delivery}
			graphQuery={GET_DELIVERIES}
			noResultsPage={BillingRoutes.NoResults}
			loadingMessage="Chargement de vos livraisons à facturer en cours."
			defaultSearchValues={BillingRoutes.List.Params.Query}
			disableRowSelection={(delivery) => delivery && delivery.billedOn}
			bind:selectedItems
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{delivery.reference}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{delivery.client.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(delivery.deliveredOn), "P", { locale: fr })}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{delivery.purchaseOrdersCount}
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
