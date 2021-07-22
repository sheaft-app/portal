<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { GET_QUICKORDERS } from "./queries";
	import { CREATE_QUICKORDER } from "./mutations";
	import form from "../../stores/form";
	import QuickOrderRoutes from "./routes";
	import { normalizeCreateQuickOrder } from "./quickOrderForm";
	import QuickOrderForm from "./QuickOrderForm.svelte";
	import { products } from "./stores";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let quickOrder = undefined;

	onMount(async () => {
		isLoading = false;
	});

	const handleSubmit = async () => {
		return await mutate({
			mutation: CREATE_QUICKORDER,
			variables: normalizeCreateQuickOrder(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(QuickOrderRoutes.List),
			successNotification: "Votre modèle de commande a bien été créé",
			errorNotification: "Impossible de créer votre modèle de commande",
			clearCache: [GET_QUICKORDERS],
		});
	};
</script>

<TransitionWrapper>
	<PageHeader name="Nouveau modèle de commande" previousPage={QuickOrderRoutes.List} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations en cours.">
		<QuickOrderForm submit={handleSubmit} bind:quickOrder />
	</PageBody>
</TransitionWrapper>
