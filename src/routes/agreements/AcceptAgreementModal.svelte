<script>
	import {faCheck} from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import {ACCEPT_AGREEMENTS} from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import {GET_AGREEMENTS} from "./queries.js";
	import Roles from "../../enums/Roles";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, agreement;
	const graphQLInstance = GetGraphQLInstance();

	let isLoading = false;
	let selectedDelivery = null;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(ACCEPT_AGREEMENTS, {
				ids: [agreement.id]
			},
			errorsHandler.Uuid,
			GET_AGREEMENTS);

		isLoading = false;

		if (!res.success) {
			// todo
			return;
		}

		await handleClose(res);
	}

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	}
</script>

<ActionConfirm
	{errorsHandler}
	title="Accepter l'accord"
	icon={faCheck}
	{isLoading}
	submit={handleSubmit}
	submitText="Confirmer"
	closeText="Annuler"
	close={() => handleClose({success:false, data:null})}>
	<p class="leading-5 text-gray-600">
		Vous vous apprêtez à accepter l'accord avec {authInstance.isInRole(Roles.Store.Value) ? agreement.delivery.producer.name : agreement.store.name}
	</p>
</ActionConfirm>
