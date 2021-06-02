<script>
	import Icon from "svelte-awesome";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import { form, bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import { validators, initialValues } from "./returnableForm";

	export let submit,
		returnable = { ...initialValues },
		isInModal = false,
		close = null;
	
	let isLoading = false;

	const returnableForm = form(() => validators(returnable), { initCheck: false });
	
	const handleSubmit = async () => {
		returnableForm.validate();
		if ($returnableForm.valid) {
			isLoading = true;
			await submit();
			isLoading = false;
		}
	}

	const selectVat = (vat) => (returnable.vat = vat);
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={handleSubmit}>
	<div class={`mb-6 lg:mb-0 ${!isInModal && "lg:w-1/2"}`}>
		<div class="form-control">
			<div class="w-full">
				<label for="grid-product">Nom de la consigne *</label>
				<input
					bind:value={returnable.name}
					class:disabled={isLoading}
					use:bindClass={{ form: returnableForm, name: "name" }}
					disabled={isLoading}
					id="grid-product"
					type="text"
					placeholder="Pot en verre"
				/>
			</div>
			<ErrorContainer field={$returnableForm.fields.name} />
		</div>
		<div class="form-control">
			<div class="flex w-full">
				<div class="w-full pr-2">
					<label for="grid-price">Prix HT *</label>
					<input
						bind:value={returnable.wholeSalePrice}
						class:disabled={isLoading}
						use:bindClass={{ form: returnableForm, name: "wholeSalePrice" }}
						disabled={isLoading}
						id="grid-price"
						type="number"
						step=".01"
						placeholder="0.50"
					/>
					<ErrorContainer field={$returnableForm.fields.wholeSalePrice} />
				</div>
				<div class="w-full">
					<label>TVA *</label>
					<div class="w-full text-lg justify-center button-group" use:bindClass={{ form: returnableForm, name: "vat" }}>
						<button
							on:click={() => selectVat(5.5)}
							type="button"
							class="text-sm md:text-base"
							class:selected={returnable.vat === 5.5}
							class:disabled={isLoading}
						>
							5,5%
						</button>
						<button
							on:click={() => selectVat(10)}
							type="button"
							class="text-sm md:text-base"
							class:selected={returnable.vat === 10}
							class:disabled={isLoading}
						>
							10%
						</button>
						<button
							on:click={() => selectVat(20)}
							type="button"
							class="text-sm md:text-base"
							class:selected={returnable.vat === 20}
							class:disabled={isLoading}
						>
							20%
						</button>
					</div>
					<ErrorContainer field={$returnableForm.fields.vat} />
				</div>
			</div>
		</div>
		<div class="form-control">
			<div class="w-full">
				<label for="grid-description">Description</label>
				<textarea
					bind:value={returnable.description}
					id="grid-description"
					class:disabled={isLoading}
					disabled={isLoading}
					type="text"
					style="min-height:150px;"
				/>
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
			class:disabled={isLoading || !$returnableForm.valid}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto"
		>
			<Icon data={isLoading ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={isLoading} />
			Valider
		</button>
	</div>
</form>
