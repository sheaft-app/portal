<script>
	import { getContext } from "svelte";
	import { GET_PICKINGS } from "../queries";
	import { SET_PICKING_PRODUCT_PREPARED_QUANTITY } from "../mutations";
	import ActionConfirm from "../../../components/modal/ActionConfirm.svelte";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import SheaftErrors from "../../../services/SheaftErrors";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import PreparationRoutes from "../routes";
	import { authUserAccount } from "./../../../stores/auth.js";

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let close, variables;

	let isSubmitting = false;
	let preparedBy = $authUserAccount.profile.given_name;

	const handleSubmit = async () => {
		isSubmitting = true;
		await mutate({
			mutation: SET_PICKING_PRODUCT_PREPARED_QUANTITY,
			variables,
			errorsHandler,
			success: () => routerInstance.goTo(PreparationRoutes.Process, { id: variables.id }),
			successNotification: "Préparation du produit terminée",
			errorNotification: "Impossible de terminer la préparation du produit",
			clearCache: [variables.id, GET_PICKINGS],
		});
		isSubmitting = true;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Valider la préparation du produit"
	icon={faCheck}
	isLoading={isSubmitting}
	submit={handleSubmit}
	submitText="Confirmer"
	closeText="Annuler"
	{close}
>
	<div class="form-control">
		<label>Préparé par</label>
		<input bind:value={preparedBy} />
	</div>
</ActionConfirm>
