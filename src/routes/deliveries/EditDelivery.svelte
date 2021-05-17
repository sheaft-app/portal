<script>
	import SetDeliveryAvailability from './SetDeliveryAvailability.svelte';
	import {onMount, onDestroy, getContext} from "svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import {UPDATE_DELIVERY} from "./mutations";
	import {GET_DELIVERIES, GET_DELIVERY_DETAILS} from "./queries";
	import DeliveryForm from "./DeliveryForm.svelte";
	import DeleteDelivery from "./DeleteDelivery.svelte";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = GetNotificationsInstance();

	export let params;

	let isLoading = true;
	let delivery = null;
	let loadingMessage = "Chargement des informations de votre créneau de livraison en cours... veuillez patienter.";

	onMount(async () => {
		await fetchDelivery(params.id);
	});

	const fetchDelivery = async id => {
		isLoading = true;
		loadingMessage = "Chargement des informations de votre créneau de livraison en cours... veuillez patienter.";
		var res = await graphQLInstance.query(
			GET_DELIVERY_DETAILS,
			{id: id},
			errorsHandler.Uuid
		);

		if (!res.success) {
			// todo
			routerInstance.goTo(DeliveryRoutes.List);
			return;
		}

		delivery = res.data;
		isLoading = false;
	};

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour de votre créneau de livraison en cours... veuillez patienter.";
		isLoading = true;
		var res = await graphQLInstance.mutate(
			UPDATE_DELIVERY,
			delivery,
			errorsHandler.Uuid
		);

		if (!res.success) {
			isLoading = false;
			// todo
			return;
		}
		notificationsInstance.success("Vos modifications ont bien été appliquées.");
		isLoading = false;
		routerInstance.goTo(DeliveryRoutes.List);
	};

	const showDeleteModal = () => {
		open(DeleteDelivery, {
			delivery,
			onClose: async res => {
				if (res.success) {
					graphQLInstance.clearApolloCache(GET_DELIVERIES);
					routerInstance.goTo(DeliveryRoutes.List);
				}
			}
		});
	};

	const showSetAvailabilityModal = () => {
		open(SetDeliveryAvailability, {
			onClose: async res => {
				if (res.success) {
					graphQLInstance.clearApolloCache(GET_DELIVERIES);
					routerInstance.goTo(DeliveryRoutes.List);
				}
			},
			delivery
		});
	};

	onDestroy(() => (delivery = null));

	const removeButton = {
		text: 'Supprimer',
		color: 'red',
		click: () => showDeleteModal()
	};

	$: buttons = [removeButton];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier un créneau de livraison" previousPage={DeliveryRoutes.List} {buttons}/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<DeliveryForm
			submit={handleSubmit}
			initialValues={delivery}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
