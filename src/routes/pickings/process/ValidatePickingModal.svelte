<script>
	import { getContext } from "svelte";
	import { GET_PICKINGS } from "../queries";
	import { COMPLETE_PICKING } from "../mutations";
	import ActionConfirm from "../../../components/modal/ActionConfirm.svelte";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import SheaftErrors from "../../../services/SheaftErrors";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import PickingRoutes from "../routes";
	import { authUserAccount } from "../../../stores/auth.js";

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let close, variables, save = () => {};

	let isSubmitting = false;
	let preparedBy = $authUserAccount.profile.given_name;

	const handleSubmit = async () => {
		isSubmitting = true;
		await save();
		await mutate({
			mutation: COMPLETE_PICKING,
			variables,
			errorsHandler,
			success: () => routerInstance.goTo(PickingRoutes.List),
			errorNotification: "Impossible de terminer la préparation",
			clearCache: [variables.id, GET_PICKINGS],
		});
		isSubmitting = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Valider la préparation"
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
