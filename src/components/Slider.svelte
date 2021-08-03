<script>
	import { hslide } from "./hslide";
	import Icon from "svelte-awesome";
	import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

	export let start = 0,
		slides = [];

	let cur = start;

	function changeSlide(slide) {
		cur = slide;
	}

	const clamp = (number, min, max) => Math.min(Math.max(number, min), max);
	const transition_args = {
		duration: 200,
	};

	function prev(e) {
		e.stopPropagation();
		cur = clamp(--cur, 0, slides.length - 1);
	}

	function next(e) {
		cur = clamp(++cur, 0, slides.length - 1);
	}

	const ARROW_LEFT = 37;
	const ARROW_RIGHT = 39;
	function handleShortcut(e) {
		if (e.keyCode === ARROW_LEFT) {
			prev();
		}
		if (e.keyCode === ARROW_RIGHT) {
			next();
		}
	}
</script>

<svelte:window on:keyup={handleShortcut} />

<div class="extra-outer-wrapper">
	<div class="outer-wrapper">
		<div class="inner-wrapper">
			{#each slides as slide, index}
				{#if index === cur}
					<div class="slide px-1">
						<slot {slide} {index} />
					</div>
				{/if}
			{/each}
			<div class="controls">
				<button type="button" on:click={() => prev()} class:invisible={cur === 0}>
					<Icon data={faChevronLeft} />
				</button>
				<button type="button" on:click={() => next()} class:invisible={cur === slides.length - 1}>
					<Icon data={faChevronRight} />
				</button>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	button {
		background-color: #ff4081;
		color: #ffffff;
		@apply p-2;
		@apply rounded-full;
		@apply text-white;
		@apply flex;
		@apply shadow;
		@apply items-center;
		@apply justify-center;
		@apply w-6;
		@apply h-6;
	}

	.extra-outer-wrapper {
		width: 100%;
		margin: 0 auto;
	}

	.outer-wrapper {
		width: 100%;
		position: relative;
	}

	.inner-wrapper {
		height: 100%;
		width: 100%;
		display: flex;
	}

	.controls button:first-child {
		position: absolute;
		left: 0;
		top: calc(1.2rem);
	}

	.controls button:last-child {
		position: absolute;
		right: 0;
		top: calc(1.2rem);
	}

	.slide {
		flex: 1 0 auto;
		justify-content: center;
		display: flex;
		margin-left: 10px;
		overflow: hidden;

		@media (max-width: 768px) {
			width: 100%;
			margin-left: 0;
		}
	}

	.controls {
		text-align: center;
		display: block;
	}
</style>
