<script>
	import { faClock } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_DELIVERY_BATCHES_HISTORY } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import DeliveryBatchStatus from "../../enums/DeliveryBatchStatus";
	import PageBody from "../../components/PageBody.svelte";
    import DeliveryBatchesRoutes from "./routes";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import { timeSpanToTime } from "../../helpers/app";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let items = [];
	let noResults = true;

	const headers = [{ name: "Tournée", sortLabel: "name" }, { name: "Date et heure" }, { name: "Statut" }];

	const actions = [
		{
			click: () => routerInstance.goTo(DeliveryBatchesRoutes.List),
			text: "Voir livraisons programmées",
			icon: faClock,
			color: "green",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Livraisons passées" />
	<PageBody {errorsHandler}>
		<Actions {actions} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={deliveryBatch}
			onRowClick={(item) => routerInstance.goTo(DeliveryBatchesRoutes.Summary, { id: item.id })}
			graphQuery={GET_DELIVERY_BATCHES_HISTORY}
			noResultsPage={DeliveryBatchesRoutes.NoResults}
			loadingMessage="Chargement de vos livraisons passées en cours."
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{deliveryBatch.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
                <p>{format(new Date(deliveryBatch.scheduledOn), "PPPP", { locale: fr })}</p>
                <p>débuté à {timeSpanToTime(deliveryBatch.from).hours}h{timeSpanToTime(deliveryBatch.from).minutes == 0 ? "00" : timeSpanToTime(deliveryBatch.from).minutes}</p>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<span class="rounded-full px-4 py-1 text-gray-800 bg-green-200 delivery-status">
                    {DeliveryBatchStatus.label(deliveryBatch.status)}
                </span>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
