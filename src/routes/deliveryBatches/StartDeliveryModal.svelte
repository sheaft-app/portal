<script>
    import { getContext, onMount } from "svelte";
    import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_DELIVERY_BATCHES, GET_DELIVERY_BATCH_DETAILS } from "./queries";
	import { START_DELIVERY_BATCH } from "./mutations";
	import DeliveryBatchesRoutes from "./routes";
    import { denormalizeDeliveryBatch } from "./deliveryBatchForm";
    import Loader from "../../components/Loader.svelte";
    import { faCheck } from "@fortawesome/free-solid-svg-icons";
    import SimpleStoreCard from "../deliveries/SimpleStoreCard.svelte";
    import GetRouterInstance from "../../services/SheaftRouter";
    import SheaftErrors from "../../services/SheaftErrors";

    export let id, close;

    const errorsHandler = new SheaftErrors();
    const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

    let isLoading = false;
    let isInitializing = true;
    let deliveries = [];

    onMount(async () => {
		isInitializing = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id },
			errorsHandler,
			success: (res) => (deliveries = denormalizeDeliveryBatch(res).deliveries),
			error: () => close(),
			errorNotification: "Impossible de récupérer les informations de la livraison.",
		});
		isInitializing = false;
    });
    
    const submit = async () => {
		isLoading = true;
		await mutate({
			mutation: START_DELIVERY_BATCH,
			variables: { id, startFirstDelivery: true },
			errorsHandler,
			success: (res) => routerInstance.goTo(DeliveryBatchesRoutes.Process, { id: res.id }),
			successNotification: "Livraison démarrée !",
			errorNotification: "Impossible de démarrer la livraison",
			clearCache: [GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Lancer la livraison"
	{submit}
	{isLoading}
	{close}
	submitText="Lancer"
	icon={faCheck}
	closeText="Fermer"
>
	<p class="pt-2 pb-1 leading-5">Vous vous apprêtez à démarrer la livraison.</p>
	{#if deliveries.length > 1}
		<p class="pt-2 pb-1 leading-5">Si l'ordre de livraison n'est pas bon, vous pouvez le 
			<button type="button" class="btn-link" on:click={() => routerInstance.goTo(DeliveryBatchesRoutes.Edit, { id })}>
				modifier en cliquant ici
			</button>
		.</p>
	{/if}
	{#if isInitializing}
		<Loader />
	{:else}
        {#each deliveries as delivery}
            <SimpleStoreCard props={{ ...delivery, name: delivery.client }} />
        {/each}
	{/if}
</ActionConfirm>