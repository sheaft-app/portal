<script>
	import Icon from "svelte-awesome";
	import { onMount, getContext, onDestroy } from "svelte";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import { validators, initialValues } from "./recallForm";
	import SheaftErrors from "../../services/SheaftErrors";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import form from "../../stores/form";
	import DatePickerWrapper from "../../components/controls/DatePickerWrapper.svelte";
	import RecallBatches from "./RecallBatches.svelte";
	import RecallProducts from "./RecallProducts.svelte";

	export let submit,
		recall = { ...initialValues },
		isInModal = false,
		close = null;

	const errorsHandler = new SheaftErrors();
	const { query, mutate } = getContext("api");
	let isLoading = false;
	let producers = [];

	(() => (recall = form.initialize(recall, validators, initialValues)))();

	const handleSubmit = async () => {
		isLoading = true;
		await form.validateAndSubmit(submit);
		isLoading = false;
	};

	onDestroy(async () => {
		await form.destroy();
	});
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={handleSubmit}>
	<div class={`mb-6 lg:mb-0 ${!isInModal && "lg:w-1/2"}`}>
		<div class="form-control">
			<div class="w-full">
				<label for="grid-product">Nom *</label>
				<input
					bind:value={recall.name}
					use:bindClass={{ form, name: "name" }}
					class:skeleton-box={isLoading}
					disabled={isLoading}
					name="name"
					id="grid-product"
					type="text"
					placeholder="ex : Rappel yaourts vanille 420gr"
				/>
				<ErrorContainer field={$form.fields.name} />
			</div>
		</div>
		<div class="form-control">
			<label>Début de commercialisation *</label>
			<DatePickerWrapper bind:selected={recall.saleStartedOn} dateChosen={false} />
			<ErrorContainer field={$form.fields.saleStartedOn} />
		</div>
		<div class="form-control">
			<label>Fin de commercialisation *</label>
			<DatePickerWrapper bind:selected={recall.saleEndedOn} dateChosen={false} />
			<ErrorContainer field={$form.fields.saleEndedOn} />
		</div>
		<div class="form-control">
			<div class="w-full">
				<label>Produits concernés *</label>
				<RecallProducts {recall} {errorsHandler} />
				<ErrorContainer field={$form.fields.products} />
			</div>
		</div>
		<div class="form-control">
			<div class="w-full">
				<label>Lots concernés</label>
				<RecallBatches {recall} {errorsHandler} />
				<ErrorContainer field={$form.fields.batches} />
			</div>
		</div>
		<div class="form-control mt-4">
			<div class="w-full">
				<label for="grid-description">Description *</label>
				<textarea
					bind:value={recall.comment}
					use:bindClass={{ form, name: "comment" }}
					class:skeleton-box={isLoading}
					disabled={isLoading}
					name="grid-description"
					id="grid-description"
					type="text"
				/>
				<ErrorContainer field={$form.fields.comment} />
			</div>
		</div>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		{#if isInModal && close}
			<button
				type="button"
				class:disabled={isLoading}
				on:click={close}
				disabled={isLoading}
				class="btn bg-white shadow btn-lg justify-center w-full md:w-auto lg:mr-2 mr-0 mb-2 lg:mb-0"
			>
				Fermer
			</button>
		{/if}
		<button
			type="submit"
			class:disabled={isLoading || !$form.valid}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto"
		>
			<Icon data={isLoading ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={isLoading} />
			Valider
		</button>
	</div>
</form>
