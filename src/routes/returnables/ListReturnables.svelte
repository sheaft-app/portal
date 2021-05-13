<script>
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_RETURNABLES } from "./queries";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import { formatMoney } from "./../../helpers/app";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;

	const headers = [
		{ name: "Nom", sortLabel: "name" },
		{ name: "Prix HT" },
		{ name: "TVA" },
		{ name: "Prix TTC" },
	];

	const getRowBackgroundColor = (item) => {
		return "";
	};

	const onRowClick = (item) => {
		routerInstance.goTo(ReturnableRoutes.Details, { id: item.id });
	};

	const actions = [
		{
			click: () => routerInstance.goTo(ReturnableRoutes.Create),
			text: "Ajouter une consigne",
			icon: faPlus,
			color: "green",
		},
	];
</script>

<svelte:head>
	<title>Mes consignes</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
    <h1 class="font-semibold uppercase mb-0">Consignes</h1>
    <span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>
	{#if !noResults}
		<Actions {actions} />
	{/if}
	<Table
		bind:items
		bind:isLoading
		bind:noResults
		{errorsHandler}
		{headers}
		let:rowItem={returnable}
		graphQuery={GET_RETURNABLES}
		defaultSearchValues={ReturnableRoutes.List.Params.Query}
		{getRowBackgroundColor}
		{onRowClick}>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
			<div
				class="text-sm leading-5 font-medium truncate"
				style="max-width: 180px;">
				{returnable.name}
			</div>
		</td>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{formatMoney(returnable.wholeSalePrice)}</div>
		</td>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{returnable.vat}%</div>
		</td>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{formatMoney(returnable.onSalePrice)}</div>
		</td>
	</Table>
	{#if noResults}
		<div class="text-xl text-gray-600">
			<p class="mb-3">Vous n'avez pas encore de consignes.</p>
			<button
				on:click={() => routerInstance.goTo(ReturnableRoutes.Create)}
				class="btn btn-lg btn-accent justify-center">
				Créer une consigne
		</button>
		</div>
	{/if}
</TransitionWrapper>
