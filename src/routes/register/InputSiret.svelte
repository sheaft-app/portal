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

$char-w: 1ch;
$gap: .7*$char-w;
$n-char: 14;
$in-w: $n-char*($char-w + $gap);

input {
	display: block;
	border: none;
  padding: 0;
  margin: 0 auto;
	width: $in-w;
  color: #205164;
	background: repeating-linear-gradient(90deg, 
		dimgrey 0, dimgrey $char-w, 
		transparent 0, transparent $char-w + $gap) 
		0 100%/ #{$in-w - $gap} 2px no-repeat;
	font: 3ch droid sans mono, consolas, monospace;
  letter-spacing: $gap;
  
  @media (max-width: 500px) {
    font-size: 2.35ch;
  }
	
	&:focus {
		outline: none;
		color: #009688;
	}
}
</style>