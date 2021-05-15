<script>
  import Icon from "svelte-awesome";
  import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
	import Toggle from "./../../components/controls/Toggle.svelte";
  import ErrorContainer from "../../components/ErrorContainer.svelte";
  import CatalogProducts from "./CatalogProducts.svelte";
import CatalogKind from "../../enums/CatalogKind";

  export let submit, catalog, isLoading;

  const catalogForm = form(() => ({
    name: { value: catalog.name, validators: ['required', 'min:3'], enabled: true },
    available: { value: catalog.available, validators: ['required'], enabled: true },
    isDefault: { value: catalog.isDefault, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });

  let invalidCatalogProducts = false;

  const handleSubmit = () => {
    catalogForm.validate();

    if ($catalogForm.valid && !isLoading) {
      submit();
    }
  }
</script>

<form class="w-full" on:submit|preventDefault={handleSubmit}>
  <div class={`mb-6 lg:mb-0`}>
    <div class="form-control">
      <div class="w-full">
        <label for="grid-product">Nom du catalogue *</label>
        <input
          bind:value={catalog.name}
          class:disabled={isLoading}
          use:bindClass={{ form: catalogForm, name: "name" }}
          disabled={isLoading}
          id="grid-product"
          type="text"
          placeholder="Catalogue petits magasins été" />
      </div>
      <ErrorContainer field={$catalogForm.fields.name}/>
    </div>
  </div>
  {#if catalog.id && catalog.id.length > 0}
    <div class={`mb-6 lg:mb-0`}>
      <div class="form-control">
        <div class="w-full">
          <label for="type-catalog">Affichage</label>
          <input
            value={CatalogKind.label(catalog.kind)}
            class="disabled"
            disabled
            id="type-catalog"
            type="text"
            placeholder="Affichage du catalogue aux cibles" />
        </div>
      </div>
    </div>
  {/if}
  <div class="form-control" style="display: block;">
		<label>Disponible</label>
		<Toggle
			labelPosition="left"
			disabled={isLoading}
			classNames="ml-1"
			bind:isChecked={catalog.available}>
		</Toggle>
  </div>

  {#if catalog.kind == CatalogKind.Stores.Value}
    <div class="form-control" style="display: block;">
      <label>Utiliser comme catalogue par défaut pour les professionels</label>
      <Toggle
        labelPosition="left"
        disabled={isLoading}
        classNames="ml-1"
        bind:isChecked={catalog.isDefault}>
      </Toggle>
    </div>
  {/if}
  <CatalogProducts catalog={catalog} bind:invalidCatalogProducts />
  <p class="text-sm mt-5">* champs requis</p>
  <div class="form-control mt-5">
    <button
      type="submit"
      disabled={isLoading || invalidCatalogProducts}
      class:disabled={isLoading || !$catalogForm.valid || invalidCatalogProducts}
      class="btn btn-primary btn-xl justify-center w-full md:w-auto">
      <Icon
        data={isLoading ? faCircleNotch : faPaperPlane}
        class="mr-2 inline"
        spin={isLoading} />
      Valider
    </button>
  </div>
</form>
