<script>
  import { onMount } from "svelte";
	import { bindClass } from '../../../vendors/svelte-forms/src/index';

  export let value, disabled = false, bindClassData = null;
  const max = 14;

  let ref;
  
  onMount(() => {
    if (ref) {
      ref.focus();
    }
  })
</script>

<input 
  id="siret" 
  bind:value 
  bind:this={ref}
  use:bindClass={bindClassData}
  type="number"
  placeholder="00000000000000" 
  on:input={e => {
    if (e.target.value.length > e.target.maxLength) {
      e.preventDefault();
      e.target.value = e.target.value
        .slice(0, e.target.maxLength - 1)
        .toString();
    }
  }}
  class="m-auto"
  class:disabled={disabled}
  {disabled}
  maxLength="14"
  minLength="14"/>

<style lang="scss">
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

input {
  border: none;
	width: 381px;
	padding: 0;
  background: 
    repeating-linear-gradient(90deg, 
        dimgrey 0, 
        dimgrey 1ch, 
        transparent 0, 
        transparent 1.5ch) 
      0 100%/100% 2px no-repeat;
  color: #205164;
  font: 3ch consolas, monospace;
  letter-spacing: .5ch;

  @media (max-width: 399px) {
    font-size: 2.5ch;
    width: 275px;
  }
}

input:focus {
  outline: none;
  color: #009688;
}
</style>