<script>
  import { onDestroy } from "svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import { bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import form from "../../stores/form";
  import { validators, initialValues } from "./returnableForm";

  export let submit, returnable = { ...initialValues }, isInModal = false, close = null;

  returnable = form.initialize(returnable, validators, initialValues);

  onDestroy(async () => {
    await form.destroy();
  });

  const selectVat = (vat) => {
    return returnable.vat = vat;
  }
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={async () => await form.validateAndSubmit(submit)}>
  <div class={`mb-6 lg:mb-0 ${!isInModal && "lg:w-1/2"}`}>
    <div class="form-control">
      <div class="w-full">
        <label for="grid-product">Nom de la consigne *</label>
        <input
          bind:value={returnable.name}
          class:disabled={$form.isSubmitting}
          use:bindClass={{ form: form, name: "name" }}
          disabled={$form.isSubmitting}
          id="grid-product"
          type="text"
          placeholder="Pot en verre" />
      </div>
      <ErrorContainer field={$form.fields.name}/>
    </div>
    <div class="form-control">
      <div class="flex w-full">
        <div class="w-full pr-2">
          <label for="grid-price">Prix HT *</label>
          <input
            bind:value={returnable.wholeSalePrice}
            class:disabled={$form.isSubmitting}
            use:bindClass={{ form: form, name: "wholeSalePrice" }}
            disabled={$form.isSubmitting}
            id="grid-price"
            type="number"
            step=".01"
            placeholder="0.50" />
          <ErrorContainer field={$form.fields.wholeSalePrice}/>
        </div>
        <div class="w-full">
          <label>TVA *</label>
          <div class="w-full text-lg justify-center button-group" use:bindClass={{ form: form, name: "vat" }}>
            <button
              on:click={() => selectVat(5.5)}
              type="button"
              class="text-sm md:text-base"
              class:selected={returnable.vat === 5.5}
              class:disabled={$form.isSubmitting}>
              5,5%
            </button>
            <button
              on:click={() => selectVat(10)}
              type="button"
              class="text-sm md:text-base"
              class:selected={returnable.vat === 10}
              class:disabled={$form.isSubmitting}>
              10%
            </button>
            <button
              on:click={() => selectVat(20)}
              type="button"
              class="text-sm md:text-base"
              class:selected={returnable.vat === 20}
              class:disabled={$form.isSubmitting}>
              20%
            </button>
          </div>
          <ErrorContainer field={$form.fields.vat}/>
        </div>
      </div>
    </div>
    <div class="form-control">
      <div class="w-full">
        <label for="grid-description">Description</label>
        <textarea
          bind:value={returnable.description}
          id="grid-description"
          class:disabled={$form.isSubmitting}
          disabled={$form.isSubmitting}
          type="text"
          style="min-height:150px;" />
      </div>
    </div>
  </div>
  <p class="text-sm mt-5">* champs requis</p>
  <div class="form-control mt-5">
    {#if isInModal && close}
      <button
        type="button"
        class:disabled={$form.isSubmitting}
        on:click={close}
        disabled={$form.isSubmitting}
        class="btn bg-white shadow btn-lg justify-center w-full md:w-auto lg:mr-2 mr-0 mb-2 lg:mb-0">
        Fermer
      </button>
    {/if}
    <button
      type="submit"
      class:disabled={$form.isSubmitting || !$form.valid}
      class="btn btn-primary btn-xl justify-center w-full md:w-auto">
      <Icon
        data={$form.isSubmitting ? faCircleNotch : faPaperPlane}
        class="mr-2 inline"
        spin={$form.isSubmitting} />
      Valider
    </button>
  </div>
</form>
