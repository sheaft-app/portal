<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { UPDATE_RETURNABLE } from "./mutations";
	import { GET_RETURNABLE_DETAILS, GET_RETURNABLES } from "./queries";
	import ReturnableForm from "./ReturnableForm.svelte";
	import DeleteReturnable from "./DeleteReturnable.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { querystring } from "svelte-spa-router";
	import { normalizeReturnable } from "./returnableForm";

	export let params;

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let returnable = null;
	let isLoading = true;

	onMount(async () => {
		await getReturnable();
	});

	const handleSubmit = async () =>
		await mutate({
			mutation: UPDATE_RETURNABLE,
			variables: normalizeReturnable(returnable),
			errorsHandler,
			success: () => routerInstance.goTo(ReturnableRoutes.List),
			successNotification: "La consigne a bien été modifiée",
			errorNotification: "La modification de la consigne a échoué",
			clearCache: [GET_RETURNABLES],
		});

	const showDeleteModal = () =>
		open(DeleteReturnable, {
			returnable,
			onClose: (res) => {
				if (res.success) routerInstance.goTo(ReturnableRoutes.List);
			},
		});

	const getReturnable = async () => {
		isLoading = true;
		returnable = await query({
			query: GET_RETURNABLE_DETAILS,
			variables: { id: params.id },
			errorsHandler,			
			error: () => routerInstance.goTo(ReturnableRoutes.List),
			errorNotification: "Impossible de récupérer les informations de la consigne.",
			skipCache: routerInstance.shouldSkipCache(),
		});

		returnable.noVat = returnable.vat <= 0;
		isLoading = false;
	};

	$: getReturnable($querystring);
	$: buttons = [{ text: "Supprimer", click: () => showDeleteModal(), color: "red" }];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier la consigne" previousPage={ReturnableRoutes.List} {buttons} />
	<PageBody
		{errorsHandler}
		{isLoading}
		loadingMessage="Récupération des informations de votre consigne en cours... veuillez patienter"
	>
		<ReturnableForm submit={handleSubmit} bind:returnable />
	</PageBody>
</TransitionWrapper>
