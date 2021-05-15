<script>
	import DayOfWeekKind from "./../../enums/DayOfWeekKind.js";
	import {timeSpanToFrenchHour} from "./../../helpers/app";
	import {GET_DELIVERIES} from "./queries";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import Actions from "./../../components/table/Actions.svelte";
	import {
		faPlus
	} from "@fortawesome/free-solid-svg-icons";
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
			click: () => routerInstance.goTo(DeliveryRoutes.Create),
			text: "Ajouter un créneau de livraison",
			icon: faPlus,
			color: "green",
		}
	];

	const onRowClick = (item) => {
		routerInstance.goTo(DeliveryRoutes.Details, {id: item.id});
	};
</script>

<TransitionWrapper>
	<PageHeader name="Mes créneaux de livraison"/>
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length}/>
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			graphQuery={GET_DELIVERIES}
			{errorsHandler}
			{onRowClick}
			noResultsPage={DeliveryRoutes.NoResultsPage}
			loadingMessage="Chargement de vos créneaux de livraisons en cours... veuillez patienter."
			getRowBackgroundColor={(i) => !i.available ? 'bg-orange-200' : ''}
			headers={[{ name: 'Nom' }, { name: 'Horaires' }]}
			let:rowItem={delivery}>
			<div slot="globalActions" class="px-2 md:px-6 py-3 border-b border-gray-200">
				<ConfigureYearlyClosings/>
			</div>
			<td
				class="px-2 md:px-6 py-4 whitespace-no-wrap border-b
				border-gray-200">
				<div
					class="text-sm leading-5 font-medium truncate"
					style="max-width: 180px;">
					{delivery.name}
				</div>
			</td>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap border-b
            border-gray-200">
				{#each delivery.deliveryHours as opening}
					<div class="flex mb-2">
						<p style="min-width: 100px;">
							{DayOfWeekKind.get(opening.day).Label}
						</p>
						<div class="ml-3">
							<p>{`${timeSpanToFrenchHour(opening.from)} à ${timeSpanToFrenchHour(opening.to)}`}</p>
						</div>
					</div>
				{/each}
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
