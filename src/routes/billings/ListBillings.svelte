<script>
	import { faCheck, faFileExport, faCalendarCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_DELIVERIES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import AccountingRoutes from "./routes";
	import MarkDeliveriesAsBilled from "./MarkDeliveriesAsBilled.svelte";
	import ExportTimeRangeAccounting from "./ExportTimeRangeAccounting.svelte";
	import ExportSelectedAccountings from "./ExportSelectedAccountings.svelte";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

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
		routerInstance.goTo(AccountingRoutes.Details, { id: item.id });
	};

	const markAsBilled = () => {
		open(MarkDeliveriesAsBilled, {
			deliveries: selectedItems,
			onClose: (res) => {
				if (!res.success) routerInstance.reload();
			},
		});
	};

	const exportTimeRange = () => {
		open(ExportTimeRangeAccounting, {
			onClose: (res) => {
				if (!res.success) routerInstance.reload();
			},
		});
	};

	const exportToBill = () => {
		open(ExportSelectedAccountings, {
			deliveries: selectedItems,
			onClose: (res) => {
				if (!res.success) routerInstance.reload();
			},
		});
	};

	const canMarkAsBilled = (items) => {
		return items && items.length > 0 && items.filter((i) => i.billedOn).length === 0;
	};

	const canExportToBill = (items) => {
		return items && items.length > 0 && items.filter((i) => i.billedOn).length === 0;
	};

	const canExportTimeRange = (items) => {
		return !items || items.length < 1;
	};

	$: actions = [
		{
			click: () => markAsBilled(),
			disabled: !canMarkAsBilled(selectedItems),
			text: "Marquer comme facturée(s)",
			icon: faCheck,
			color: "green",
			displaySelectedItemsNumber: true,
		},
		{
			click: () => exportToBill(),
			disabled: !canExportToBill(selectedItems),
			text: "Exporter ces livraison(s)",
			icon: faFileExport,
			color: "blue",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => exportTimeRange(),
			disabled: !canExportTimeRange(selectedItems),
			text: "Exporter",
			icon: faFileExport,
			color: "blue",
			hideIfDisabled: true,
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Livraisons à facturer" />
	<PageBody {errorsHandler}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={delivery}
			graphQuery={GET_DELIVERIES}
			noResultsPage={AccountingRoutes.NoResults}
			loadingMessage="Chargement de vos livraisons à facturer en cours."
			defaultSearchValues={AccountingRoutes.List.Params.Query}
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
