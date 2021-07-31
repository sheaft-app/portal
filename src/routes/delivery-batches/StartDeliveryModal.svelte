<script>
	import { getContext } from "svelte";
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_DELIVERY_BATCHES } from "./queries";
	import { START_DELIVERY_BATCH } from "./mutations";
	import DeliveryBatchesRoutes from "./routes";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import GetRouterInstance from "../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";

	export let id, close;

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { mutate } = getContext("api");

	let isLoading = false;

	const submit = async () => {
		isLoading = true;
		await mutate({
			mutation: START_DELIVERY_BATCH,
			variables: { id, startFirstDelivery: true },
			errorsHandler,
			success: (res) => routerInstance.goTo(DeliveryBatchesRoutes.Process, { id: res.id }),
			errorNotification: "Impossible de démarrer la livraison",
			clearCache: [GET_DELIVERY_BATCHES],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Lancer la livraison"
	{submit}
	{isLoading}
	{close}
	submitText="Lancer"
	icon={faCheck}
	closeText="Fermer"
>
	<p class="pt-2 pb-1 leading-5">Vous vous apprêtez à démarrer la livraison.</p>
</ActionConfirm>
