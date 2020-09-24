<script>
  import CitySearch from "./../../../components/search/CitySearch.svelte";
  import ErrorContainer from "./../../../components/ErrorContainer.svelte";
  import Loader from "./../../../components/Loader.svelte";
	import { form, bindClass } from '../../../../vendors/svelte-forms/src/index';

  export let company, addressForm, stepper = 4, isStore, submit = () => {};

  let isSearchingAddress = false;

  const resetAddress = () => {
    company.address = {
      line1: null,
      line2: null,
      city: null,
      zipcode: null
    };
  }

  addressForm = form(() => ({
    address: { value: company.address, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });
</script>

<div class="text-center pb-8 px-5">
  Étape finale
  <p class="font-bold text-lg">
    Terminons par l'adresse de votre {isStore ? 'magasin' : 'lieu de production'}
  </p>
  <p class="text-gray-600">Cette adresse sera visible publiquement. Elle doit représenter votre lieu de production principal.</p>
  <p class="text-gray-600">Tapez l'adresse puis cliquez sur celle qui correspond dans la liste.</p>
</div>
{#if isSearchingAddress}
  <div class="w-full h-full md:w-1/2 mb-2 md:mb-0 px-8">
    <Loader />
  </div>
{:else if company.address.line1 && company.address.city && company.address.zipcode}
  <form class="px-8">
    <fieldset>
      <div class="form-control">
        <label for="line1">Adresse*</label>
        <input
          type="text"
          required="required"
          class="disabled"
          disabled={true}
          bind:value={company.address.line1} />
      </div>
      <div class="form-control">
        <label for="line2">Complément d'adresse</label>
        <input
          id="line2"
          type="text"
          bind:value={company.address.line2} />
      </div>
      <div class="flex">
        <div class="w-full form-control pr-2">
          <label for="zipcode">Code postal*</label>
          <input
            id="zipcode"
            type="text"
            required="required"
            maxlength="5"
            class="disabled"
            disabled={true}
            bind:value={company.address.zipcode} />
        </div>
        <div class="w-full md:w-1/2 form-control">
          <label for="city">Ville*</label>
          <input
            id="city"
            type="text"
            required="required"
            class="disabled"
            disabled={true}
            bind:value={company.address.city} />
        </div>
      </div>
      <p class="mt-2">
        <button class="btn-link" on:click={resetAddress}>
          Modifier l'adresse
        </button>
      </p>
    </fieldset>
  </form>
{:else}
  <div class="px-8">
    <div class="w-full form-control" style="display: block;">
      <CitySearch
        bind:selectedAddress={company.address}
        bindClassData={{ form: addressForm, name: "address" }}
        initialValue={company.address} />
    </div>
    <ErrorContainer field={$addressForm.fields.address} />
  </div>
{/if}

<div class="flex w-full justify-center mt-5">
  <div>
    <button
      on:click={() => stepper--}
      aria-label="Retour"
      class="form-button uppercase text-sm cursor-pointer text-gray-600
      rounded-full px-6 py-2 flex items-center justify-center m-auto border border-gray-600 mr-2">
      Précédent
    </button>
  </div>
  <div>
    <button
      on:click={submit}
      aria-label="Valider"
      class:disabled={!$addressForm.valid}
      class="form-button uppercase text-sm cursor-pointer text-white
      shadow rounded-full px-6 py-2 flex items-center justify-center
      m-auto bg-primary">
      Terminer
    </button>
  </div>
</div>