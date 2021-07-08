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

	const headers = [{ name: "Tournée", sortLabel: "name" }, { name: "Date et heure" }];

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
			defaultSearchValues={DeliveryBatchesRoutes.History.Params.Query}
			{errorsHandler}
			{headers}
			let:rowItem={deliveryBatch}
			onRowClick={(item) => routerInstance.goTo(DeliveryBatchesRoutes.Summary, { id: item.id })}
			graphQuery={GET_DELIVERY_BATCHES_HISTORY}
			noResultsPage={DeliveryBatchesRoutes.NoResults}
			loadingMessage="Chargement de vos livraisons passées en cours."
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="leading-5 font-medium truncate" style="max-width: 180px;">
					<div class="mb-1">
						<span class="rounded-full text-green-500 text-sm delivery-status text-left">
							{DeliveryBatchStatus.label(deliveryBatch.status)}
						</span>
					</div>
					{deliveryBatch.name}
					<p class="text-gray-600 text-sm lg:text-base ">{deliveryBatch.deliveriesCount} client{deliveryBatch.deliveriesCount > 1 ? 's' : ''}</p>
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
                <p>{format(new Date(deliveryBatch.scheduledOn), "PPPP", { locale: fr })}</p>
                <p>débuté à {timeSpanToTime(deliveryBatch.from).hours}h{timeSpanToTime(deliveryBatch.from).minutes == 0 ? "00" : timeSpanToTime(deliveryBatch.from).minutes}</p>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
