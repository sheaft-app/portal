<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { UPDATE_DELIVERY_BATCH } from "./mutations";
	import { GET_DELIVERY_BATCHES, GET_DELIVERY_BATCH_DETAILS } from "./queries";
	import DeliveryBatchForm from "./DeliveryBatchForm.svelte";
	import DeleteDeliveryBatch from "./DeleteDeliveryBatch.svelte";
	import DeliveryBatchesRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { normalizeDeliveryBatch, denormalizeDeliveryBatch } from "./deliveryBatchForm";
	import PostponeDeliveryBatchModal from "./PostponeDeliveryBatchModal.svelte";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let deliveryBatch = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre programmation en cours...";

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			success: (res) => (deliveryBatch = denormalizeDeliveryBatch(res)),
			error: () => routerInstance.goTo(DeliveryBatchesRoutes.List),
			errorNotification: "La programmation à laquelle vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour de la programmation...";
		await mutate({
			mutation: UPDATE_DELIVERY_BATCH,
			variables: normalizeDeliveryBatch(deliveryBatch),
			errorsHandler,
			success: () => routerInstance.goTo(DeliveryBatchesRoutes.List),
			successNotification: "Votre programmation a bien été modifiée",
			errorNotification: "Impossible de modifier la livraison programmée",
			clearCache: [GET_DELIVERY_BATCHES],
		});
	};

	onDestroy(() => (deliveryBatch = null));

	const buttons = [
		{
			text: "Décaler",
			color: "blue",
			click: () => open(PostponeDeliveryBatchModal, { id: deliveryBatch.id }),
		},
		{
			text: "Supprimer",
			color: "red",
			click: () =>
				open(DeleteDeliveryBatch, {
					deliveryBatch,
					onClose: () => routerInstance.goTo(DeliveryBatchesRoutes.List),
				}),
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier une livraison programmée" previousPage={DeliveryBatchesRoutes.List} {buttons} />
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<DeliveryBatchForm submit={handleSubmit} bind:deliveryBatch />
	</PageBody>
</TransitionWrapper>
