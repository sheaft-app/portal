<script>
	import {onMount, getContext} from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Loader from "../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import { UPDATE_RETURNABLE } from "./mutations";
	import {GET_RETURNABLE_DETAILS, GET_RETURNABLES} from "./queries";
	import ReturnableForm from "./ReturnableForm.svelte";
	import DeleteReturnable from "./DeleteReturnable.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let params;

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let returnable = null;
	let isLoading = true;
	let loadingMessage = "Récupération des informations de votre consigne en cours... veuillez patienter";

	onMount(async () => {
		isLoading = true;
		returnable = await query({
			query: GET_RETURNABLE_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(ReturnableRoutes.List),
			errorNotification: "Impossible de récupérer les informations de la consigne."
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		isLoading = true;
		return await mutate({
			mutation: UPDATE_RETURNABLE,
			variables: returnable,
			errorsHandler,
			success: () => routerInstance.goTo(ReturnableRoutes.List),
			successNotification: "La consigne a bien été modifiée",
			errorNotification: "La modification de la consigne a échoué"
		});
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
	<PageHeader name="Modifier la consigne" previousPage={ReturnableRoutes.List} {buttons}/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<ReturnableForm submit={handleSubmit} {returnable} {isLoading}/>
	</PageBody>
</TransitionWrapper>
