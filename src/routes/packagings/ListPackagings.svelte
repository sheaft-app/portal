<script>
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_PACKAGINGS } from "./queries";
	import PackagingRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	$: isLoading = true;
	let items = [];
	let selectedItems = [];

	const headers = [
		{ name: "Nom" },
		{ name: "Prix HT" },
		{ name: "TVA" },
		{ name: "Prix TTC" },
	];

	const getRowBackgroundColor = (item) => {
		return "";
	};

	const onRowClick = (item) => {
		routerInstance.goTo(PackagingRoutes.Details, { id: item.id });
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(PackagingRoutes.Create),
			text: "Ajouter une consigne",
			icon: faPlus,
			color: "green",
		},
	];

	$: displayNoResults = !isLoading && items.length < 1;
</script>

<svelte:head>
	<title>Mes consignes</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if !displayNoResults}
		<Actions {actions} />
	{/if}
	<Table
		bind:items
		bind:selectedItems
		{isLoading}
		{errorsHandler}
		{headers}
		let:rowItem={packaging}
		graphQuery={GET_PACKAGINGS}
		defaultSearchValues={PackagingRoutes.List.Params.Query}
		{getRowBackgroundColor}
		{onRowClick}>
		<td class="px-2 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
			<div
				class="text-sm leading-5 font-medium truncate"
				style="max-width: 180px;">
				{packaging.name}
			</div>
		</td>
		<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{packaging.wholeSalePrice}€</div>
		</td>
		<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{packaging.vat}%</div>
		</td>
		<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
			<div class="text-sm leading-5">{packaging.onSalePrice}€</div>
		</td>
	</Table>
	{#if displayNoResults}
		<div class="w-full h-full flex justify-center">
			<div class="text-center text-xl text-gray-600 m-auto px-6">
				<p class="mb-3">Vous n'avez pas encore de consignes.</p>
				<a
					href="javascript:void(0)"
					on:click={() => routerInstance.goTo(PackagingRoutes.Create)}
					class="btn btn-lg btn-accent justify-center">
					Créer une consigne
				</a>
			</div>
		</div>
	{/if}
</TransitionWrapper>
