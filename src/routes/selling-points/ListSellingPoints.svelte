<script>
	import DeliveryKind from "./../../enums/DeliveryKind.js";
	import { GET_SELLING_POINTS } from "./queries";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import SellingPointRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import ConfigureYearlyClosings from "../../components/ConfigureYearlyClosings.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;

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

<TransitionWrapper>
	<PageHeader name="Mes points de vente" />
	<PageBody {errorsHandler}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			graphQuery={GET_SELLING_POINTS}
			{errorsHandler}
			noResultsPage={SellingPointRoutes.NoResultsPage}
			loadingMessage="Chargement de vos points de vente en cours... veuillez patienter."
			{onRowClick}
			getRowBackgroundColor={(i) => (!i.available ? "bg-orange-200" : "")}
			headers={[{ name: "Nom" }, { name: "Adresse" }, { name: "Type" }]}
			let:rowItem={sellingPoint}
		>
			<div slot="globalActions" class="px-2 md:px-6 py-3 border-b border-gray-200">
				<ConfigureYearlyClosings />
			</div>
			<td
				class="px-2 md:px-6 py-4 whitespace-no-wrap border-b
				border-gray-200"
			>
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{sellingPoint.name}
				</div>
			</td>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
				{#if sellingPoint.address}
					<div class="text-sm leading-5">
						{sellingPoint.address.zipcode}
						{sellingPoint.address.city}
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
	</PageBody>
</TransitionWrapper>
