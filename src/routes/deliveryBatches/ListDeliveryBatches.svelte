<script>
	import { getContext, onMount } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { GET_DELIVERY_BATCHES } from "./queries.js";
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

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query } = getContext("api");
	const { open } = getContext("modal");
	const items = writable([]);

	let isLoading = true;

	const actions = [
		{
			click: () => handleCreateDeliveryBatch(),
			text: "Programmer une livraison",
			icon: faPlus,
			color: "green"
		},
		{
			click: () => routerInstance.goTo(DeliveryBatchesRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue"
		}
	];

	onMount(async () => {
		isLoading = true;
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
	<PageBody {errorsHandler} {isLoading} noResults={$items.length < 1} noResultsPage={null} loadingMessage="Chargement des livraisons...">
		<Actions {actions} />
		{#if $items.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-32">
				{#each $items as deliveryBatch}
					<DeliveryBatchItem {deliveryBatch} />
				{/each}
			</div>
		{:else}
			<p class="text-center">Aucune livraison programmée</p>
			<button on:click={handleCreateDeliveryBatch} class="btn btn-lg btn-accent m-auto mt-4">Programmer une livraison</button>
		{/if}
	</PageBody>
</TransitionWrapper>
