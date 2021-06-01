<script>
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Table from "../../components/table/Table.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import { GET_CATALOGS } from "./queries";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import CatalogKind from "../../enums/CatalogKind";
	import PageBody from "../../components/PageBody.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import Actions from "../../components/table/Actions.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = false;

	const headers = [{ name: "Nom" }, { name: "Visible par" }, { name: "Statut" }, { name: "Nombre de produits" }];

	const onRowClick = (item) => {
		routerInstance.goTo(CatalogRoutes.Details, { id: item.id });
	};

	const actions = [
		{
			click: () => routerInstance.goTo(CatalogRoutes.Create),
			text: "Créer un catalogue",
			icon: faPlus,
			color: "green",
		},
	];

</script>

<TransitionWrapper>
	<PageHeader name="Mes catalogues" />
	<PageBody {errorsHandler} {noResults} noResultsPage={CatalogRoutes.NoResults}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			loadingMessage="Récupération des catalogues en cours... veuillez patienter"
			{errorsHandler}
			{headers}
			let:rowItem={catalog}
			graphQuery={GET_CATALOGS}
			defaultSearchValues={CatalogRoutes.List.Params.Query}
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{catalog.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5">
					{CatalogKind.label(catalog.kind)}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5">
					{catalog.available ? "Actif" : "Inactif"}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5">{catalog.productsCount}</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
