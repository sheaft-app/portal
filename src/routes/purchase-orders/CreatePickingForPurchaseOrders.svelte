<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CREATE_PICKING } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_ORDERS } from "./queries";
	import { getContext } from "svelte";
	import PickingRoutes from "../pickings/routes";

	export let onClose, close, purchaseOrders;

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { mutate } = getContext("api");

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_PICKING,
			variables: {
				autostart: true,
				purchaseOrderIds: purchaseOrders.map((po) => po.id),
			},
			success: async (res) => await routerInstance.goTo(PickingRoutes.Process, { id: res.id }),
			errorsHandler,
			errorNotification: "Impossible de créer la préparation",
			clearCache: [GET_ORDERS],
		});
		isLoading = false;
	};

	const handleClose = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	};
</script>

<ActionConfirm
	{errorsHandler}
	title={purchaseOrders.length > 1 ? "Préparer ces commandes" : "Préparer cette commande"}
	icon={faCheck}
	submitText="Préparer"
	closeText="Fermer"
	submit={handleSubmit}
	{isLoading}
	{close}
>
	<p class="leading-5">
		Préparer {purchaseOrders.length > 1 ? "ces commandes" : "cette commande"}
		notifiera automatiquement votre client que vous avez débuté la préparation de sa commande.
	</p>
</ActionConfirm>
