<script>
	import { getContext, onMount } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { GET_AVAILABLE_DELIVERY_BATCHES, GET_DELIVERY_BATCHES } from "./queries.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import { faHistory, faPlus } from "@fortawesome/free-solid-svg-icons";
	import GetRouterInstance from "../../services/SheaftRouter";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { writable } from "svelte/store";
	import DeliveryBatchItem from "./DeliveryBatchItem.svelte";
	import DeliveryBatchesRoutes from "./routes";
	import Actions from "./../../components/table/Actions.svelte";
	import ChooseAvailableDelivery from "./ChooseAvailableDelivery.svelte";
	import Guid from "../../helpers/Guid";
	import Icon from "svelte-awesome";
	import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
	import { querystring } from "svelte-spa-router";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query } = getContext("api");
	const { open } = getContext("modal");
	const items = writable([]);
	let deliveries = [];

	let isLoading = true;

	$: actions = [
		{
			click: () => routerInstance.goTo(DeliveryBatchesRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];

	onMount(async () => {
		let routeParams = routerInstance.getQueryParam("selectModal");
		if (routeParams) handleCreateDeliveryBatch();

		await loadDeliveryBatches();
	});

	const loadDeliveryBatches = async () => {
		isLoading = true;
		await query({
			query: GET_AVAILABLE_DELIVERY_BATCHES,
			variables: { includeProcessingPurchaseOrders: false },
			success: (res) => (deliveries = res.data.map((r) => ({ ...r, id: Guid.NewGuid() }))),
			errorsHandler,
			errorNotification: "Impossible de charger les livraisons disponibles",
			skipCache: true,
		});
		await query({
			query: GET_DELIVERY_BATCHES,
			errorsHandler,
			success: (res) => items.set(res.data),
			errorNotification: "Impossible de récupérer les livraisons programmées",
			skipCache: true,
		});
		isLoading = false;
	};

	const handleCreateDeliveryBatch = () => open(ChooseAvailableDelivery);
	$: loadDeliveryBatches($querystring);
</script>

<TransitionWrapper>
	<PageHeader name="Livraisons programmées" previousPage={null} subname={null} />
	<PageBody
		{errorsHandler}
		{isLoading}
		noResults={$items.length < 1}
		noResultsPage={null}
		loadingMessage="Chargement des livraisons..."
	>
		<Actions {actions} />
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
			{#if deliveries.length > 0}
				<div
					class="rounded-3xl px-4 py-2 bg-blue-100"
					style="box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 10%); max-width: 500px;"
				>
					<div class="flex py-2 border-b border-gray-300 pb-3 items-center">
						<Icon data={faInfoCircle} style="width: 30px; height:30px;" class="mr-5" />
						<p class="font-semibold text-xl">Des commandes sont prêtes à être livrées</p>
					</div>
					<div class="w-full mt-3 px-10 xl:px-12">
						{#if $items.length > 0}
							<p>
								Vous pouvez les ajouter à l'une de vos programmations non validées à l'aide du bouton
								"Modifier" ou bien en programmer une nouvelle.
							</p>
							<button on:click={handleCreateDeliveryBatch} class="btn btn-lg btn-accent mt-4">
								Programmer une autre livraison
							</button>
						{:else}
							<p>
								Commencez dès maintenant à livrer une ou plusieurs commandes en cliquant sur <strong>Programmer une livraison</strong>
							</p>
							<button on:click={handleCreateDeliveryBatch} class="btn btn-lg btn-accent mt-4">
								Programmer une livraison
							</button>
						{/if}
					</div>
				</div>
			{/if}
			{#each $items as deliveryBatch}
				<DeliveryBatchItem {deliveryBatch} />
			{/each}
		</div>
		{#if (!deliveries || deliveries.length === 0) && $items.length === 0}
			<p class="text-center">Aucune commande disponible pour être livrée</p>
		{/if}
	</PageBody>
</TransitionWrapper>
