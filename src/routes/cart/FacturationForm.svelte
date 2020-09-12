<script>
  import { onMount } from "svelte";

  let user = {
    firstname: "",
    lastname: "",
    birthday: null,
    nationality: "FR",
    countryOfResidence: "France",
    email: "",
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: ""
    }
  };
</script>

<div class="flex flex-wrap lg:flex-row lg:flex-no-wrap">
  <div class="w-full form-control pr-0 lg:pr-2">
    <label for="firstName">Prénom</label>
    <input name="firstName" placeholder="ex : Jean" bind:value={user.firstname} autocomplete="given-name" />
  </div>
  <div class="w-full form-control">
    <label for="lastName">Nom de famille</label>
    <input name="lastName" placeholder="ex : Dupont" bind:value={user.lastname} autocomplete="family-name"  />
  </div>
</div>

<div class="w-full form-control">
  <label for="country">E-mail</label>
  <input name="email" placeholder="ex : jean.dupont@gmail.com" type="email" bind:value={user.email} autocomplete="email" />
</div>

<div class="w-full form-control">
  <label for="birthday">Date de naissance</label>
  <input name="birthday" placeholder="JJ/MM/AAAA" type="date" bind:value={user.birthday} autocomplete="birthday"  />
</div>

<!-- <div class="w-full">
  <label for="nationality">Nationalité</label>
  <input name="nationaliy" bind:value={user.nationality} />
</div> -->

<div class="w-full form-control">
  <label for="line1">Adresse</label>
  <input name="line1" placeholder="ex : 210 Avenue de la Liberté" bind:value={user.address.addressLine1} autocomplete="address-line1" />
</div>
<div class="w-full form-control">
  <label for="line2">Complément d'adresse</label>
  <input name="line2" placeholder="ex : Appartement 15" bind:value={user.address.addressLine2} autocomplete="address-line2" />
</div>
<div class="flex flex-wrap lg:flex-row lg:flex-no-wrap">
  <div class="w-full form-control pr-0 lg:pr-2">
    <label for="city">Ville</label>
    <input name="city" placeholder="ex : Annecy" bind:value={user.address.city} autocomplete="address-level2" />
  </div>
  <div class="w-full form-control">
    <label for="postcode">Code postal</label>
    <input name="postcode" placeholder="ex : 74000" bind:value={user.address.postalCode} autocomplete="postal-code" />
  </div>
</div>
<div class="w-full form-control">
  <label for="country">Pays</label>
  <input name="country" placeholder="ex : France" bind:value={user.address.country} autocomplete="country" />
</div>