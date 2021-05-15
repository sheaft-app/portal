<script>
	import {faPlus} from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import {GET_RETURNABLES} from "./queries";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import {formatMoney} from "./../../helpers/app";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{name: "Nom", sortLabel: "name"},
		{name: "Prix HT"},
		{name: "TVA"},
		{name: "Prix TTC"},
	];

	const getRowBackgroundColor = (item) => {
		return "";
	};

	const onRowClick = (item) => {
		routerInstance.goTo(ReturnableRoutes.Details, {id: item.id});
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(ReturnableRoutes.Create),
			text: "Ajouter une consigne",
			icon: faPlus,
			color: "green",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Mes consignes"/>
	<PageBody {errorsHandler}>
		<Actions {actions}/>
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={returnable}
			graphQuery={GET_RETURNABLES}
			noResultsPage={ReturnableRoutes.NoResults}
			loadingMessage="Chargement de vos consignes en cours... veuillez patienter."
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
	</PageBody>
</TransitionWrapper>
