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
		isLoading = true;
		await query({
			query: GET_AVAILABLE_DELIVERY_BATCHES,
			variables: { includeProcessingPurchaseOrders: false },
			success: (res) => (deliveries = res.data.map((r) => ({ ...r, id: Guid.NewGuid() }))),
			errorsHandler,
			errorNotification: "Impossible de charger les livraisons disponibles",
		});
		await query({
			query: GET_DELIVERY_BATCHES,
			errorsHandler,
			success: (res) => items.set(res.data),
			errorNotification: "Impossible de récupérer les livraisons programmées",
		});
		isLoading = false;
	});

	const handleCreateDeliveryBatch = () => open(ChooseAvailableDelivery);
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

		{#if $items.length > 0}
			{#if deliveries && deliveries.length > 0}
				<div
					class="my-4 py-4 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
          md:rounded md:mb-2 flex items-center"
				>
					<div class="mr-5">
						<Icon data={faInfoCircle} style="width: 50px; height:50px;" />
					</div>
					<div class="w-full">
						<p class="text-center">
							D'autres commandes sont disponibles pour être livrées. Vous pouvez les ajouter à l'une de vos livraisons
							non validées ou bien en programmer une nouvelle.
						</p>
						<button on:click={handleCreateDeliveryBatch} class="btn btn-lg btn-accent m-auto mt-4"
							>Programmer une autre livraison</button
						>
					</div>
				</div>
				<div
					class="my-4 py-4 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
          md:rounded md:mb-2 flex items-center"
				>
					<div>
						<Icon data={faInfoCircle} style="width: 50px; height:50px;" />
					</div>
					<div>
						<p class="text-center">D'autres commandes sont disponibles pour être livrées</p>
						<button on:click={handleCreateDeliveryBatch} class="btn btn-lg btn-accent m-auto mt-4"
							>Programmer une autre livraison</button
						>
					</div>
				</div>
			{/if}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
				{#each $items as deliveryBatch}
					<DeliveryBatchItem {deliveryBatch} />
				{/each}
			</div>
		{:else if deliveries && deliveries.length > 0}
			<p class="text-center">Une ou plusieurs commandes sont disponibles pour être livrées</p>
			<button on:click={handleCreateDeliveryBatch} class="btn btn-lg btn-accent m-auto mt-4"
				>Programmer une livraison</button
			>
		{:else if $items.length === 0}
			<p class="text-center">Aucune commande disponible pour être livrée</p>
		{/if}
	</PageBody>
</TransitionWrapper>
