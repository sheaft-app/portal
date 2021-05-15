<script>
	import {onMount, onDestroy, getContext} from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Loader from "./../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
	import {UPDATE_SELLING_POINT} from "./mutations";
	import {GET_SELLING_POINTS, GET_SELLING_POINT_DETAILS} from "./queries";
	import SellingPointForm from "./SellingPointForm.svelte";
	import DeleteSellingPoint from "./DeleteSellingPoint.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import SellingPointRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import SetSellingPointAvailability from "./SetSellingPointAvailability.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const notificationsInstance = new GetNotificationsInstance();
	const routerInstance = GetRouterInstance();

	export let params;

	let isLoading = true;
	let sellingPoint = null;
	let	loadingMessage = "Chargement des informations de votre point de vente en cours... veuillez patienter.";

	onMount(async () => {
		await fetchSellingPoint(params.id);
	});

	const fetchSellingPoint = async id => {
		loadingMessage = "Chargement des informations de votre point de vente en cours... veuillez patienter.";
		isLoading = true;
		var res = await graphQLInstance.query(
			GET_SELLING_POINT_DETAILS,
			{
				id: id
			},
			errorsHandler.Uuid
		);

		if (!res.success) {
			//TODO
			routerInstance.goTo(SellingPointRoutes.List);
			return;
		}

		sellingPoint = res.data;
		isLoading = false;
	};

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour de votre point de vente en cours... veuillez patienter.";
		isLoading = true;

		var res = await graphQLInstance.mutate(
			UPDATE_SELLING_POINT,
			{
				...sellingPoint,
				address: {
					...sellingPoint.address,
					country: "FR"
				}
			},
			errorsHandler.Uuid
		);

		if (!res.success) {
			// todo
			isLoading = false;
			return;
		}

		notificationsInstance.success(
			"Vos modifications ont bien été appliquées."
		);

		isLoading = false;
		routerInstance.goTo(SellingPointRoutes.List);
	};

	const showDeleteModal = () => {
		open(DeleteSellingPoint, {
			onClose: async res => {
				if (res.success) {
					graphQLInstance.clearApolloCache(GET_SELLING_POINTS);
					routerInstance.goTo(SellingPointRoutes.List);
				}
			},
			sellingPoint
		});
	};

	const showSetAvailabilityModal = () => {
		open(SetSellingPointAvailability, {
			onClose: async res => {
				if (res.success) {
					graphQLInstance.clearApolloCache(GET_SELLING_POINTS);
					routerInstance.goTo(SellingPointRoutes.List);
				}
			},
			sellingPoint
		});
	};

	onDestroy(() => (sellingPoint = null));

	const removeButton = {
		text: 'Supprimer',
		color: 'red',
		click: () => showDeleteModal()
	};

	$: buttons = [removeButton];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier un point de vente" previousPage={SellingPointRoutes.List} {buttons}/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<SellingPointForm
			submit={handleSubmit}
			initialValues={sellingPoint}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
