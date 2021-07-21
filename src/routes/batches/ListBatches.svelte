<script>
	import { faClock, faEye } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_BATCHES } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import BatchesRoutes from "./routes";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import Observations from "../../components/observations/Observations.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;

	const headers = [{ name: "Lot", sortLabel: "name" }, { name: "DLC/DDM" }];

	let displayObservationsPanel = false;

	const actions = [
		{
			click: () => displayObservationsPanel = true,
			text: "Voir la liste des observations",
			icon: faEye,
			color: "blue",
		},
	];
</script>


<TransitionWrapper>
	<PageHeader name="Traçabilité - Lots" />
	<PageBody {errorsHandler}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			defaultSearchValues={BatchesRoutes.List.Params.Query}
			{errorsHandler}
			{headers}
			let:rowItem={batch}
			onRowClick={(item) => routerInstance.goTo(BatchesRoutes.BatchDetails, { id: item.id })}
			graphQuery={GET_BATCHES}
			noResultsPage={BatchesRoutes.NoResults}
			loadingMessage="Chargement des lots..."
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="leading-5">
					<p class="font-medium">{batch.number}</p>
					<p class="text-gray-600">créé le {format(new Date(batch.createdOn), "PPPP", { locale: fr })}</p>
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				{#if batch.dlc}
					<p>{format(new Date(batch.dlc), "PPPP", { locale: fr })}</p>
				{/if}
				{#if batch.dluo}
					<p>{format(new Date(batch.ddm), "PPPP", { locale: fr })}</p>
				{/if}
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>

{#if displayObservationsPanel}
	<Observations 
		on:close={() => displayObservationsPanel = false}
	/>
{/if}