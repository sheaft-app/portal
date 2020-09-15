<script>
  import Loader from "./../../components/Loader.svelte";
  import { REGISTER_STORE, REGISTER_PRODUCER } from "./mutations.js";
  import { SEARCH_COMPANY_SIRET } from "./queries.js";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import SheaftErrors from "./../../services/SheaftErrors";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import GetNotificationsInstance from "./../../services/SheaftNotifications";
  import { normalizeOpeningHours } from "./../../helpers/app";
  import { onMount } from "svelte";
  import CitySearch from "./../../components/search/CitySearch.svelte";
  import CityService from "./../../services/CityService.js";
  import Toggle from "./../../components/controls/Toggle.svelte";
  import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
  import RegisterRoutes from "./routes";
  import Roles from "./../../enums/Roles";
  import Guid from "./../../helpers/Guid";
  import ErrorCard from "../../components/ErrorCard.svelte";
  import { authRegistered } from "../../stores/auth";
  import InputSiret from "./InputSiret.svelte";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";

  export let params = {};

  const cityService = new CityService();
  const authInstance = GetAuthInstance();
  const routerInstance = GetRouterInstance();
  const graphQLInstance = GetGraphQLInstance();
  const notificationsInstance = GetNotificationsInstance();
  const errorsHandler = new SheaftErrors();

  let isRegistering = false;
  let isSearchingSiret = false;
  let showSponsoring = false;
  let choosenRole = null;
  let stepper = 0;
  let vat = null;
  let isSearchingAddress = false;
  let sponsorshipCode = JSON.parse(localStorage.getItem("sponsoring"));
  let openings = [];

  let company = {
    name: authInstance.user.profile.name || null,
    siret: null,
    openForNewBusiness: true,
    vatIdentifier: null,
    address: null,
    id: authInstance.user.profile.sub || null,
    firstName: authInstance.user.profile.given_name || null,
    lastName: authInstance.user.profile.family_name || null,
    email: authInstance.user.profile.email || null,
    phone: authInstance.user.profile.phone || null,
    picture: authInstance.user.profile.picture || null,
    sponsoringCode: sponsorshipCode || null,
    roles: [params.id]
  };

  const handleSubmit = async () => {
    addressForm.validate();

    if ($addressForm.valid) {
      company.vatIdentifier = "FR" + vat + company.siret.toString().substring(0, 9);

      var register = null;
      if (isStore) {
        register = REGISTER_STORE;
        company.openingHours = normalizeOpeningHours(openings);
      } else {
        register = REGISTER_PRODUCER;
        delete company["openingHours"];
      }

      delete company.address['insee'];

      isRegistering = true;
      var res = await graphQLInstance.mutate(register, company, errorsHandler.Uuid);

      if (!res.success) {
      isRegistering = false;
        //TODO
        return;
      }

      await authInstance.loginSilent();
      authRegistered.set(true);
      localStorage.removeItem("user_choosen_role");
      localStorage.removeItem("sponsoring");
      routerInstance.goTo("/");
      isRegistering = false;
    }
  };

  const validateSiret = async () => {
    siretForm.validate();

    if ($siretForm.valid) {
      var siret = company.siret.toString();
      if (siret.length < 14 || siret.length > 14) return;

      isSearchingSiret = true;
      var res = await graphQLInstance.query(SEARCH_COMPANY_SIRET, {input:siret});
      if (!res.success) {
        isSearchingSiret = false;
        stepper++;
        //TODO
        return;
      }

    company.address = res.data.address;
    company.name = res.data.name;
    company.firstName = company.firstName
      ? company.firstName
      : res.data.firstName;
    company.lastName = company.lastName
      ? company.lastName
      : res.data.lastName;

      if (addressIsDefined(company.address)) {
        var res = await searchCompanyAddress(
          `${company.address.line1}, ${company.address.zipcode} ${company.address.city}`
        );
        if (res.success) {
          company.address = res.data;
        }
      }

      stepper++;
      isSearchingSiret = false;
    }
  };

  const addressIsDefined = address =>
    address.line1 &&
    address.line1.length > 0 &&
    address.zipcode &&
    address.zipcode.length > 0 &&
    address.city &&
    address.city.length > 0;

  const cancel = () => {
    localStorage.removeItem("user_choosen_role");
    routerInstance.goBack();
  }

  const resetAddress = () => {
    company.address = null;
  }

  const searchCompanyAddress = async text => {
    isSearchingAddress = true;
    var res = await cityService.SearchByAddress(text);
    isSearchingAddress = false;
    return res;
  };

  $: isStore = params.id == Roles.Store.Value;
  $: isValid = company.siret && company.siret.toString().length == 14;

  $: isUserValid =
    company.firstName &&
    company.firstName.length > 0 &&
    company.lastName &&
    company.lastName.length > 0 &&
    company.email &&
    company.email.length > 0;

  $: companyInfoIsValid =
    company.name &&
    company.name.length > 0 &&
    company.siret &&
    company.siret.toString().length == 14 &&
    company.email &&
    company.email.length > 0;

  const siretForm = form(() => ({
    siret: { value: company.siret, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });

  const ownerForm = form(() => ({
    firstName: { value: company.firstName, validators: ['required'], enabled: true },
    lastName: { value: company.lastName, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });

  const companyForm = form(() => ({
    name: { value: company.name, validators: ['required'], enabled: true },
    siret: { value: company.siret, validators: ['required'], enabled: true },
    email: { value: company.email, validators: ['required', 'email'], enabled: true },
	}), {
    initCheck: false
  });

  const addressForm = form(() => ({
    address: { value: company.address, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });
</script>

<svelte:head>
  <title>Enregistrement société</title>
</svelte:head>

<TransitionWrapper>
  <div class="-my-2 mx-0 py-2 overflow-x-auto mt-2 mb-8 h-full">
    <ErrorCard {errorsHandler}/>
    <div class="text-center mb-2">
      <img src="img/form-stepper.svg" alt="Bandeau formulaire" />
    </div>
    {#if stepper <= 0 && !isSearchingSiret}
      <div class="md:w-3/5 m-auto">
        <div class="text-center pt-6 pb-8">
          <p class="font-bold">
            Pour commencer, nous avons besoin de votre numéro SIRET
          </p>
        </div>
        <form>
          <fieldset>
            <div class="flex">
              <div class="form-control w-full">
                <InputSiret
                  disabled={isSearchingSiret}
                  bind:value={company.siret}
                  bindClassData={{ form: siretForm, name: "siret" }}
                  placeholder="SIRET (14 chiffres)" />
              </div>
            </div>
          </fieldset>
        </form>
        <div class="flex w-full justify-center mt-5">
          <div>
            <button
              on:click={() => cancel()}
              aria-label="Retour"
              class="form-button uppercase text-sm cursor-pointer rounded-full
              px-6 py-2 flex items-center justify-center m-auto border border-gray-600 mr-2">
              Retour
            </button>
          </div>
          <div>
            <button
              class:disabled={isSearchingSiret || !isValid}
              on:click={validateSiret}
              aria-label="Suivant"
              disabled={isSearchingSiret || !isValid}
              class="form-button uppercase text-sm cursor-pointer text-white
              shadow rounded-full px-6 py-2 flex items-center justify-center
              m-auto bg-primary">
              Suivant
            </button>
          </div>
        </div>
      </div>
    {/if}
    {#if stepper <= 0 && isSearchingSiret}
      <div class="w-full md:w-1/2 px-3">
        <Loader />
      </div>
    {/if}
    {#if stepper == 1}
      <div class="md:w-3/5 m-auto">
        <div class="text-center pt-6 pb-8">
          Étape 1/4
          <p class="font-bold">Qui est le propriétaire ?</p>
        </div>
        <form>
          <fieldset>
            <div class="flex flex-wrap form-control">
              <div class="w-full md:w-1/2 md:pr-2 mb-2 md:mb-0">
                <label for="family_name">Nom*</label>
                <input
                  id="family_name"
                  type="text"
                  use:bindClass={{ form: ownerForm, name: "lastName" }}
                  required="required"
                  bind:value={company.lastName} />
                <ErrorContainer field={$ownerForm.fields.lastName} />
              </div>
              <div class="w-full md:w-1/2">
                <label for="given_name">Prénom*</label>
                <input
                  id="given_name"
                  use:bindClass={{ form: ownerForm, name: "firstName" }}
                  type="text"
                  required="required"
                  bind:value={company.firstName} />
                <ErrorContainer field={$ownerForm.fields.firstName} />
              </div>
            </div>
            <div class="mb-2 md:mb-0 hidden">
              <label for="email">Adresse email*</label>
              <input
                id="email"
                type="email"
                use:bindClass={{ form: ownerForm, name: "email" }}
                disabled="disabled"
                required="required"
                bind:value={company.email} />
            </div>
            <div class="w-full flex flex-wrap justify-center">
              <button
                type="button"
                class:hidden={showSponsoring}
                class="btn-link"
                on:click={() => (showSponsoring = true)}>
                J'ai un code parrain
              </button>
              {#if showSponsoring}
                <div class="form-control">
                  <label for="code">Code parrain</label>
                  <input
                    id="code"
                    type="code"
                    bind:value={company.sponsoringCode} />
                </div>
              {/if}
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
              disabled={!isUserValid}
              on:click={() => stepper++}
              class:disabled={!isUserValid}
              aria-label="Suivant"
              class="form-button uppercase text-sm cursor-pointer text-white
              shadow rounded-full px-6 py-2 flex items-center justify-center
              m-auto bg-primary">
              Suivant
            </button>
          </div>
        </div>
      </div>
    {/if}
    {#if stepper == 2}
      <div class="md:w-3/5 m-auto">
        <div class="text-center pt-6 pb-8">
          Étape 2/4 
          <p class="font-bold">
            Aidez-nous à mieux identifier votre {isStore ? 'magasin' : 'ferme'}
          </p>
        </div>
        <form>
          <fieldset>
            <div class="w-full mb-2 md:mb-0 form-control">
              <label for="name">
                Nom {isStore ? 'du magasin' : 'de la ferme'}*
              </label>
              <input
                id="name"
                type="text"
                use:bindClass={{ form: companyForm, name: "name" }}
                bind:value={company.name} />
              <ErrorContainer field={$companyForm.fields.name} />
            </div>
            <div class="flex flex-wrap">
              <div class="w-full xl:w-1/2 form-control lg:pr-2">
                <label for="siret">N° de SIRET*</label>
                <input
                  id="siret"
                  type="number"
                  use:bindClass={{ form: companyForm, name: "siret" }}
                  on:input={e => {
                    if (e.target.value.length > e.target.maxLength) {
                      e.preventDefault();
                      e.target.value = e.target.value
                        .slice(0, e.target.maxLength)
                        .toString();
                    }
                  }}
                  class="m-auto"
                  maxLength="14"
                  minLength="14"
                  bind:value={company.siret} />
                <ErrorContainer field={$companyForm.fields.siret} />
              </div>
              <div class="w-full xl:w-1/2 form-control">
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
                    value={company.siret ? company.siret.toString().substring(0, 9).toUpperCase() : 0}
                    class="w-6/12 disabled" />
                </div>
              </div>
            </div>
            <div class="w-full form-control">
              <label for="company_email">Email de contact*</label>
              <input
                id="company_email"
                type="email"
                use:bindClass={{ form: companyForm, name: "email" }}
                bind:value={company.email} />
              <ErrorContainer field={$companyForm.fields.email} />
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
              on:click={() => stepper++}
              aria-label="Suivant"
              disabled={!companyInfoIsValid}
              class:disabled={!companyInfoIsValid}
              class="form-button uppercase text-sm cursor-pointer text-white
              shadow rounded-full px-6 py-2 flex items-center justify-center
              m-auto bg-primary">
              Suivant
            </button>
          </div>
        </div>
      </div>
    {/if}
    {#if stepper === 3}
      <div class="md:w-3/5 m-auto">
        <div class="text-center pt-6 pb-8">
          Étape 3/4
          <p class="font-bold">
            Visibilité de votre {isStore ? 'magasin' : 'ferme'}
          </p>
        </div>
        <form>
          <fieldset>
            <div class="w-full mb-2 md:mb-0">
              <div class="mt-2">
                <Toggle
                  classNames="ml-1"
                  isChecked={company.openForNewBusiness}
                  on:change={() => (company.openForNewBusiness = !company.openForNewBusiness)}>
                  <span class="ml-1">
                    Je veux être visible des {isStore ? 'producteurs' : 'magasins'}
                    afin qu'ils me contactent pour commercer avec eux.
                  </span>
                </Toggle>
              </div>
            </div>
            {#if company.openForNewBusiness && isStore}
              <div class="form-control mt-5">
                <label style="margin: 0 !important;">
                  Horaires d'ouverture *
                </label>
                <p class="text-sm">
                  Renseignez vos horaires d'ouverture pour qu'un producteur
                  évite de vous contacter si vos horaires ne correspondent pas à
                  ses plages de livraison.
                </p>
                <p class="text-sm">
                  Ces horaires ne seront visibles que par les producteurs.
                </p>
              </div>
              <OpeningHoursContainer bind:openings={openings} />
            {/if}
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
              on:click={() => stepper++}
              aria-label="Suivant"
              disabled={(isStore && company.openForNewBusiness && (!openings || openings.length == 0))}
              class:disabled={(isStore && company.openForNewBusiness && (!openings || openings.length == 0))}
              class="form-button uppercase text-sm cursor-pointer text-white
              shadow rounded-full px-6 py-2 flex items-center justify-center
              m-auto bg-primary">
              Suivant
            </button>
          </div>
        </div>
      </div>
    {/if}
    {#if stepper > 3 && !isRegistering}
      <div class="md:w-3/5 m-auto">
        <div class="text-center pt-6 pb-8">
          Étape finale
          <p class="font-bold">
            Terminons par l'adresse de votre {isStore ? 'magasin' : 'ferme'}
          </p>
        </div>
        {#if isSearchingAddress}
          <div class="w-full h-full md:w-1/2 px-3 mb-2 md:mb-0">
            <Loader />
          </div>
        {:else if company.address}
          <form>
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
                <a href="javascript:void(0)" on:click={resetAddress}>
                  Modifier l'adresse
                </a>
              </p>
            </fieldset>
          </form>
        {:else}
          <div class="w-full form-control" style="display: block;">
            <CitySearch
              bind:selectedAddress={company.address}
              bindClassData={{ form: addressForm, name: "address" }}
              initialValue={company.address} />
          </div>
          <ErrorContainer field={$addressForm.fields.address} />
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
              on:click={() => handleSubmit()}
              aria-label="Valider"
              class:disabled={!$addressForm.valid}
              class="form-button uppercase text-sm cursor-pointer text-white
              shadow rounded-full px-6 py-2 flex items-center justify-center
              m-auto bg-primary">
              Terminer
            </button>
          </div>
        </div>
      </div>
    {/if}
    {#if stepper > 2 && isRegistering}
      <div class="w-full md:w-1/2 px-3 mb-2 md:mb-0">
        <Loader text="Validation de votre compte en cours..." />
      </div>
    {/if}
  </div>
</TransitionWrapper>

<style>
  img {
    height: 80px;
    width: 100%;
  }

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
