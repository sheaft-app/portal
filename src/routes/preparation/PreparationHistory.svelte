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
	import PreparationRoutes from "./routes";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;

	const headers = [{ name: "Préparation", sortLabel: "name" }, { name: "Débutée à" }];

	const actions = [
		{
			click: () => routerInstance.goTo(PreparationRoutes.List),
			text: "Voir préparations en cours",
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
			defaultSearchValues={PreparationRoutes.History.Params.Query}
			{errorsHandler}
			{headers}
			let:rowItem={preparation}
			onRowClick={(item) => routerInstance.goTo(PreparationRoutes.Summary, { id: item.id })}
			graphQuery={GET_PICKINGS_HISTORY}
			noResultsPage={PreparationRoutes.NoResults}
			loadingMessage="Chargement de vos préparations terminées en cours."
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="leading-5 font-medium truncate" style="max-width: 180px;">
					<div class="mb-1">
						<span class="rounded-full text-green-500 text-sm text-left">
							{PickingStatus.label(preparation.status)}
						</span>
					</div>
					{preparation.name}
					<p class="text-gray-600 text-sm lg:text-base ">
						Préparé : {preparation.productsPreparedCount} / {preparation.productsToPrepareCount}
					</p>
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<p>{format(new Date(preparation.startedOn), "PPPP", { locale: fr })}</p>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
