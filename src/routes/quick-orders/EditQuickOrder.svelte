<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { GET_QUICKORDERS, GET_QUICKORDER } from "./queries";
	import { UPDATE_QUICKORDER } from "./mutations";
	import form from "../../stores/form";
	import QuickOrderRoutes from "./routes";
	import { normalizeUpdateQuickOrder } from "./quickOrderForm";
	import QuickOrderForm from "./QuickOrderForm.svelte";
	import { faFileExport, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
	import DeleteQuickOrdersModal from "./DeleteQuickOrdersModal.svelte";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let quickOrder = undefined;

	onMount(async () => {
		isLoading = true;
		quickOrder = await query({
			query: GET_QUICKORDER,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(QuickOrderRoutes.List),
			errorNotification: "Le modèle auquel vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
	});

	const deleteQuickOrder = () => {
		open(DeleteQuickOrdersModal, {
			selectedItems: [quickOrder],
			onClose: (res) => {
				routerInstance.goTo(QuickOrderRoutes.List);
			},
		});
	};

	const handleSubmit = async () => {
		return await mutate({
			mutation: UPDATE_QUICKORDER,
			variables: normalizeUpdateQuickOrder(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(QuickOrderRoutes.List),
			successNotification: "Votre modèle de commande a bien été mise à jour",
			errorNotification: "Impossible de mettre à jour votre modèle de commande",
			clearCache: [GET_QUICKORDERS],
		});
	};

	$: actions = [
		{
			click: () => deleteQuickOrder(),
			text: "Supprimer",
			icon: faTrash,
			color: "red",
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Editer un modèle de commande" previousPage={QuickOrderRoutes.List} buttons={actions} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations en cours.">
		<QuickOrderForm submit={handleSubmit} bind:quickOrder />
	</PageBody>
</TransitionWrapper>