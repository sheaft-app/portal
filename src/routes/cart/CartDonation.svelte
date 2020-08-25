<script>
  import { onDestroy } from "svelte";
  import { slide } from "svelte/transition";
  import { getContext } from "svelte";
  import BlowingButton from "./BlowingButton.svelte";
  import StripeInfo from "./StripeInfo.svelte";

  export let choice = null, choosenDonation = null;

  const { open } = getContext("modal");

  const CHOICE_EURO = "EURO";
  const CHOICE_ROUNDED = "ROUNDED";
  const CHOICE_NONE = "NONE";

  const choose = (_choice) => {
    choice = _choice;
    setTimeout(() => {
      window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    }, 10);
  }

  onDestroy(() => {
    choice = null;
  })
  
  const showTransactionInfo = () => {
    open(StripeInfo, {});
  };
</script>

<div class="flex justify-center m-auto" style="max-width: 450px;">
  <div class="text-center relative" style="max-width: 400px;">
    <p class="text-xl mb-3">Le saviez-vous ? 🍓</p>
    <p class="font-light mb-3">En donnant 1€ à Sheaft, vous économisez plus d'argent qu'en payant la marge d'un intermédiaire.</p>
    <p class="font-light mb-3">En prime, vous devenez une pierre angulaire de ce grand projet social et solidaire.</p>
    <BlowingButton blowed={choice === CHOICE_EURO} on:click={() => choose(CHOICE_EURO)} text="Donner 1€" blowedText="Donner 1€"/>
    <BlowingButton blowed={choice === CHOICE_ROUNDED} on:click={() => choose(CHOICE_ROUNDED)} text="Donner l'arrondi (0.63€)" blowedText="Donner l'arrondi (0.63€)"/>
    <button 
      on:click={() => choose(CHOICE_NONE)}
      class="btn m-auto shadow justify-center md:w-full no-give" 
      class:bg-accent={choice !== CHOICE_NONE}
      class:bg-none={choice === CHOICE_NONE} 
      class:border={choice === CHOICE_NONE}
      style="padding: 1em 2em; border-color: #205164;">
      Ne rien donner à Sheaft
    </button>
    <div class="border flex justify-between mt-5 p-2" style="border-color: #205164;">
      <div class="text-left leading-6">
        <p>Montant du panier</p>
        <p>Don à Sheaft</p>
        <p>Frais de paiement bancaire</p>
        <p class="leading-none text-gray-600 text-sm">1.4% + 0.25€ <button class="btn-link" on:click={showTransactionInfo}>C'est quoi ?</button></p>
      </div>
      <div class="text-right leading-6">
        <p>24,37€</p>
        <p class:text-green-600={choice && choice !== CHOICE_NONE}>
          {#if choice === CHOICE_EURO}
            1,00€
          {:else if choice === CHOICE_ROUNDED}
            0,63€
          {:else}
            0,00€
          {/if}
        </p>
        <p class="mb-3">0,60€</p>
        <p>Total : <span class="font-semibold">25,60€</span></p>
      </div>
    </div>
    {#if choice}
      <div class="mt-5 mb-3 text-xl">
        {#if choice === CHOICE_EURO}
          <p class="text-green-600">Vous êtes vraiment au top, merci ! 😍</p>
        {:else if choice === CHOICE_ROUNDED}
          <p class="text-green-600">Merci, ça fait la différence ! 😊</p>
        {:else}
          <p>Okay, une autre fois peut-être ? 😔</p>
        {/if}
      </div>
      <div class="mt-5 mb-5 m-auto w-full">
        <button type="button" on:click={() => choosenDonation = choice} class="btn btn-lg btn-primary w-full justify-center" style="padding: 1em 2em;">
          {#if choice === CHOICE_EURO}
            Poursuivre en faisant don de 1€
          {/if}
          {#if choice === CHOICE_ROUNDED}
             Poursuivre en faisant don de 0.63€
          {/if}
          {#if choice === CHOICE_NONE}
             Poursuivre sans donner à Sheaft
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
.no-give {
  @media (max-width: 375px) {
    width: 220px;
  }

  @media (min-width: 376px) {
    width: 265px;
  }

  @media (min-width: 580px) {
    width: 100%;
  }
}
</style>