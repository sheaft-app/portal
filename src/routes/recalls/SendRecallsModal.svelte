<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { QUEUE_SEND_RECALL } from "./mutations.js";
	import { GET_RECALLS } from "./queries.js";
	import { getContext } from "svelte";
	import SheaftErrors from "./../../services/SheaftErrors";

	const errorsHandler = new SheaftErrors();
	const { mutate, isLoading } = getContext("api");

	export let selectedItems, close, onClose;

	const handleSubmit = async () => {
		await mutate({
			mutation: QUEUE_SEND_RECALL,
			variables: {
				ids: selectedItems.map((s) => s.id),
			},
			errorsHandler,
			success: async (res) => await handleClose({ success: true }),
			successNotification: "L'envoi de votre campagne de rappel est en cours",
			errorNotification: "Impossible d'envoyer cette campagne de rappel",
			clearCache: [GET_RECALLS],
		});
	};

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};
</script>

<ActionConfirm
	title={selectedItems.length > 1 ? "Envoyer les campagnes de rappel" : "Envoyer la campagne de rappel"}
	level="info"
	isLoading={$isLoading}
	submit={handleSubmit}
	{errorsHandler}
	close={() => handleClose({ success: false, data: null })}
>
	<p class="py-4">Cette opération va lancer l'envoi des campagnes suivante:</p>
	<ul>
		{#each selectedItems as recall}
			<li>{recall.name} ({recall.clientsCount} clients)</li>
		{/each}
	</ul>
</ActionConfirm>
