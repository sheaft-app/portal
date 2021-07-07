<script>
    export let label;
    export let value = 0;
    export let showLabel = true;
    export let disabled = false;
    export let max = 999;
    export let color;

    const handleLess = () => {
      if (disabled) return;
        
      if (value !== 0) {
        value = (value || 1) - 1;
		  }
	};

	const handleMore = () => {
		if (value >= max || disabled) return;

		value = (value || 0) + 1;
	};

	const handleInput = (e) => {
    if (disabled) return;
		if (e.target.value.length > e.target.maxLength) {
			e.target.value = e.target.value.slice(0, e.target.maxLength);
		}

		if (e.target.value < 0) {
			e.target.value = 0;
		}
	};
</script>

<div class="custom-number-input">
    {#if showLabel}
        <label for="custom-input-number" class="w-full text-{color} text-sm font-semibold">{value || 0} {label}</label>
    {/if}
    <div class="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
        <button {disabled} on:click={handleLess} type="button" data-action="decrement" class=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none">
            <span class="m-auto text-2xl font-thin">−</span>
        </button>
        <input on:input={(e) => handleInput(e)} bind:value type="number" class="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-{color} outline-none" name="custom-input-number"/>
        <button {disabled} on:click={handleMore} type="button" data-action="increment" class="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer">
            <span class="m-auto text-2xl font-thin">+</span>
        </button>
    </div>
</div>

<style>
    input[type='number']::-webkit-inner-spin-button,
    input[type='number']::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  
    .custom-number-input input:focus {
      outline: none !important;
    }
  
    .custom-number-input button:focus {
      outline: none !important;
    }
  </style>