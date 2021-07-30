<script>
	import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CANCEL_AGREEMENTS } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_AGREEMENTS } from "./queries.js";
	import Roles from "../../enums/Roles";
	import GetAuthInstance from "../../services/SheaftAuth";
	import { getContext } from "svelte";
	import AgreementStatusKind from "../../enums/AgreementStatusKind";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, agreements;

	const { mutate } = getContext("api");
	const authInstance = GetAuthInstance();

	let reason = null;
	let isLoading = false;
	let isProducer = authInstance.isInRole(Roles.Producer.Value);

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CANCEL_AGREEMENTS,
			variables: {
				ids: agreements.map((a) => a.id),
				reason,
			},
			errorsHandler,
			success: async (res) => handleClose({ success: true, data: res }),
			successNotification: "L'accord a bien été annulé",
			errorNotification: "Impossible d'annuler l'accord",
			clearCache: [GET_AGREEMENTS],
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
	title={agreements.length > 1 ? "Annuler les accords" : "Annuler l'accord"}
	level="danger"
	icon={faExclamationTriangle}
	submit={handleSubmit}
	{isLoading}
	submitText="Confirmer"
	closeText="Annuler"
	{close}
>
	{#if agreements.length > 1}
		<p class="leading-5">
			Vous vous apprêtez à annuler les accords avec les {isProducer ? "magasins" : "producteurs"} suivants:
		</p>
		<ul>
			{#each agreements as agreement}
				<li>{isProducer ? agreement.store.name : agreement.producer.name}</li>
			{/each}
		</ul>
		<div class="form-control w-full mt-3">
			<label for="reasonAll"> Raison </label>
			<input bind:value={reason} id="reasonAll" type="text" placeholder="Expliquez brièvement la raison (optionnel)" />
		</div>
	{:else}
		<p class="leading-5">
			Vous vous apprêtez à annuler l'accord avec {isProducer ? agreements[0].store.name : agreements[0].producer.name}.
		</p>
		{#if agreements[0].status.indexOf("WAITING") < 0}
			<div class="form-control w-full mt-3">
				<label for="reason"> Raison </label>
				<input bind:value={reason} id="reason" type="text" placeholder="Expliquez brièvement la raison (optionnel)" />
			</div>
		{/if}
	{/if}
</ActionConfirm>
