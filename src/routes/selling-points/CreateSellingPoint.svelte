<script>
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import {CREATE_SELLING_POINT} from "./mutations";
	import Icon from "svelte-awesome";
	import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import SellingPointForm from "./SellingPointForm.svelte";
	import SellingPointRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import {GET_SELLING_POINTS} from "./queries";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = new GetNotificationsInstance();

	let isLoading = false;

	let sellingPoint = {
		name: "",
		kind: "",
		address: null,
		maxPurchaseOrdersPerTimeSlot: null,
		autoAcceptRelatedPurchaseOrder: false,
		autoCompleteRelatedPurchaseOrder: false,
		deliveryHours: [
			{
				id: 0,
				days: [],
				from: null,
				to: null
			}
		],
		lockOrderHoursBeforeDelivery: null
	};

	const handleSubmit = async () => {
		isLoading = true;

		var res = await graphQLInstance.mutate(
			CREATE_SELLING_POINT,
			{
				...sellingPoint,
				available: true,
				address: {
					...sellingPoint.address,
					country: "FR"
				}
			},
			errorsHandler.Uuid,
			GET_SELLING_POINTS);

		isLoading = false;

		if (!res.success) {
			// todo
			return;
		}

		notificationsInstance.success(
			"Votre point de vente a bien été créé."
		);

		routerInstance.goTo(SellingPointRoutes.List);
	};
</script>

<TransitionWrapper>
	<PageHeader name="Créer un point de vente" previousPage={SellingPointRoutes.List}/>
	<PageBody {errorsHandler} {isLoading}
						loadingMessage="Création de votre point de vente en cours... veuillez patienter.">
		<SellingPointForm
			submit={handleSubmit}
			initialValues={sellingPoint}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
