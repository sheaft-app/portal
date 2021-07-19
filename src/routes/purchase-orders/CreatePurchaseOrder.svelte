<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import PurchaseOrderRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import PurchaseOrderForm from "./PurchaseOrderForm.svelte";
	import { GET_ORDERS } from "./queries";
	import { CREATE_PURCHASE_ORDER } from "./mutations";
	import { normalizeCreatePurchaseOrder } from "./purchaseOrderForm";
	import form from "../../stores/form";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let purchaseOrder = undefined;

	onMount(async () => {
		isLoading = false;
	});

	const handleSubmit = async () => {
		return await mutate({
			mutation: CREATE_PURCHASE_ORDER,
			variables: normalizeCreatePurchaseOrder(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(PurchaseOrderRoutes.List),
			successNotification: "Votre commande a bien été créée",
			errorNotification: "Impossible de créer votre commande",
			clearCache: [GET_ORDERS],
		});
	};
</script>

<TransitionWrapper>
	<PageHeader name="Nouvelle commande" previousPage={PurchaseOrderRoutes.List} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations de vos clients en cours.">
		<PurchaseOrderForm submit={handleSubmit} bind:purchaseOrder />
	</PageBody>
</TransitionWrapper>
