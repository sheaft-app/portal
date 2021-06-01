<script>
	import { onMount } from "svelte";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import Cleave from "cleave.js";

	export let value,
		disabled = false,
		bindClassData = null;

	let ref;
	let cleave = null;

	onMount(() => {
		if (ref) {
			ref.focus();
		}
	});

	const initializeCleave = () => {
		cleave = new Cleave(".input-number", {
			numericOnly: true,
			numeralIntegerScale: 14,
			blocks: [14],
			numeralPositiveOnly: true,
			stripLeadingZeroes: false,
		});
	};

</script>

<input
	id="siret"
	bind:value
	use:initializeCleave
	bind:this={ref}
	use:bindClass={bindClassData}
	type="number"
	placeholder="00000000000000"
	class="m-auto input-number"
	class:disabled
	{disabled}
	maxLength="14"
	minLength="14"
/>

<style lang="scss">
	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type="number"] {
		-moz-appearance: textfield;
	}

	$char-w: 1ch;
	$gap: 0.7 * $char-w;
	$n-char: 14;
	$in-w: $n-char * ($char-w + $gap);

	input {
		display: block;
		border: none;
		padding: 0;
		margin: 0 auto;
		width: $in-w;
		color: #205164;
		background: repeating-linear-gradient(90deg, dimgrey 0, dimgrey $char-w, transparent 0, transparent $char-w + $gap)
			0 100% / #{$in-w - $gap} 2px no-repeat;
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
