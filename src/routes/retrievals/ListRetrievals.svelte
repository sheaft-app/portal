<script>
	import { faCheck, faFileExport, faCalendarCheck, faPlus, faHistory } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_PENDING_RETRIEVALS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import RetrievalRoutes from "./routes";
	import ConfirmRetrievals from "./ConfirmRetrievals.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{ name: "Client" },
		{ name: "Commande" },
		{ name: "Récupération le", sortLabel: "scheduledOn" },
		{ name: "Lieu" },
	];

	const onRowClick = (item) => {
		routerInstance.goTo(RetrievalRoutes.Details, { id: item.id });
	};

	const confirmRetrieval = () => {
		open(ConfirmRetrievals, {
			retrievals: selectedItems,
			onClose: (res) => {
				if (res.success) routerInstance.refresh();
			},
		});
	};

	const canConfirmRetrieval = (items) => {
		return items && items.length > 0;
	};

	$: actions = [
		{
			click: () => confirmRetrieval(),
			disabled: !canConfirmRetrieval(selectedItems),
			text: "Marquer comme distribuée",
			icon: faCheck,
			color: "green",
			displaySelectedItemsNumber: true,
		},
		{
			click: () => routerInstance.goTo(RetrievalRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Commandes à distribuer" />
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={retrieval}
			graphQuery={GET_PENDING_RETRIEVALS}
			noResultsPage={RetrievalRoutes.NoResults}
			loadingMessage="Chargement de vos commandes à distribuer en cours."
			defaultSearchValues={RetrievalRoutes.List.Params.Query}
			bind:selectedItems
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{retrieval.client.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{retrieval.purchaseOrders[0].reference}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(retrieval.scheduledOn), "P", { locale: fr })}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					<p>{retrieval.address.line1}</p>
					{#if retrieval.address.line2}<p>{retrieval.address.line2}</p>{/if}
					<p>{retrieval.address.zipcode} {retrieval.address.city}</p>
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
