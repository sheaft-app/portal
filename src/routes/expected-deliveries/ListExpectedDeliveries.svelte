<script>
	import { faCheck, faFileExport, faCalendarCheck, faPlus, faHistory } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_PENDING_DELIVERIES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import ExpectedDeliveriesRoutes from "./routes";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{ name: "Reference" },
		{ name: "Producteur" },
		{ name: "Planifiée le", sortLabel: "scheduledOn" },
		{ name: "Commandes" },
	];

	const onRowClick = (item) => {
		routerInstance.goTo(ExpectedDeliveriesRoutes.Details, { id: item.id });
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(ExpectedDeliveriesRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Livraisons à réceptionner" />
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={delivery}
			graphQuery={GET_PENDING_DELIVERIES}
			noResultsPage={ExpectedDeliveriesRoutes.NoResults}
			loadingMessage="Chargement de vos livraisons à réceptionner en cours."
			defaultSearchValues={ExpectedDeliveriesRoutes.List.Params.Query}
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
					{delivery.producer.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(delivery.scheduledOn), "P", { locale: fr })}
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
