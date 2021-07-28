<script>
	import { getContext } from "svelte";
	import { faTimes } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CANCEL_JOBS } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_JOBS } from "./queries";

	export let onClose, close, jobs;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let reason = null;
	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CANCEL_JOBS,
			variables: { ids: jobs.map((j) => j.id), reason },
			errorsHandler,
			success: async (res) => handleClose({ success: true, data: res }),
			successNotification: "La tâche a bien été annulée",
			errorNotification: "Impossible d'annuler la tâche",
			clearCache: [GET_JOBS],
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
	title={jobs.length > 1 ? "Annuler les tâches" : "Annuler la tâche"}
	submit={handleSubmit}
	{close}
	level="danger"
	submitText="Oui"
	icon={faTimes}
	{isLoading}
	closeText="Non"
>
	<p class="py-2 leading-5">
		Êtes-vous sûr de vouloir annuler {jobs.length > 1 ? "ces tâches" : "cette tâche"}
		?
	</p>
	<p class="py-2 leading-5">
		Vous pouvez spécifier une raison pour l'annulation de {jobs.length > 1 ? "ces tâches" : "cette tâche"}.
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
