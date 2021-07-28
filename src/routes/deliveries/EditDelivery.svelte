<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { UPDATE_DELIVERY } from "./mutations";
	import { GET_DELIVERIES, GET_DELIVERY_DETAILS } from "./queries";
	import DeliveryForm from "./DeliveryForm.svelte";
	import DeleteDelivery from "./DeleteDelivery.svelte";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { normalizeDelivery, denormalizeDelivery } from "./deliveryForm";
	import { querystring } from "svelte-spa-router";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let delivery = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre créneau de livraison en cours.";

	onMount(async () => {});

	const getDelivery = async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryRoutes.List),
			success: (res) => (delivery = denormalizeDelivery(res)),
			errorNotification: "Le créneau auquel vous essayez d'accéder n'existe plus.",
			skipCache: routerInstance.shouldSkipCache(),
		});
		isLoading = false;
	};

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour de votre créneau de livraison en cours.";
		await mutate({
			mutation: UPDATE_DELIVERY,
			variables: normalizeDelivery(delivery),
			errorsHandler,
			success: () => routerInstance.goTo(DeliveryRoutes.List),
			successNotification: "Votre créneau de livraison a bien été modifié",
			errorNotification: "Impossible de modifier ce créneau de livraison",
			clearCache: [GET_DELIVERIES, GET_DELIVERY_DETAILS],
		});
	};

	const showDeleteModal = () =>
		open(DeleteDelivery, {
			delivery,
			onClose: () => routerInstance.goTo(DeliveryRoutes.List),
		});

	onDestroy(() => (delivery = null));

	$: getDelivery($querystring);
	$: buttons = [
		{
			text: "Supprimer",
			color: "red",
			click: () => showDeleteModal(),
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier un créneau de livraison" previousPage={DeliveryRoutes.List} {buttons} />
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<DeliveryForm submit={handleSubmit} bind:delivery />
	</PageBody>
</TransitionWrapper>
