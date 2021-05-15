<script>
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import {CREATE_DELIVERY} from "./mutations";
	import {GET_DELIVERIES} from "./queries";
	import DeliveryForm from "./DeliveryForm.svelte";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import DeliveryKind from "../../enums/DeliveryKind.js";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = GetNotificationsInstance();

	let isLoading = false;

	let delivery = {
		deliveryHours: [
			{
				id: 0,
				days: [],
				start: {
					hours: 0,
					minutes: 0
				},
				end: {
					hours: 0,
					minutes: 0
				}
			}
		],
		available: true,
		lockOrderHoursBeforeDelivery: 0,
		autoAcceptRelatedPurchaseOrder: false,
		autoCompleteRelatedPurchaseOrder: false
	};


	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(CREATE_DELIVERY, {
				kind: DeliveryKind.ProducerToStore.Value,
				...delivery
			},
			errorsHandler.Uuid,
			GET_DELIVERIES);

		isLoading = false;

		if (!res.success) {
			// todo
			return;
		}
		notificationsInstance.success("Vos informations de livraisons ont bien été enregistrées.");
		routerInstance.goTo(DeliveryRoutes.List);
	};
</script>

<TransitionWrapper>
	<PageHeader name="Créer un créneau de livraison" previousPage={DeliveryRoutes.List}/>
	<PageBody {errorsHandler} {isLoading} loadingMessage="Création de votre créneau de livraison en cours... veuillez patienter.">
		<DeliveryForm
			submit={handleSubmit}
			initialValues={delivery}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
