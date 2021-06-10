<script>
	import { onDestroy } from "svelte";
	import Icon from "svelte-awesome";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import form from "../../stores/form";
	import { validators, initialValues } from "./catalogForm";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import ErrorContainer from "../../components/ErrorContainer.svelte";
	import CatalogProducts from "./CatalogProducts.svelte";
	import CatalogKind from "../../enums/CatalogKind";

	export let submit,
		catalog = { ...initialValues },
		errorsHandler;

	(() => (catalog = form.initialize(catalog, validators, initialValues)))();

	let invalidCatalogProducts = false;

	onDestroy(async () => {
		await form.destroy();
	});
</script>

<form class="w-full" on:submit|preventDefault={() => form.validateAndSubmit(submit)}>
	<div class={`mb-6 lg:mb-0`}>
		<div class="form-control">
			<div class="w-full">
				<label for="grid-product">Nom du catalogue *</label>
				<input
					bind:value={catalog.name}
					class:disabled={$form.isSubmitting}
					use:bindClass={{ form, name: "name" }}
					disabled={$form.isSubmitting}
					id="grid-product"
					type="text"
					placeholder="Catalogue GMS"
				/>
			</div>
			<ErrorContainer field={$form.fields.name} />
		</div>
	</div>
	{#if catalog.id && catalog.id.length > 0}
		<div class={`mb-6 lg:mb-0`}>
			<div class="form-control">
				<div class="w-full">
					<label for="type-catalog">Visible par les</label>
					<input
						value={CatalogKind.label(catalog.kind)}
						class="disabled"
						disabled
						id="type-catalog"
						type="text"
						placeholder="Affichage du catalogue aux cibles"
					/>
				</div>
			</div>
		</div>
	{/if}
	<div class="form-control" style="display: block;">
		<label>Actif</label>
		<Toggle labelPosition="left" disabled={$form.isSubmitting} classNames="ml-1" bind:isChecked={catalog.available} />
	</div>

	{#if catalog.kind == CatalogKind.Stores.Value}
		<div class="form-control" style="display: block;">
			<label>Utiliser comme catalogue par défaut pour les professionels</label>
			<Toggle labelPosition="left" disabled={$form.isSubmitting} classNames="ml-1" bind:isChecked={catalog.isDefault} />
		</div>
	{/if}
	<CatalogProducts {catalog} {errorsHandler} bind:invalidCatalogProducts />
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		<button
			type="submit"
			disabled={$form.isSubmitting || invalidCatalogProducts}
			class:disabled={$form.isSubmitting || !$form.valid || invalidCatalogProducts}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto"
		>
			<Icon data={$form.isSubmitting ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={$form.isSubmitting} />
			Valider
		</button>
	</div>
</form>
