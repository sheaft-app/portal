<script>
	let savedValue = 0;

	export let time = {
		hours: 0,
		minutes: 0,
	};

	let hourInput, minuteInput;

	function handleChangeHours(e) {
		if (e.target.value > 23) {
			e.target.value = 2;
		}

		// quand le premier caractère est supérieur à 2, ça veut dire qu'on est pas entre 10h et 23h donc c'est une heure à 1 chiffre, on peut passer à la 2ème case
		if (e.target.value > 2 || e.target.value.length == 2) {
			minuteInput.focus();
		}

		if (e.target.value.length > e.target.maxLength) {
			e.target.value = e.target.value.slice(0, e.target.maxLength);
		}
	}

	function handleChangeMinutes(e) {
		if (e.target.value > 59 && e.target.value.length <= 2) {
			e.target.value = e.target.value[0];
		}

		if (e.target.value.length > e.target.maxLength) {
			e.target.value = e.target.value.slice(0, e.target.maxLength);
		}
	}

	function handleHoursFocus(e) {
		savedValue = time.hours;
		e.target.value = "";
	}

	function handleMinutesFocus(e) {
		savedValue = time.minutes;
		e.target.value = "";
	}

	function handleBlur(e) {
		if (e.target.value == "") {
			e.target.value = savedValue;
		}
	}

</script>

<div class="time-group">
	<input
		min="0"
		max="23"
		maxLength="2"
		type="number"
		bind:value={time.hours}
		bind:this={hourInput}
		on:focus={handleHoursFocus}
		on:blur={handleBlur}
		on:input={(e) => handleChangeHours(e)}
	/>
	<span class="text-gray-600">h</span>
	<input
		min="0"
		max="59"
		maxLength="2"
		type="number"
		bind:value={time.minutes}
		bind:this={minuteInput}
		on:focus={handleMinutesFocus}
		on:blur={handleBlur}
		on:input={(e) => handleChangeMinutes(e)}
	/>
</div>

<style>
	.time-group {
		display: flex;
		align-items: center;
		border: 1px solid #cbd5e0;
		border-radius: 5px;
		width: max-content;
		background-color: #ffffff;
	}

	input {
		width: 60px;
		background-color: transparent;
		border: none;
		font-weight: 600;
		font-size: 1em;
		text-align: center;
		margin: 0;
	}

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

</style>
