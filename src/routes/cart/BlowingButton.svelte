<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let blowed = false;

	const animateButton = (e) => {
		dispatch("click");

		e.preventDefault;
		e.target.classList.remove("animate");
		e.target.classList.add("animate");
		blowed = true;
		return setTimeout(() => {
			e.target.classList.remove("animate");
		}, 700);
	};

	export let text = "Action";
	export let blowedText = "Merci";

</script>

<button style="display: none;" class="bubbly-button animate" />
<button
	class="bubbly-button rounded-full m-auto md:w-full"
	class:blowed
	on:click={(e) => {
		if (!blowed) animateButton(e);
	}}
>
	{#if !blowed}
		{text}
	{:else}
		{blowedText}
	{/if}
</button>

<style lang="scss">
	.link {
		background: none;
		border: none;
		color: #ff4081;
	}
	.bubbly-button {
		@media (max-width: 375px) {
			width: 220px;
		}

		@media (min-width: 376px) {
			width: 265px;
		}

		@media (min-width: 580px) {
			width: 100%;
		}

		display: block;
		font-size: 1em;
		padding: 1em 2em;
		margin-top: 20px;
		margin-bottom: 20px;
		-webkit-appearance: none;
		appearance: none;
		background-color: #ff4081;
		color: #fff;
		border: none;
		cursor: pointer;
		position: relative;
		transition: transform ease-in 0.1s;
		box-shadow: 0 2px 15px rgba(255, 0, 130, 0.5);
	}
	.bubbly-button.blowed {
		cursor: default;
		border: 1px solid green;
		background: none;
		box-shadow: none;
		color: green;
	}
	.bubbly-button:focus {
		outline: 0;
	}
	.bubbly-button:before,
	.bubbly-button:after {
		position: absolute;
		content: "";
		display: block;
		width: 140%;
		height: 100%;
		left: -20%;
		z-index: -1000;
		transition: all ease-in-out 0.5s;
		background-repeat: no-repeat;
	}
	.bubbly-button:before {
		display: none;
		top: -75%;
		background-image: radial-gradient(circle, #ff4081 20%, transparent 20%),
			radial-gradient(circle, transparent 20%, #ff4081 20%, transparent 30%),
			radial-gradient(circle, #ff4081 20%, transparent 20%), radial-gradient(circle, #ff4081 20%, transparent 20%),
			radial-gradient(circle, transparent 10%, #ff4081 15%, transparent 20%),
			radial-gradient(circle, #ff4081 20%, transparent 20%), radial-gradient(circle, #ff4081 20%, transparent 20%),
			radial-gradient(circle, #ff4081 20%, transparent 20%), radial-gradient(circle, #ff4081 20%, transparent 20%);
		background-size: 10% 10%, 20% 20%, 15% 15%, 20% 20%, 18% 18%, 10% 10%, 15% 15%, 10% 10%, 18% 18%;
	}
	.bubbly-button:after {
		display: none;
		bottom: -75%;
		background-image: radial-gradient(circle, #ff4081 20%, transparent 20%),
			radial-gradient(circle, #ff4081 20%, transparent 20%),
			radial-gradient(circle, transparent 10%, #ff4081 15%, transparent 20%),
			radial-gradient(circle, #ff4081 20%, transparent 20%), radial-gradient(circle, #ff4081 20%, transparent 20%),
			radial-gradient(circle, #ff4081 20%, transparent 20%), radial-gradient(circle, #ff4081 20%, transparent 20%);
		background-size: 15% 15%, 20% 20%, 18% 18%, 20% 20%, 15% 15%, 10% 10%, 20% 20%;
	}
	.bubbly-button:active {
		transform: scale(0.9);
		background-color: #ff2770;
		box-shadow: 0 2px 25px rgba(255, 0, 130, 0.2);
	}
	.bubbly-button.animate:before {
		display: block;
		animation: topBubbles ease-in-out 0.75s forwards;
	}
	.bubbly-button.animate:after {
		display: block;
		animation: bottomBubbles ease-in-out 0.75s forwards;
	}

	@keyframes topBubbles {
		0% {
			background-position: 5% 90%, 10% 90%, 10% 90%, 15% 90%, 25% 90%, 25% 90%, 40% 90%, 55% 90%, 70% 90%;
		}
		50% {
			background-position: 0% 80%, 0% 20%, 10% 40%, 20% 0%, 30% 30%, 22% 50%, 50% 50%, 65% 20%, 90% 30%;
		}
		100% {
			background-position: 0% 70%, 0% 10%, 10% 30%, 20% -10%, 30% 20%, 22% 40%, 50% 40%, 65% 10%, 90% 20%;
			background-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
		}
	}
	@keyframes bottomBubbles {
		0% {
			background-position: 10% -10%, 30% 10%, 55% -10%, 70% -10%, 85% -10%, 70% -10%, 70% 0%;
		}
		50% {
			background-position: 0% 80%, 20% 80%, 45% 60%, 60% 100%, 75% 70%, 95% 60%, 105% 0%;
		}
		100% {
			background-position: 0% 90%, 20% 90%, 45% 70%, 60% 110%, 75% 80%, 95% 70%, 110% 10%;
			background-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
		}
	}

</style>
