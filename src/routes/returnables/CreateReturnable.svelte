<script>
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import ReturnableForm from "./ReturnableForm.svelte";
	import { CREATE_RETURNABLE } from "./mutations";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import { GET_RETURNABLES } from "./queries";

	export let isInModal = false,
		onClose,
		close;

	const graphQLInstance = GetGraphQLInstance();
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

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

		if (isInModal) await handleClose(res);
		else routerInstance.goTo(ReturnableRoutes.List);
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
		class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2">
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
		{returnable}
		{isLoading}
		close={handleClose} />
</TransitionWrapper>
