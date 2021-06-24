<script>
	import { getContext, onMount } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { GET_DELIVERY_BATCHES } from "./queries.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
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
			color: "green",
		},
	];

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_BATCHES,
			errorsHandler,
			success: (res) => items.set(res),
			errorNotification: "Impossible de récupérer les livraisons programmées",
		});
		isLoading = false;
	});

	const handleCreateDeliveryBatch = () => open(ChooseAvailableDelivery);
</script>

<TransitionWrapper>
	<PageHeader name="Livraisons programmées" />
	<PageBody {errorsHandler} {isLoading} noResults={$items.length < 1}>
		{#if $items.length > 0}
			<Actions {actions} />
		{/if}

		{#each $items as deliveryBatch}
			<DeliveryBatchItem {deliveryBatch} />
		{:else}
			<p class="text-center">Vous n'avez pas encore programmé de livraison</p>
			<button on:click={handleCreateDeliveryBatch} class="btn btn-lg btn-accent m-auto mt-4"
				>Programmer une livraison</button
			>
		{/each}
	</PageBody>
</TransitionWrapper>
