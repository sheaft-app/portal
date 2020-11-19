<script>
  import CitySearch from "./../../../components/search/CitySearch.svelte";
  import ErrorContainer from "./../../../components/ErrorContainer.svelte";
  import InputCheckbox from "./../../../components/controls/InputCheckbox.svelte";
  import Loader from "./../../../components/Loader.svelte";
  import Icon from "svelte-awesome";
  import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { config } from "../../../configs/config";

  export let company, stepper = 4, isStore, submit = () => {};

  let isSearchingAddress = false;
  let valid = false;
  let acceptCgv = false;
  let acceptMangoCgv = false;

  const resetAddress = () => {
    company.address = {
      line1: null,
      line2: null,
      city: null,
      zipcode: null
    };
  }

  const handleKeydown = (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      submit();
    }
  }
  
  $: valid = company.address && company.address.line1 && company.address.city && company.address.zipcode && acceptCgv && acceptMangoCgv;
</script>

<svelte:window on:keydown={handleKeydown}/>

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
      <div class="mt-2">
        <label class="cursor-pointer">
          <InputCheckbox
            checked={acceptCgv}
            onClick={() => (acceptCgv = !acceptCgv)} />
          Je reconnais avoir lu et compris
          <a href="https://www.sheaft.com/legals-pro" target="_blank">
            les conditions générales de vente et d'utilisation
          </a>
          et je les accepte
        </label>
      </div>
      <div class="mt-2">
        <label class="cursor-pointer">
          <InputCheckbox
            checked={acceptMangoCgv}
            onClick={() => (acceptMangoCgv = !acceptMangoCgv)} />
          Je reconnais avoir lu et compris
          <a href="{config.content + '/resources/legals/Mangopay_Terms-FR.pdf'}" target="_blank">
            les conditions générales d'utilisation de services de paiement de MangoPay,
          </a>
          notre tiers de paiement, et je les accepte
        </label>
      </div>
    </fieldset>
  </form>
{:else}
  <div class="px-8">
    <div class="w-full form-control" style="display: block;">
      <CitySearch
        bind:selectedAddress={company.address}
        placeholder="Entrez l'adresse de votre lieu de production"
        initialValue={company.address} />
    </div>
    <small class="text-gray-600"><Icon data={faInfoCircle} scale="0.8" class="mr-2" />Tapez une adresse puis sélectionnez la correspondance dans la liste.</small>
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
      disabled={!valid}
      class:disabled={!valid}
      class="form-button uppercase text-sm cursor-pointer text-white
      shadow rounded-full px-6 py-2 flex items-center justify-center
      m-auto bg-primary">
      Terminer
    </button>
  </div>
</div>