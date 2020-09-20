<script>
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import GetRouterInstance from "../../services/SheaftRouter";
  import Cleave from "cleave.js";
  import Select from "./../../components/controls/select/Select.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL";
  import SheaftErrors from "../../services/SheaftErrors";
  import CartRoutes from "./routes";
  import { GET_COUNTRIES, GET_NATIONALITIES } from "./queries";
  
  export let user = {
    firstName: null,
    lastName: null,
    birthDate: null,
    nationality: null,
    email: null,
    countryOfResidence: null,
    nationality: null,
    address: {
      line1: null,
      line2: null,
      zipcode: null,
      city: null,
      country: null
    }
  };
  
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  export let invalid = false, errorsHandler = null;

  let cleave = null;
  let countries = [];
  let nationalities = [];
  let isLoadingLists = true;

  const facturationForm = form(() => ({
    firstName: { value: user.firstName, validators: ['required'], enabled: true },
    lastName: { value: user.lastName, validators: ['required'], enabled: true },
    birthDate: { value: user.birthDate, validators: ['required'], enabled: true },
    nationality: { value: user.nationality, validators: ['required'], enabled: true },
    email: { value: user.email, validators: ['required', 'email'], enabled: true },
    countryOfResidence: { value: user.countryOfResidence, validators: ['required'], enabled: true },
    line1: { value: user.address.line1, validators: ['required'], enabled: true },
    city: { value: user.address.city, validators: ['required'], enabled: true },
    zipcode: { value: user.address.zipcode, validators: ['required'], enabled: true },
    country: { value: user.address.country, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });

  const getLabel = option => option.name;

  onMount(async () => {
    cleave = new Cleave('.input-birthday', {
      date: true,
      delimiter: ' / ',
      datePattern: ['d', 'm', 'Y']
    });

    var resCountries = await graphQLInstance.query(GET_COUNTRIES, {}, errorsHandler.Uuid);

		if (!resCountries.success) {
      // todo
      isLoadingLists = false;
			return;
    }

    countries = resCountries.data;
    
    var resNationalities = await graphQLInstance.query(GET_NATIONALITIES, {}, errorsHandler.Uuid);

    if (!resNationalities.success) {
      // todo
      isLoadingLists = false;
			return;
    }

    nationalities = resNationalities.data;
    isLoadingLists = false;
  })

  $: invalid = !$facturationForm.valid;
</script>

<section
  class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2 px-5 lg:px-0">
  <div class="mb-3">
    <button
      class="text-gray-600 items-center flex uppercase"
      on:click={() => routerInstance.goTo(CartRoutes.Resume)}>
      <Icon data={faChevronLeft} class="mr-2 inline" />
      Revenir au panier
    </button>
  </div>
  <h1 class="text-2xl mb-0 text-gray-700">Informations de facturation</h1>
</section>

<div class="px-5 py-3 bg-white shadow lg:rounded mb-5">
  <div class="form-control">
    <div class="flex flex-wrap lg:flex-row lg:flex-no-wrap w-full">
      <div class="w-full pr-0 lg:pr-2">
        <label for="firstName">Prénom *</label>
        <input name="firstName" placeholder="ex : Jean" bind:value={user.firstName} use:bindClass={{ form: facturationForm, name: "firstName" }} autocomplete="given-name" />
        <ErrorContainer field={$facturationForm.fields.firstName} />
      </div>
      <div class="w-full">
        <label for="lastName">Nom de famille *</label>
        <input name="lastName" placeholder="ex : Dupont" bind:value={user.lastName} use:bindClass={{ form: facturationForm, name: "lastName" }} autocomplete="family-name"  />
        <ErrorContainer field={$facturationForm.fields.lastName} />
      </div>
    </div>
  </div>

  <div class="w-full form-control">
    <label for="email">E-mail *</label>
    <input name="email" placeholder="ex : jean.dupont@gmail.com" type="email" use:bindClass={{ form: facturationForm, name: "email" }} bind:value={user.email} autocomplete="email" />
    <ErrorContainer field={$facturationForm.fields.email} />
  </div>

  <div class="w-full form-control">
    <label for="birthday">Date de naissance (JJ/MM/AAAA)*</label>
    <input name="birthday" class="input-birthday" placeholder="JJ/MM/AAAA" type="text" use:bindClass={{ form: facturationForm, name: "birthDate" }} bind:value={user.birthDate} autocomplete="birthday"  />
    <ErrorContainer field={$facturationForm.fields.birthDate} />
  </div>

  <div class="w-full form-control" style="display: block">
    <label for="country">Pays de résidence *</label>
    <div class="themed" use:bindClass={{ form: facturationForm, name: "countryOfResidence" }}>
      <Select 
        getOptionLabel={getLabel}
        getSelectionLabel={getLabel}
        items={countries}
        iconClasses="mr-3"
        isClearable={false}
        showChevron={true}
        hideSelectedOnFocus={true}
        optionIdentifier="id"
        placeholder="ex : France"
        bind:selectedValue={user.countryOfResidence} />
    </div>
    <ErrorContainer field={$facturationForm.fields.countryOfResidence} />
  </div>

  <div class="w-full form-control" style="display: block">
    <label for="nationality">Nationalité *</label>
    <div class="themed" use:bindClass={{ form: facturationForm, name: "nationality" }}>
      <Select 
        getOptionLabel={getLabel}
        getSelectionLabel={getLabel}
        items={nationalities}
        iconClasses="mr-3"
        isClearable={false}
        showChevron={true}
        hideSelectedOnFocus={true}
        optionIdentifier="id"
        placeholder="ex : Française"
        bind:selectedValue={user.nationality}
        />
    </div>
    <ErrorContainer field={$facturationForm.fields.nationality} />
  </div>
</div>

<div class="px-5 py-3 bg-white shadow lg:rounded mb-5">
  <div class="w-full form-control">
    <label for="line1">Adresse *</label>
    <input name="line1" placeholder="ex : 210 Avenue de la Liberté" use:bindClass={{ form: facturationForm, name: "line1" }} bind:value={user.address.line1} autocomplete="address-line1" />
    <ErrorContainer field={$facturationForm.fields.line1} />
  </div>
  <div class="w-full form-control">
    <label for="line2">Complément d'adresse</label>
    <input name="line2" placeholder="ex : Appartement 15" bind:value={user.address.line2} autocomplete="address-line2" />
  </div>

  <div class="form-control">
    <div class="flex flex-wrap lg:flex-row lg:flex-no-wrap w-full">
      <div class="w-full pr-0 lg:pr-2">
        <label for="city">Ville *</label>
        <input name="city" placeholder="ex : Annecy" bind:value={user.address.city} use:bindClass={{ form: facturationForm, name: "city" }} autocomplete="address-level2" />
        <ErrorContainer field={$facturationForm.fields.city} />
      </div>
      <div class="w-full">
        <label for="postcode">Code postal *</label>
        <input name="postcode" placeholder="ex : 74000" bind:value={user.address.zipcode} use:bindClass={{ form: facturationForm, name: "zipcode" }} autocomplete="postal-code" />
        <ErrorContainer field={$facturationForm.fields.zipcode} />
      </div>
    </div>
  </div>

  <div class="w-full form-control" style="display: block">
    <label for="country">Pays *</label>
    <div class="themed" use:bindClass={{ form: facturationForm, name: "country" }}>
      <Select 
        getOptionLabel={getLabel}
        getSelectionLabel={getLabel}
        items={countries}
        iconClasses="mr-3"
        isClearable={false}
        showChevron={true}
        hideSelectedOnFocus={true}
        optionIdentifier="id"
        placeholder="ex : France"
        bind:selectedValue={user.address.country} />
    </div>
    <ErrorContainer field={$facturationForm.fields.country} />
  </div>
</div>

<style>
.themed {
  --inputPadding: 15px;
  --selectedItemPadding: 0 15px;
  --borderFocusColor: #a0aec0;
  --placeholderColor: #a0afbf;
}
</style>