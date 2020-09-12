<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
	export let disabled = false;
	export let isChecked = false;
	export let toggleDotImageUrl = null;
	export let toggledLineColor = null;
	export let classNames = '';
	export let labelPosition = 'right';

	const handleChange = () => {
			isChecked = !isChecked;
			dispatch("change", isChecked);
	}
</script>

<div class="flex items-center mt-3 {classNames}">
  <label for="my_toggle" class="toggle">
		{#if labelPosition == "left"}
			<div class="mr-3 uppercase text-sm">
				<slot></slot>
			</div>
		{/if}
    <div class="relative">
      <input id="my_toggle" type="checkbox" disabled={disabled} checked={isChecked} on:change={handleChange} class="hidden" />
      <div class="toggle__line w-10 h-4 bg-gray-200 rounded-full shadow-inner" class:disabled={disabled}></div>
      <div class:bg-accent={isChecked} class="toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0" class:disabled={disabled}></div>
    </div>
		{#if labelPosition == "right"}
			<div class="ml-3 uppercase text-sm">
				<slot></slot>
			</div>
		{/if}
  </label>
</div>

<style>
	.toggle {
			z-index: 0;
			@apply flex !important;
			@apply cursor-pointer;
			@apply items-center;
	}
	.toggle__dot {
			top: -.25rem;
			left: -.25rem;
			transition: all 0.3s ease-in-out;
	}

	input:checked ~ .toggle__dot {
			transform: translateX(100%);
			background-color: #ff4081;
	}

	input:checked ~ .toggle__line {
			background-color: rgb(255, 211, 226);
	}
</style>