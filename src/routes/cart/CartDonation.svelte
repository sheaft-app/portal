<script>
  import { onDestroy } from "svelte";
  import { slide } from "svelte/transition";
  import BlowingButton from "./BlowingButton.svelte";
  import { formatMoney } from "./../../helpers/app.js";
  import Icon from "svelte-awesome";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

  export let choice = null, submit = () => {}, isLoadingPaymentInfo = false, choosenDonation = CHOICE_NONE;

  const CHOICE_EURO = "EURO";
  const CHOICE_ROUNDED = "ROUNDED";
  const CHOICE_NONE = "NONE";

  let order = JSON.parse(
		localStorage.getItem("user_current_order")
  );

  $: roundedValue = Math.ceil(order.totalPrice - order.donation) - (order.totalPrice - order.donation);
  
  const choose = (_choice) => {
    choice = _choice;
    setTimeout(() => {
      window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    }, 10);
  }

  const handleSubmit = () => {
    choosenDonation = choice;
    submit();
  }

  onDestroy(() => {
    choice = null;
  })
</script>

<div class="flex justify-center m-auto" style="max-width: 450px;">
  <div class="text-center relative" style="max-width: 400px;">
    <p class="text-xl mb-3">Le saviez-vous ? 🍓</p>
    <p class="font-light mb-3">En donnant 1€ à Sheaft, vous économisez plus d'argent qu'en payant la marge d'un intermédiaire.</p>
    <p class="font-light mb-3">En prime, vous devenez une pierre angulaire de ce grand projet social et solidaire.</p>
    <BlowingButton blowed={choice === CHOICE_EURO} on:click={() => choose(CHOICE_EURO)} text="Donner 1€" blowedText="Donner 1€"/>
    {#if roundedValue > 0}
      <BlowingButton blowed={choice === CHOICE_ROUNDED} on:click={() => choose(CHOICE_ROUNDED)} text="Donner l'arrondi ({formatMoney(roundedValue)})" blowedText="Donner l'arrondi ({formatMoney(roundedValue)})"/>
    {/if}
    <button 
      on:click={() => choose(CHOICE_NONE)}
      class="btn m-auto shadow justify-center md:w-full no-give" 
      class:bg-accent={choice !== CHOICE_NONE}
      class:bg-none={choice === CHOICE_NONE} 
      class:border={choice === CHOICE_NONE}
      style="padding: 1em 2em; border-color: #205164;">
      Ne rien donner à Sheaft
    </button>
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
        <button 
          type="button"
          class:disabled={isLoadingPaymentInfo}
          disabled={isLoadingPaymentInfo}
          on:click={handleSubmit}
          class="btn btn-lg btn-primary w-full justify-center" style="padding: 1em 2em;">
          {#if choice === CHOICE_EURO}
            Poursuivre en faisant don de 1€
          {/if}
          {#if choice === CHOICE_ROUNDED}
             Poursuivre en faisant don de {formatMoney(roundedValue)}
          {/if}
          {#if choice === CHOICE_NONE}
             Poursuivre sans donner à Sheaft
          {/if}
          {#if isLoadingPaymentInfo}
            <Icon data={faCircleNotch} spin class="ml-2" />
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