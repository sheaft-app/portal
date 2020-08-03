<script>
	import DeliveryKind from './../../enums/DeliveryKind.js';
	import { GET_SELLING_POINTS } from "./queries";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Loader from './../../components/Loader.svelte';
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import SellingPointRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import { 
		faPlus
	} from "@fortawesome/free-solid-svg-icons";

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;
	let sellingPoints = [];

	const actions = [
		{
			click: () => routerInstance.goTo(SellingPointRoutes.Create),
			text: "Ajouter un point de vente",
			icon: faPlus,
			color: "green",
		},
	];

	const onRowClick = (item) => {
		routerInstance.goTo(SellingPointRoutes.Details, { id: item.id });
	};
</script>

<svelte:head>
  <title>Mes points de vente</title>
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
		graphQuery={GET_SELLING_POINTS}
		{errorsHandler}
		{onRowClick}
		headers={[{ name: 'Nom' }, { name: 'Adresse' }, { name: 'Type' }]}
		let:rowItem={sellingPoint}
	>
			<td
				class="px-2 md:px-6 py-4 whitespace-no-wrap border-b
				border-gray-200">
				<div
				class="text-sm leading-5 font-medium truncate"
				style="max-width: 180px;">
				{sellingPoint.name}
				</div>
			</td>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
				{#if sellingPoint.address}
					<div class="text-sm leading-5">
							{sellingPoint.address.zipcode} {sellingPoint.address.city}
					</div>
					<div class="text-sm leading-5">
							{sellingPoint.address.line1}
					</div>
				{/if}
			</td>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5">
						{DeliveryKind.label(sellingPoint.kind)}
				</div>
			</td>
	</Table>

	{#if noResults}
		<div class="w-full h-full flex justify-center">
			<div class="text-center text-xl text-gray-600 m-auto px-6">
				<p class="mb-3">Vous n'avez pas encore de point de vente direct.</p>
				<div class="flex flex-wrap mb-5 justify-center w-full flex-col-reverse md:flex-row">
					<a
						class="btn btn-lg btn-accent justify-center"
						href="javascript:void(0)"
						on:click={() => routerInstance.goTo(SellingPointRoutes.Create)}
						>
						Créer un point de vente direct
					</a>
				</div>
			</div>
		</div>
	{/if}
</TransitionWrapper>