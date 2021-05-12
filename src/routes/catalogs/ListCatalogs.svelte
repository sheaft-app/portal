<script>
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Table from "../../components/table/Table.svelte";
	import Actions from "../../components/table/Actions.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import { GET_CATALOGS } from "./queries";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import { formatMoney } from "../../helpers/app";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{ name: "Nom" }
	];

	const getRowBackgroundColor = (item) => {
		return "";
	};

	const onRowClick = (item) => {
		routerInstance.goTo(CatalogRoutes.Details, { id: item.id });
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

<svelte:head>
	<title>Mes catalogues</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if !noResults}
		<Actions {actions} />
	{/if}
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
		<!-- <td class="px-3 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{formatMoney(catalog.productsCount)}</div>
		</td>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{catalog.isDefault}%</div>
		</td>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{formatMoney(returnable.onSalePrice)}</div>
		</td> -->
	</Table>
	{#if noResults}
		<div class="text-xl text-gray-600">
			<p class="mb-3">Vous n'avez pas encore de catalogue.</p>
			<button
				on:click={() => routerInstance.goTo(CatalogRoutes.Create)}
				class="btn btn-lg btn-accent justify-center">
				Créer mon premier catalogue
			</button>
		</div>
	{/if}
</TransitionWrapper>
