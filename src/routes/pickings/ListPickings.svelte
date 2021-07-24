<script>
	import { getContext, onMount } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { GET_AVAILABLE_PICKINGS, GET_PICKINGS } from "./queries.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import ChooseAvailablePickingModal from "./ChooseAvailablePickingModal.svelte";
	import PickingItem from "./PickingItem.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import { writable } from "svelte/store";
	import { faPlay, faHistory } from "@fortawesome/free-solid-svg-icons";
	import PickingRoutes from "./routes";
	import GetRouterInstance from "../../services/SheaftRouter";
	import Guid from "../../helpers/Guid";
	import Icon from "svelte-awesome";
	import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();
	const { query } = getContext("api");
	const { open } = getContext("modal");

	let isLoading = false;
	let items = writable([]);
	let pickings = [];

	const actions = [
		{
			click: () => handleCreatePicking(),
			disabled: $items.length < 1,
			text: "Lancer une préparation",
			icon: faPlay,
			color: "green",
			hideIfDisabled: true,
		},
		{
			click: () => routerInstance.goTo(PickingRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_AVAILABLE_PICKINGS,
			variables: { includePendingPurchaseOrders: true },
			success: (res) => (pickings = res.data.map((r) => ({ ...r, id: Guid.NewGuid() }))),
			errorsHandler,
			errorNotification: "Impossible de charger les préparations disponibles",
		});
		await query({
			query: GET_PICKINGS,
			errorsHandler,
			success: (res) => items.set(res.data),
			errorNotification: "Impossible de récupérer les préparations",
		});
		isLoading = false;
	});

	const handleCreatePicking = () => open(ChooseAvailablePickingModal);
</script>

<TransitionWrapper>
	<PageHeader name="Préparations" previousPage={null} subname={null} />
	<PageBody
		{errorsHandler}
		{isLoading}
		noResults={$items.length < 1}
		noResultsPage={null}
		loadingMessage="Chargement des préparations..."
	>
		<Actions {actions} />
		{#if $items.length > 0}
			{#if pickings && pickings.length > 0}
				<div
					class="my-4 py-4 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
          md:rounded md:mb-2 flex items-center"
				>
					<div class="mr-5">
						<Icon data={faInfoCircle} style="width: 50px; height:50px;" />
					</div>
					<div class="w-full">
						<p class="text-center">
							D'autres commandes sont disponibles pour être préparées. Vous pouvez les ajouter à l'une de vos
							préparations en cours à l'aide du bouton "Modifier" ou bien en créer une nouvelle.
						</p>
						<button on:click={handleCreatePicking} class="btn btn-lg btn-accent m-auto mt-4"
							>Lancer une autre préparation</button
						>
					</div>
				</div>
			{/if}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
				{#each $items as picking}
					<PickingItem {picking} />
				{/each}
			</div>
		{:else if pickings && pickings.length > 0}
			<p class="text-center">Une ou plusieurs commandes sont disponibles pour être préparées</p>
			<button on:click={handleCreatePicking} class="btn btn-lg btn-accent m-auto mt-4">Lancer une préparation</button>
		{:else if $items.length === 0}
			<p class="text-center">Aucune commande disponible pour être préparée</p>
		{/if}
	</PageBody>
</TransitionWrapper>
