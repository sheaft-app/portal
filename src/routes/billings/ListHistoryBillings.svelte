<script>
	import { faCheck, faFileExport, faCalendarCheck, faPlus, faEye } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_BILLED_DELIVERIES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import AccountingRoutes from "./routes";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import BillingRoutes from "./routes";

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
		{ name: "Facturée le", sortLabel: "billedOn" },
		{ name: "Livrée le", sortLabel: "deliveredOn" },
		{ name: "Commandes" },
	];

	const onRowClick = (item) => {
		routerInstance.goTo(AccountingRoutes.Details, { id: item.id });
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(BillingRoutes.List),
			text: "Voir les livraisons à facturer",
			icon: faEye,
			color: "blue",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Livraisons facturées" />
	<PageBody {errorsHandler}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={delivery}
			graphQuery={GET_BILLED_DELIVERIES}
			noResultsPage={AccountingRoutes.NoResults}
			loadingMessage="Chargement des livraisons facturées en cours."
			defaultSearchValues={AccountingRoutes.List.Params.Query}
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
					{format(new Date(delivery.billedOn), "P", { locale: fr })}
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
