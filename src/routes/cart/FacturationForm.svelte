<script>
  import { onMount } from "svelte";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import Cleave from "cleave.js";

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

  let cleave = null;

  const facturationForm = form(() => ({
    firstname: { value: user.firstName, validators: ['required'], enabled: true },
    lastName: { value: user.lastName, validators: ['required'], enabled: true },
    birthday: { value: user.birthDate, validators: ['required'], enabled: true },
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

  onMount(() => {
    cleave = new Cleave('.input-birthday', {
      date: true,
      delimiter: ' / ',
      datePattern: ['d', 'm', 'Y']
    });
  })
</script>

<div class="pb-6">
  <h1>Etape 1/3 - Informations de facturation</h1>
</div>

<div class="flex flex-wrap lg:flex-row lg:flex-no-wrap">
  <div class="w-full form-control pr-0 lg:pr-2">
    <label for="firstName">Prénom *</label>
    <input name="firstName" placeholder="ex : Jean" bind:value={user.firstName} autocomplete="given-name" />
    <ErrorContainer field={$facturationForm.fields.firstName} />
  </div>
  <div class="w-full form-control">
    <label for="lastName">Nom de famille *</label>
    <input name="lastName" placeholder="ex : Dupont" bind:value={user.lastName} autocomplete="family-name"  />
    <ErrorContainer field={$facturationForm.fields.lastName} />
  </div>
</div>

<div class="w-full form-control">
  <label for="email">E-mail *</label>
  <input name="email" placeholder="ex : jean.dupont@gmail.com" type="email" bind:value={user.email} autocomplete="email" />
  <ErrorContainer field={$facturationForm.fields.email} />
</div>

<div class="w-full form-control">
  <label for="birthday">Date de naissance (JJ/MM/AAAA)*</label>
  <input name="birthday" class="input-birthday" placeholder="JJ/MM/AAAA" type="text" bind:value={user.birthDate} autocomplete="birthday"  />
  <ErrorContainer field={$facturationForm.fields.birthday} />
</div>

<div class="w-full form-control">
  <label for="country">Pays de résidence *</label>
  <input name="country" placeholder="ex : France" bind:value={user.countryOfResidence} autocomplete="country" />
  <ErrorContainer field={$facturationForm.fields.countryOfResidence} />
</div>

<!-- <div class="w-full">
  <label for="nationality">Nationalité</label>
  <input name="nationaliy" bind:value={user.nationality} />
</div> -->

<div class="w-full form-control">
  <label for="line1">Adresse *</label>
  <input name="line1" placeholder="ex : 210 Avenue de la Liberté" bind:value={user.address.line1} autocomplete="address-line1" />
  <ErrorContainer field={$facturationForm.fields.line1} />
</div>
<div class="w-full form-control">
  <label for="line2">Complément d'adresse</label>
  <input name="line2" placeholder="ex : Appartement 15" bind:value={user.address.line2} autocomplete="address-line2" />
</div>
<div class="flex flex-wrap lg:flex-row lg:flex-no-wrap">
  <div class="w-full form-control pr-0 lg:pr-2">
    <label for="city">Ville *</label>
    <input name="city" placeholder="ex : Annecy" bind:value={user.address.city} autocomplete="address-level2" />
    <ErrorContainer field={$facturationForm.fields.city} />
  </div>
  <div class="w-full form-control">
    <label for="postcode">Code postal *</label>
    <input name="postcode" placeholder="ex : 74000" bind:value={user.address.zipcode} autocomplete="postal-code" />
    <ErrorContainer field={$facturationForm.fields.zipcode} />
  </div>
</div>

<div class="w-full form-control">
  <label for="country">Pays *</label>
  <input name="country" placeholder="ex : France" bind:value={user.address.country} autocomplete="country" />
  <ErrorContainer field={$facturationForm.fields.country} />
</div>