<script>
	import Icon from "svelte-awesome";
	import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import ReturnableForm from "./ReturnableForm.svelte";
	import {CREATE_RETURNABLE} from "./mutations";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import {GET_RETURNABLES} from "./queries";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let isInModal = false,
		onClose,
		close;

	const graphQLInstance = GetGraphQLInstance();
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = GetNotificationsInstance();

	let isLoading = false;

	let returnable = {
		name: "",
		description: "",
		vat: null,
		wholeSalePrice: null,
	};

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			CREATE_RETURNABLE,
			returnable,
			errorsHandler.Uuid,
			GET_RETURNABLES
		);

		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}
		notificationsInstance.success("Votre consigne a bien été créée.");
		if (isInModal) await handleClose(res);
		else routerInstance.goTo(ReturnableRoutes.List);
	};

	const handleClose = async (res) => {
		close();

		if (onClose) await onClose(res);
	};
</script>

<TransitionWrapper>
	{#if !isInModal}
		<PageHeader name="Détails du partenariat" previousPage={ReturnableRoutes.List}/>
	{/if}
	<PageBody {errorsHandler} {isLoading} loadingMessage="Création de votre consigne en cours... veuillez patienter.">
		<ReturnableForm
			{isInModal}
			submit={handleSubmit}
			{returnable}
			{isLoading}
			close={handleClose}/>
	</PageBody>
</TransitionWrapper>
