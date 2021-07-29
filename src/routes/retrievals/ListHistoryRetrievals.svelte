<script>
	import { faCheck, faFileExport, faCalendarCheck, faPlus, faEye } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_COMPLETED_RETRIEVALS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import RetrievalRoutes from "./routes";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{ name: "Commande" },
		{ name: "Passée le" },
		{ name: "Client" },
		{ name: "Distribuée le", sortLabel: "deliveredOn" },
		{ name: "Lieu" },
	];

	const onRowClick = (item) => {
		routerInstance.goTo(RetrievalRoutes.Details, { id: item.id });
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(RetrievalRoutes.List),
			text: "Voir les commandes à distribuer",
			icon: faEye,
			color: "blue",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Commandes distribuées" />
	<PageBody {errorsHandler}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={retrieval}
			graphQuery={GET_COMPLETED_RETRIEVALS}
			noResultsPage={RetrievalRoutes.NoResults}
			loadingMessage="Chargement des commandes distribuées en cours."
			defaultSearchValues={RetrievalRoutes.List.Params.Query}
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{retrieval.purchaseOrders[0].reference}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(retrieval.purchaseOrders[0].createdOn), "P", { locale: fr })}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{retrieval.client.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(retrieval.deliveredOn), "P", { locale: fr })}
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
