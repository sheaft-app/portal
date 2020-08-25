<script>
	import Icon from "svelte-awesome";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { RETRY_JOBS } from "./mutations.js";
	import GetNotificationsInstance from "./../../services/SheaftNotifications";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import SheaftErrors from "./../../services/SheaftErrors";
import { GET_JOBS } from "./queries";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, jobs;
	const notificationsInstance = GetNotificationsInstance();
	const graphQLInstance = GetGraphQLInstance();

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			RETRY_JOBS,
			{
				ids: jobs.map((j) => j.id),
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
	title={jobs.length > 1 ? 'Réinitialiser les tâches' : 'Réinitialiser la tâche'}
	submit={handleSubmit}
	close={() => handleClose({ success: false, data: null })}
	level="success"
	submitText="Oui"
	icon={faCheck}
	{isLoading}>
	<p class="py-2 leading-5 text-gray-500">
		Êtes-vous sûr de vouloir réinitialiser {jobs.length > 1 ? 'ces tâches' : 'cette tâche'}
		?
	</p>
</ActionConfirm>

<style lang="scss">
	button {
		&.selected {
			background-color: #33d7a3;
			color: #ffffff;
		}
	}
</style>
