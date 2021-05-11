<script>
    import DayOfWeekKind from "./../../enums/DayOfWeekKind.js";
    import { timeSpanToFrenchHour } from "./../../helpers/app";
	import { GET_DELIVERIES } from "./queries";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import {
		faPlus
	} from "@fortawesome/free-solid-svg-icons";
	import ConfigureYearlyClosings from "../../components/ConfigureYearlyClosings.svelte";

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
		routerInstance.goTo(DeliveryRoutes.Details, { id: item.id });
	};
</script>

<svelte:head>
  <title>Mes créneaux de livraison</title>
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
		graphQuery={GET_DELIVERIES}
		{errorsHandler}
		{onRowClick}
		getRowBackgroundColor={(i) => !i.available ? 'bg-orange-200' : ''}
		headers={[{ name: 'Nom' }, { name: 'Horaires' }]}
		let:rowItem={delivery}
	>
			<div slot="globalActions" class="px-2 md:px-6 py-3 border-b border-gray-200">
				<ConfigureYearlyClosings />
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

	{#if noResults}
		<div class="w-full h-full flex justify-center">
			<div class="text-center text-xl text-gray-600 m-auto px-6">
				<p class="mb-3">Vous n'avez pas encore de créneau de livraison configuré.</p>
				<div class="flex flex-wrap mb-5 justify-center w-full flex-col-reverse md:flex-row">
					<a
						class="btn btn-lg btn-accent justify-center"
						href="javascript:void(0)"
						on:click={() => routerInstance.goTo(DeliveryRoutes.Create)}
						>
						Créer un créneau de livraison
					</a>
				</div>
			</div>
		</div>
	{/if}
</TransitionWrapper>
