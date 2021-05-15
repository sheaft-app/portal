<script>
	import {onMount, getContext} from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Loader from "../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
	import {UPDATE_RETURNABLE} from "./mutations";
	import {GET_RETURNABLES, GET_RETURNABLE_DETAILS} from "./queries";
	import ReturnableForm from "./ReturnableForm.svelte";
	import DeleteReturnable from "./DeleteReturnable.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let params;

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = new GetNotificationsInstance();

	let isLoading = true;
	let returnable = null;
	let loadingMessage = "Récupération des informations de votre consigne en cours... veuillez patienter";

	onMount(async () => {
		await getReturnable(params.id);
	});

	const getReturnable = async (id) => {
		isLoading = true;
		var res = await graphQLInstance.query(
			GET_RETURNABLE_DETAILS,
			{
				id: id,
			},
			errorsHandler.Uuid
		);

		if (!res.success) {
			//TODO
			isLoading = false;
			routerInstance.goTo(ReturnableRoutes.List);
			return;
		}

		returnable = res.data;
		isLoading = false;
	};

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour de votre consigne en cours... veuillez patienter";
		isLoading = true;

		var res = await graphQLInstance.mutate(
			UPDATE_RETURNABLE,
			returnable,
			errorsHandler.Uuid
		);

		if (!res.success) {
			//TODO
			isLoading = false;
			return;
		}

		isLoading = false;
		notificationsInstance.success(
			"Vos modifications ont bien été appliquées."
		);

		routerInstance.goTo(ReturnableRoutes.List);
	};

	const showDeleteModal = () => {
		open(DeleteReturnable, {
			returnable,
			onClose: async (res) => {
				if (res.success) {
					graphQLInstance.clearApolloCache(GET_RETURNABLES);
					routerInstance.goTo(ReturnableRoutes.List);
				}
			},
		});
	};

	const buttons = [{text:'Supprimer', click: () => showDeleteModal(), color:'red'}];
</script>

<TransitionWrapper>
	<PageHeader name="Détails du partenariat" previousPage={ReturnableRoutes.List} {buttons}/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<ReturnableForm submit={handleSubmit} {returnable} {isLoading}/>
	</PageBody>
</TransitionWrapper>
