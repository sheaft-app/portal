<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { UPDATE_SELLING_POINT } from "./mutations";
	import { GET_SELLING_POINTS, GET_SELLING_POINT_DETAILS } from "./queries";
	import SellingPointForm from "./SellingPointForm.svelte";
	import DeleteSellingPoint from "./DeleteSellingPoint.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import SellingPointRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import SetSellingPointAvailability from "./SetSellingPointAvailability.svelte";
	import { normalizeSellingPoint } from "./sellingPointForm";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { querystring } from "svelte-spa-router";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let isLoading = true;
	let sellingPoint = null;

	onMount(async () => {
		await getSellingPoint();
	});

	const handleSubmit = async () => {
		return await mutate({
			mutation: UPDATE_SELLING_POINT,
			variables: normalizeSellingPoint(sellingPoint),
			errorsHandler,
			success: () => routerInstance.goTo(SellingPointRoutes.List),
			successNotification: "Vos modifications ont bien été appliquées au point de vente",
			errorNotification: "Impossible de modifier le point de vente",
			clearCache: [GET_SELLING_POINTS],
		});
	};

	const showDeleteModal = () => {
		open(DeleteSellingPoint, {
			sellingPoint,
			onClose: (res) => {
				if (res.success) routerInstance.goTo(SellingPointRoutes.List);
			},
		});
	};

	const showSetAvailabilityModal = () => {
		open(SetSellingPointAvailability, {
			sellingPoint,
			onClose: (res) => {
				if (res.success) routerInstance.goTo(SellingPointRoutes.List);
			},
		});
	};

	const getSellingPoint = async () => {
		isLoading = true;
		sellingPoint = await query({
			query: GET_SELLING_POINT_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(SellingPointRoutes.List),
			errorNotification: "Le point de vente auquel vous essayez d'accéder n'existe plus.",
			skipCache: routerInstance.shouldSkipCache(),
		});
		isLoading = false;
	};

	onDestroy(() => (sellingPoint = null));

	$: getSellingPoint($querystring);
	$: buttons = [
		{
			text: "Supprimer",
			color: "red",
			click: () => showDeleteModal(),
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier un point de vente" previousPage={SellingPointRoutes.List} {buttons} />
	<PageBody
		{errorsHandler}
		{isLoading}
		loadingMessage="Chargement des informations de votre point de vente en cours."
	>
		<SellingPointForm submit={handleSubmit} bind:sellingPoint />
	</PageBody>
</TransitionWrapper>
