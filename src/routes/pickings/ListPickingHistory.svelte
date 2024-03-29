<script>
	import { faClock } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Table from "../../components/table/Table.svelte";
	import Actions from "../../components/table/Actions.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import { GET_PICKINGS_HISTORY } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PickingStatus from "../../enums/PickingStatus";
	import PageBody from "../../components/PageBody.svelte";
	import PickingRoutes from "./routes";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;

	const headers = [{ name: "Préparation", sortLabel: "name" }, { name: "Débutée le" }, { name: "Terminée le" }];

	const actions = [
		{
			click: () => routerInstance.goTo(PickingRoutes.List),
			text: "Voir les préparations en cours",
			icon: faClock,
			color: "green",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Préparations terminées" />
	<PageBody {errorsHandler}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			defaultSearchValues={PickingRoutes.History.Params.Query}
			{errorsHandler}
			{headers}
			let:rowItem={picking}
			onRowClick={(item) => routerInstance.goTo(PickingRoutes.Summary, { id: item.id })}
			graphQuery={GET_PICKINGS_HISTORY}
			noResultsPage={PickingRoutes.NoResults}
			loadingMessage="Chargement de vos préparations terminées en cours."
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="leading-5 font-medium truncate">
					<div class="mb-1">
						<span class="rounded-full text-green-500 text-sm text-left">
							{PickingStatus.label(picking.status)}
						</span>
					</div>
					{picking.name}
					<p class="text-gray-600 text-sm lg:text-base ">
						Préparé : {picking.productsPreparedCount} / {picking.productsToPrepareCount}
					</p>
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<p>{format(new Date(picking.startedOn), "PPPP", { locale: fr })}</p>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<p>{format(new Date(picking.completedOn), "PPPP", { locale: fr })}</p>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
