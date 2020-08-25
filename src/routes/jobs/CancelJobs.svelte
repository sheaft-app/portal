<script>
	import Icon from "svelte-awesome";
	import { faTimes } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CANCEL_JOBS } from "./mutations.js";
	import GetNotificationsInstance from "./../../services/SheaftNotifications";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import SheaftErrors from "./../../services/SheaftErrors";
import { GET_JOBS } from "./queries";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, jobs;
	const notificationsInstance = GetNotificationsInstance();
	const graphQLInstance = GetGraphQLInstance();

	let reason = null;
	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			CANCEL_JOBS,
			{
				ids: jobs.map((j) => j.id),
				reason: reason,
			},
			errorsHandler.Uuid,
			GET_JOBS
    );
    
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		await handleClose(res);
	};

	const handleClose = async (res) => {
		close();

		if (onClose) await onClose(res);
	};
</script>

<ActionConfirm
	{errorsHandler}
	title={jobs.length > 1 ? 'Annuler les tâches' : 'Annuler la tâche'}
	submit={handleSubmit}
	close={() => handleClose({ success: false, data: null })}
	level="danger"
	submitText="Oui"
	icon={faTimes}
	{isLoading}
	closeText="Non">
	<p class="py-2 leading-5 text-gray-500">
		Êtes-vous sûr de vouloir annuler {jobs.length > 1 ? 'ces tâches' : 'cette tâche'}
		?
	</p>
	<p class="py-2 leading-5 text-gray-500">
		Vous pouvez spécifier une raison pour l'annulation de {jobs.length > 1 ? 'ces tâches' : 'cette tâche'}.
	</p>
	<label>Raison</label>
	<input type="text" bind:value={reason} />
</ActionConfirm>

<style lang="scss">
	button {
		&.selected {
			background-color: #33d7a3;
			color: #ffffff;
		}
	}
</style>
