<script>
  import { onMount } from "svelte";

  let card = {
    name: null,
    number: null,
    cvc: null,
    expiry: null
  };
</script>

<div class="flex flex-wrap lg:flex-row lg:flex-no-wrap">
  <div class="w-full">
  <label for="name">Nom sur la carte</label>
    <input name="name" bind:value={card.name} autocomplete="cc-name" />
  </div>
</div>

<div class="w-full">
  <label for="number">Numéro de carte</label>
  <input name="number" type="email" bind:value={card.number} autocomplete="cc-number" />
</div>

<div class="flex flex-wrap lg:flex-row lg:flex-no-wrap">
  <div class="w-full">
    <label for="cvc">CVC</label>
    <input name="cvc" bind:value={card.cvc} autocomplete="cc-csc"  />
  </div>
  <div class="w-full">
    <label for="expiry">Expiration</label>
    <input name="expiry" bind:value={card.expiry} autocomplete="cc-exp" />
  </div>
</div>