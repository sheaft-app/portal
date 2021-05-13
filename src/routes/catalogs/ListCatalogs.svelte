<script>
	import {faPlus} from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Table from "../../components/table/Table.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import {GET_CATALOGS} from "./queries";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import CatalogKind from "../../enums/CatalogKind";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = false;
	let selectedItems = [];

	const headers = [
		{name: "Nom"},
		{name: "Cible"},
		{name: "Statut"},
		{name: "Nombre de produits"},
	];

	const getRowBackgroundColor = (item) => {
		return "";
	};

	const onRowClick = (item) => {
		routerInstance.goTo(CatalogRoutes.Details, {id: item.id});
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(CatalogRoutes.Create),
			text: "Créer un catalogue",
			icon: faPlus,
			color: "green",
		},
	];
</script>

<TransitionWrapper>
	<PageBody {errorsHandler} {actions} {noResults} noResultsPage={CatalogRoutes.NoResults}>
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={catalog}
			graphQuery={GET_CATALOGS}
			defaultSearchValues={CatalogRoutes.List.Params.Query}
			{getRowBackgroundColor}
			{onRowClick}>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div
					class="text-sm leading-5 font-medium truncate"
					style="max-width: 180px;">
					{catalog.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5">
					{CatalogKind.label(catalog.kind)}</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5">
					{catalog.available ? 'Actif' : 'Inactif'}</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5">{catalog.productsCount}</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
