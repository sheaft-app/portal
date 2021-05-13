<script>
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import ReturnableForm from "./ReturnableForm.svelte";
	import { GET_RETURNABLES } from "./queries";
	import { CREATE_RETURNABLE } from "./mutations";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import form from "../../stores/form";
	import { getContext } from "svelte";
	  
	export let isInModal = false, onClose, close;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	const handleSubmit = async () => {
		return mutate({
			mutation: CREATE_RETURNABLE,
			variables: form.values(),
			errorsHandler,
			success: async () => {
				if (isInModal) await handleClose(res);
				else routerInstance.goTo(ReturnableRoutes.List);
			},
			successNotification: "Votre consigne a bien été créée",
			errorNotification: "Impossible de créer votre consigne",
			clearCache: [GET_RETURNABLES]
		});
	};

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};
</script>

<svelte:head>
	<title>Créer une nouvelle consigne</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	<section
		class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
		{#if !isInModal}
			<div class="mb-3">
				<button
					class="text-gray-600 items-center flex uppercase"
					on:click={() => routerInstance.goBack()}>
					<Icon data={faChevronLeft} class="mr-2 inline" />
					Consignes
				</button>
			</div>
		{/if}
    <h1 class="font-semibold uppercase mb-0">Créer une nouvelle consigne</h1>
	</section>
	<ReturnableForm
		{isInModal}
		submit={handleSubmit}
		close={handleClose} />
</TransitionWrapper>
