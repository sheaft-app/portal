<script>
  import SvelteDatePicker from "./datepicker/SvelteDatePicker.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";

  export let placeholder = null;
  export let selected = new Date();
  export let dateChosen = false;

  let formattedSelected;
</script>

<SvelteDatePicker
  format={date => format(new Date(selected), 'PPPP', { locale: fr })}
  bind:selected
  bind:dateChosen
  bind:formattedSelected
  style="width: 100%">
  <button
    type="button"
    class="btn btn-white btn-lg"
    aria-label="Sélectionner une date"
    class:active={dateChosen}>
    {#if dateChosen}
      {formattedSelected}
    {:else}
      {placeholder || 'Sélectionnez une date'}
    {/if}
  </button>
</SvelteDatePicker>

<style lang="scss">
  button {
    &.active {
      background-color: #ff4081; 
      @apply text-white;
    }
  }
</style>
