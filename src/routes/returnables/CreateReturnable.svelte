<script>
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import ReturnableForm from "./ReturnableForm.svelte";
	import { GET_RETURNABLES } from "./queries";
	import { CREATE_RETURNABLE } from "./mutations";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import form from "../../stores/form";
	import { getContext } from "svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let isInModal = false,
		onClose,
		close;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let returnable = undefined; // hack en attendant le multi form

	const handleSubmit = async () => {
		return await mutate({
			mutation: CREATE_RETURNABLE,
			variables: returnable,
			errorsHandler,
			success: async (res) => {
				if (isInModal) await handleClose(res);
				else routerInstance.goTo(ReturnableRoutes.List);
			},
			successNotification: "Votre consigne a bien été créée",
			errorNotification: "Impossible de créer votre consigne",
			clearCache: [GET_RETURNABLES],
		});
	};

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};

</script>

<TransitionWrapper>
	{#if !isInModal}
		<PageHeader name="Créer une consigne" previousPage={ReturnableRoutes.List} />
	{/if}
	<PageBody {errorsHandler}>
		<ReturnableForm {isInModal} submit={handleSubmit} bind:returnable close={handleClose} />
	</PageBody>
</TransitionWrapper>
