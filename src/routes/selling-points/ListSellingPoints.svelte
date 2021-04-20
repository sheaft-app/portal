<script>
	import DeliveryKind from './../../enums/DeliveryKind.js';
	import { GET_SELLING_POINTS, GET_BUSINESS_CLOSINGS } from "./queries";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Icon from "svelte-awesome";
	import { faEdit } from "@fortawesome/free-solid-svg-icons";
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
	import { getContext } from 'svelte';
	import ManageYearlyClosingsModal from "./ManageYearlyClosingsModal.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import { onMount } from "svelte";

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const { open } = getContext('modal');

	let isLoading = true;
	let items = [];
	let noResults = true;
	let closings = [];

	onMount(async () => {
		const result = await graphQLInstance.query(GET_BUSINESS_CLOSINGS, errorsHandler.Uuid);

		if (!result.success) {
			// todo
			return;
		}

		closings = result.data;
	});

	const actions = [
		{
			click: () => routerInstance.goTo(SellingPointRoutes.Create),
			text: "Ajouter un point de vente",
			icon: faPlus,
			color: "green",
		}
	];

	const onRowClick = (item) => {
		routerInstance.goTo(SellingPointRoutes.Details, { id: item.id });
	};

	const openManageClosingsModal = () => {
		open(ManageYearlyClosingsModal, {
			onClose: (res) => {
				closings = res;
			}
		});
	}
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
			<div slot="globalActions" class="px-2 md:px-6 py-3 border-b border-gray-200">
				<button on:click={openManageClosingsModal} class="btn-link flex items-center">
					<Icon data={faEdit} class="mr-2" />
					Gérer fermetures annuelles
				</button>
				{#if closings && closings.length > 0}
					<p class="font-semibold mt-2">Fermetures configurées :</p>
					<ul style="list-style: circle;padding: revert;">
						{#each closings as closing}
							<li>du {format(new Date(closing.from), 'PPPP', {locale: fr })} au {format(new Date(closing.to), 'PPPP', {locale: fr })}</li>
						{/each}
					</ul>
				{/if}
			</div>
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
