<script>
	import { getContext } from "svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { RETRY_JOBS } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_JOBS } from "./queries";

	export let onClose, close, jobs;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: RETRY_JOBS,
			variables: { ids: jobs.map((j) => j.id) },
			errorsHandler,
			success: async (res) => handleClose(res),
			successNotification: "La tâche a bien été relancée",
			errorNotification: "Impossible de relancer la tâche",
			clearCache: [GET_JOBS]
		});
		isLoading = false;
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
	{close}
	submitText="Oui"
	icon={faCheck}
	{isLoading}>
	<p class="py-2 leading-5">
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
