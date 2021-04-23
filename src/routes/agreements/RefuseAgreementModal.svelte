<script>
	import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import {REFUSE_AGREEMENTS} from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import {GET_AGREEMENTS} from "./queries.js";
	import Roles from "../../enums/Roles";
	import GetAuthInstance from "../../services/SheaftAuth";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, agreements;

	const graphQLInstance = GetGraphQLInstance();
	const authInstance = GetAuthInstance();

	let reason = null;
	let isLoading = false;
	let isProducer = authInstance.isInRole(Roles.Producer.Value);

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(REFUSE_AGREEMENTS, {
				ids: agreements.map(a => a.id),
				reason
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
	title={agreements.length > 1 ? "Refuser les accords": "Refuser l'accord"}
	level="danger"
	icon={faExclamationTriangle}
	submit={handleSubmit}
	{isLoading}
	submitText="Confirmer"
	closeText="Annuler"
	close={() => handleClose({success:false, data:null})}>
	{#if agreements.length > 1}
		<p class="leading-5">
			Vous vous apprêtez à refuser les demandes d'accords des {isProducer ? "magasins" : "producteurs"} suivants:
		</p>
		<ul>
			{#each agreements as agreement}
				<li>{isProducer ? agreement.store.name : agreement.producer.name}</li>
			{/each}
		</ul>
	{:else}
		<p class="leading-5">
			Vous vous apprêtez à refuser la demande d'accord
			de {isProducer ? agreements[0].store.name : agreements[0].producer.name}.
		</p>
	{/if}
	<div class="form-control w-full mt-3">
		<label
			for="reason">
			Raison
		</label>
		<input
			bind:value={reason}
			id="reason"
			type="text"
			placeholder="Expliquez brièvement la raison (optionnel)"/>
	</div>
</ActionConfirm>
