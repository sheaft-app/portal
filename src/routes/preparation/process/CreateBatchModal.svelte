<script>
	import ActionConfirm from "../../../components/modal/ActionConfirm.svelte";
	import { CREATE_BATCH } from "../mutations";
	import { getContext } from "svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import SheaftErrors from "../../../services/SheaftErrors";
	import { getIsoDate } from "../../../helpers/app";
	import DatePickerWrapper from "./../../../components/controls/DatePickerWrapper.svelte";
	import { GET_BATCHES } from "../queries";

	export let close, onClose;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let number,
		expirationDate,
		dlcOrDluo = "dlc",
		comment = null,
		isLoading = false;

	const handleSubmit = async () => {
		await mutate({
			mutation: CREATE_BATCH,
			variables: {
				number,
				dlc: dlcOrDluo == "dlc" ? getIsoDate(expirationDate) : null,
				ddm: dlcOrDluo == "ddm" ? getIsoDate(expirationDate) : null,
				comment,
			},
			errorsHandler,
			success: async (res) => {
				await onClose(res);
				close();
			},
			errorNotification: "Impossible de créer le lot",
			clearCache: [GET_BATCHES],
		});
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Créer un lot"
	submit={handleSubmit}
	{isLoading}
	{close}
	valid={number && expirationDate}
	submitText="Confirmer"
	icon={faCheck}
	closeText="Fermer"
>
	<div class="form-control text-left">
		<label for="batch">Numéro du lot *</label>
		<input bind:value={number} id="batch" type="text" />
	</div>
	<div class="form-control">
		<div class="flex w-full">
			<div class="w-full">
				<div class="w-full text-lg justify-center button-group">
					<button
						on:click={() => (dlcOrDluo = "dlc")}
						type="button"
						class="text-sm md:text-base"
						class:selected={dlcOrDluo == "dlc"}
						class:skeleton-box={isLoading}
					>
						DLC
					</button>
					<button
						on:click={() => (dlcOrDluo = "ddm")}
						type="button"
						class="text-sm md:text-base"
						class:selected={dlcOrDluo == "ddm"}
						class:skeleton-box={isLoading}
					>
						DDM
					</button>
				</div>
			</div>
		</div>
	</div>
	<div class="form-control text-left" style="display:block;">
		<label>{dlcOrDluo == "dlc" ? "DLC *" : "DDM *"}</label>
		<DatePickerWrapper bind:selected={expirationDate} dateChosen={true} />
	</div>
	<div class="form-control text-left">
		<label for="comment">Commentaire</label>
		<textarea bind:value={comment} id="comment" type="text" />
	</div>

	<small>* champs requis</small>
</ActionConfirm>
