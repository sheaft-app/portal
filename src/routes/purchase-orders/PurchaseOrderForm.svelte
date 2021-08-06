<script>
	import Icon from "svelte-awesome";
	import { onMount, getContext, onDestroy } from "svelte";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import { validators, initialValues } from "./purchaseOrderForm";
	import Select from "../../components/controls/select/Select.svelte";
	import PurchaseOrderProducts from "./PurchaseOrderProducts.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_ACCEPTED_AGREEMENTS } from "./queries";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import form from "../../stores/form";
	import DatePickerWrapper from "../../components/controls/DatePickerWrapper.svelte";

	export let submit,
		purchaseOrder = { ...initialValues },
		isInModal = false,
		close = null;

	const errorsHandler = new SheaftErrors();
	const { query, mutate } = getContext("api");
	let isLoading = false;
	let clients = [];

	(() => (purchaseOrder = form.initialize(purchaseOrder, validators, initialValues)))();

	const handleSubmit = async () => {
		isLoading = true;
		await form.validateAndSubmit(submit);
		isLoading = false;
	};

	onMount(async () => {
		isLoading = true;
		let agreements = await query({
			query: GET_ACCEPTED_AGREEMENTS,
			errorsHandler,
			errorNotification: "La récupération de vos clients a échouée.",
		});

		clients = agreements.map((a) => {
			return {
				...a.store,
				deliveryMode: a.delivery,
				products: a.catalog.products,
			};
		});

		isLoading = false;
	});

	onDestroy(async () => {
		await form.destroy();
	});
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={handleSubmit}>
	<div class={`mb-6 lg:mb-0 ${!isInModal && "lg:w-1/2"}`}>
		<div class="form-control">
			<div class="w-full">
				<label>Magasin *</label>
				<Select
					bind:selectedValue={purchaseOrder.client}
					getOptionLabel={(option) => option.name}
					getSelectionLabel={(option) => option.name}
					optionIdentifier="id"
					disabled={isLoading}
					placeholder="Sélectionnez un magasin"
					items={clients}
				/>
			</div>
			<ErrorContainer field={$form.fields.client} />
		</div>
		<div class="form-control mb-0">
			<label>Date de livraison *</label>
		</div>
		<div class="flex">
			<div class="form-control flex items-center  pr-4">
				<DatePickerWrapper bind:selected={purchaseOrder.expectedDeliveryDate} />
				<ErrorContainer field={$form.fields.expectedDeliveryDate} />
			</div>
			<div class="form-control flex items-center">
				<div class="w-1/3">
					<label for="grid-from" class="p-0">Entre</label>
				</div>
				<div class="w-2/3 pr-4">
					<select
						id="grid-from"
						class="mx-2"
						bind:value={purchaseOrder.from}
						class:disabled={isLoading}
						use:bindClass={{ form: form, name: "from" }}
						disabled={isLoading}
					>
						<option />
						{#each Array(24)
							.fill()
							.map((x, i) => i) as hour}
							<option value={hour}>{hour}h</option>
						{/each}
					</select>
				</div>
				<ErrorContainer field={$form.fields.from} />
			</div>
			<div class="form-control flex items-center">
				<div class="w-1/3 pl-4">
					<label for="grid-to" class="p-0">et</label>
				</div>
				<div class="w-2/3">
					<select
						id="grid-to"
						class="mx-2"
						bind:value={purchaseOrder.to}
						class:disabled={isLoading}
						use:bindClass={{ form: form, name: "to" }}
						disabled={isLoading}
					>
						<option />
						{#each Array(24)
							.fill()
							.map((x, i) => i) as hour}
							<option value={hour}>{hour}h</option>
						{/each}
					</select>
				</div>
			</div>
			<ErrorContainer field={$form.fields.to} />
		</div>
		<PurchaseOrderProducts {errorsHandler} {purchaseOrder} storeProducts={purchaseOrder.client?.products} {form} />
		<div class="form-control pt-4">
			<div class="w-full">
				<label for="grid-comment">Remarques</label>
				<textarea
					bind:value={purchaseOrder.comment}
					class:disabled={isLoading}
					use:bindClass={{ form: form, name: "comment" }}
					disabled={isLoading}
					id="grid-comment"
				/>
			</div>
			<ErrorContainer field={$form.fields.comment} />
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
