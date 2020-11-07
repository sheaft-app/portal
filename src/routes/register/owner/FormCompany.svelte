<script>
  import { form, bindClass } from '../../../../vendors/svelte-forms/src/index';
  import { slide } from "svelte/transition";
  import ErrorContainer from "./../../../components/ErrorContainer.svelte";
  import CountrySelect from "./../../../components/controls/CountrySelect.svelte";
  import LegalKind from "./../../../enums/LegalKind";
  import Icon from "svelte-awesome";
  import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
  import Cleave from "cleave.js";
  import "cleave.js/dist/addons/cleave-phone.fr";
  
  export let company, vat, isStore = false, stepper = 1, errorsHandler = null, invalidSiret = false;

  let cleave = null;

  const companyForm = form(() => ({
    name: { value: company.name, validators: ['required'], enabled: true },
    kind: { value: company.legals.kind, validators: ['required'], enabled: true },
    email: { value: company.legals.email, validators: ['required', 'email'], enabled: true },
    line1: { value: company.legals.address.line1, validators: ['required'], enabled: true },
    zipcode: { value: company.legals.address.zipcode, validators: ['required'], enabled: true },
    city: { value: company.legals.address.city, validators: ['required'], enabled: true },
    country: { value: company.legals.address.country, validators: ['required'], enabled: true },
	}), {
    initCheck: false
  });

  const selectKind = (kind) => company.legals.kind = kind;

  const next = () => {
    companyForm.validate();

    if ($companyForm.valid) {
      ++stepper;
    }
  }

  const handleKeydown = (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      next();
    }
  }
  
  const initializeCleave = () => {
    cleave = new Cleave('.input-phone', {
      phone: true,
      phoneRegionCode: "fr"
    });
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="text-center pb-8 px-5">
  Étape 2/5
  <p class="font-bold text-xl">
    Identifiez votre {isStore ? 'magasin' : 'entreprise'}
  </p>
</div>
{#if invalidSiret}
  <div class="mb-3 p-4 border border-orange-500 text-orange-500 lg:flex flex-row" in:slide>
    <div class="text-center lg:text-left" style="word-break: break-word;">
      <p class="font-semibold">SIRET {company.legals.siret} introuvable</p>
      <p class="mt-2">Nous n'avons pas réussi à récupérer les informations pour ce SIRET.</p>
      <p>Si vous êtes sûr que votre SIRET est bien valide, vous pouvez ignorer ce message.</p>
      <button class="btn btn-link mt-2" on:click={() => --stepper}>Modifier le SIRET</button>
    </div>
  </div>
{/if}
<form>
  <fieldset>
    <div class="flex flex-wrap w-full shadow lg:rounded mb-5">
      <div class="px-5 py-3 bg-white lg:w-6/12 w-full">
        <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center">
          <p>Infos générales</p>
        </div>
        <div class="w-full mb-2 md:mb-0 form-control">
          <label for="name">
            Nom {isStore ? 'du magasin' : "de l'entreprise"} *
          </label>
          <input
            id="name"
            type="text"
            placeholder="ex : GAEC Fromages du Cantal"
            use:bindClass={{ form: companyForm, name: "name" }}
            bind:value={company.name} />
          <ErrorContainer field={$companyForm.fields.name} />
        </div>
        <div class="w-full form-control">
          <label for="grid-kind">Forme juridique *</label>
          <div class="w-full text-xs justify-center button-group" use:bindClass={{ form: companyForm, name: "kind" }}>
            <button
              on:click={() => selectKind(LegalKind.Organization.Value)}
              type="button"
              class:selected={company.legals.kind === LegalKind.Organization.Value}>
              {LegalKind.Organization.Label}
            </button>
            <button
              on:click={() => selectKind(LegalKind.Business.Value)}
              type="button"
              class:selected={company.legals.kind === LegalKind.Business.Value}>
              {LegalKind.Business.Label}
            </button>
            <button
              on:click={() => selectKind(LegalKind.Individual.Value)}
              type="button"
              class:selected={company.legals.kind === LegalKind.Individual.Value}>
              {LegalKind.Individual.Label}
            </button>
          </div>
        </div>
        <ErrorContainer field={$companyForm.fields.kind} />
        <div class="w-full form-control">
          <label for="vat">N° de TVA</label>
          <div class="flex flex-wrap">
            <input
              id="vat"
              type="text"
              disabled={true}
              value="FR"
              class="w-3/12 disabled" />
            <input
              id="vat"
              type="text"
              maxlength="2"
              minlength="2"
              bind:value={vat}
              class="w-3/12" />
            <input
              id="vat-siret"
              type="text"
              disabled={true}
              value={company.legals.siret ? company.legals.siret.toString().substring(0, 9).toUpperCase() : 0}
              class="w-6/12 disabled" />
          </div>
        </div>
        <div class="w-full form-control">
          <label for="company_email">Email de contact *</label>
          <input
            id="company_email"
            type="email"
            use:bindClass={{ form: companyForm, name: "email" }}
            bind:value={company.legals.email} />
          <ErrorContainer field={$companyForm.fields.email} />
        </div>
        <div class="w-full form-control">
          <label for="company_email">Téléphone</label>
          <input
            id="company_phone"
            class="input-phone"
            use:initializeCleave
            use:bindClass={{ form: companyForm, name: "phone" }}
            bind:value={company.phone} />
          <ErrorContainer field={$companyForm.fields.phone} />
        </div>
        <small class="text-gray-600"><Icon data={faInfoCircle} scale="0.8" class="mr-2" />Seuls l'équipe Sheaft et les clients ayant commandés auprès de vous peuvent voir votre mail et votre téléphone.</small>
      </div>
      <div class="px-5 py-3 bg-white lg:w-6/12 w-full">
        <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center">
          <p>Siège social</p>
        </div>
        <div class="w-full form-control">
          <label for="line1">Adresse *</label>
          <input name="line1" placeholder="ex : 210 Avenue de la Liberté" use:bindClass={{ form: companyForm, name: "line1" }} bind:value={company.legals.address.line1} autocomplete="address-line1" />
          <ErrorContainer field={$companyForm.fields.line1} />
        </div>
        <div class="w-full form-control">
          <label for="line2">Complément d'adresse</label>
          <input name="line2" placeholder="ex : Appartement 15" bind:value={company.legals.address.line2} autocomplete="address-line2" />
        </div>
        <div class="form-control">
          <div class="flex flex-wrap lg:flex-row lg:flex-no-wrap w-full">
            <div class="w-full pr-0 lg:pr-2">
              <label for="postcode">Code postal *</label>
              <input name="postcode" placeholder="ex : 74000" bind:value={company.legals.address.zipcode} use:bindClass={{ form: companyForm, name: "zipcode" }} autocomplete="postal-code" />
              <ErrorContainer field={$companyForm.fields.zipcode} />
            </div>
            <div class="w-full">
              <label for="city">Ville *</label>
              <input name="city" placeholder="ex : Annecy" bind:value={company.legals.address.city} use:bindClass={{ form: companyForm, name: "city" }} autocomplete="address-level2" />
              <ErrorContainer field={$companyForm.fields.city} />
            </div>
          </div>
        </div>
         <div class="w-full form-control" style="display: block">
          <label for="country">Pays *</label>
          <CountrySelect bind:selectedValue={company.legals.address.country} formName={companyForm} name="country" {errorsHandler} />
        </div>
      </div>  
    </div>
  </fieldset>
</form>
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
        on:click={next}
        aria-label="Suivant"
        class:disabled={!$companyForm.valid}
        class="form-button uppercase text-sm cursor-pointer text-white
        shadow rounded-full px-6 py-2 flex items-center justify-center
        m-auto bg-primary">
        Suivant
      </button>
    </div>
  </div>

<style>
  .form-button {
    width: 125px;
  }
    /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
</style>
