<script>
	import { getContext, onMount } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { GET_ACCEPTED_ORDERS, GET_PICKINGS } from "./queries.js";
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
	import { querystring } from "svelte-spa-router";

	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();
	const { query } = getContext("api");
	const { open } = getContext("modal");

	let isLoading = false;
	let items = writable([]);
	let pickings = [];

	$: actions = [
		{
			click: () => routerInstance.goTo(PickingRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];

	onMount(async () => {
		let routeParams = routerInstance.getQueryParam("selectModal");
		if (routeParams) handleCreatePicking();

		await loadPickings();
	});

	const loadPickings = async () => {
		isLoading = true;
		await query({
			query: GET_ACCEPTED_ORDERS,
			variables: { includePendingPurchaseOrders: true },
			success: (res) => (pickings = res.data),
			errorsHandler,
			errorNotification: "Impossible de charger les commandes en attente de préparation",
			skipCache: true,
		});
		await query({
			query: GET_PICKINGS,
			errorsHandler,
			success: (res) => items.set(res.data),
			errorNotification: "Impossible de récupérer les préparations en cours",
			skipCache: true,
		});
		isLoading = false;
	};

	const handleCreatePicking = () => open(ChooseAvailablePickingModal, { selectedItems: [] });
	$: loadPickings($querystring);
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
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
			{#if pickings && pickings.length > 0}
				<div
					class="rounded-3xl px-4 py-2 bg-blue-100"
					style="box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 10%); max-width: 500px;"
				>
					<div class="flex py-2 border-b border-gray-300 pb-3 items-center">
						<Icon data={faInfoCircle} style="width: 30px; height:30px;" class="mr-5" />
						<p class="font-semibold text-xl">Des commandes sont prêtes à être préparées</p>
					</div>
					<div class="w-full mt-3 px-10 xl:px-12">
						{#if $items.length > 0}
							<p>
								Vous pouvez les ajouter à l'une de vos préparations en cours à l'aide du bouton
								"Modifier" ou bien en créer une nouvelle.
							</p>
							<button on:click={handleCreatePicking} class="btn btn-lg btn-accent mt-4">
								Créer une autre préparation
							</button>
						{:else}
							<p>
								Commencez dès maintenant la préparation d'une ou plusieurs commandes en cliquant sur <strong>Lancer une préparation</strong>
							</p>
							<button on:click={handleCreatePicking} class="btn btn-lg btn-accent mt-4">
								Lancer une préparation
							</button>
						{/if}
					</div>
				</div>
			{/if}
			{#each $items as picking}
				<PickingItem {picking} />
			{/each}
		</div>
		{#if (!pickings || pickings.length === 0) && $items.length === 0}
			<p class="text-center">Aucune commande en attente d'être préparée</p>
		{/if}
	</PageBody>
</TransitionWrapper>
