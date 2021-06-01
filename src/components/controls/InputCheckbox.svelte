<script>
	export let checked,
		disabled = false,
		onClick = () => {},
		classes = null;

</script>

<input
	type="checkbox"
	class="cbx"
	name="checkbox"
	style="display: none;"
	{disabled}
	on:click|stopPropagation={() => {
		if (!disabled) return onClick();
		return false;
	}}
	bind:checked
/>
<label
	style="margin: 0;"
	for="cbx"
	class="check {classes}"
	on:click={() => {
		if (!disabled) return onClick();
		return false;
	}}
>
	<svg width="18px" height="18px" viewBox="0 0 18 18" class="rounded" class:disabled>
		<path
			d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16
      16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"
		/>
		<polyline points="1 9 7 14 15 4" />
	</svg>
</label>

<style lang="scss">
	.check {
		display: inline-block;
		cursor: pointer;
		position: relative;
		width: 18px;
		height: 18px;
		-webkit-tap-highlight-color: transparent;
		transform: translate3d(0, 0, 0);

		svg {
			position: relative;
			display: inline-block;
			z-index: 1;
			fill: none;
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke: #c8ccd4;
			stroke-width: 1.5;
			transform: translate3d(0, 0, 0);
			transition: all 0.2s ease;
			path {
				stroke-dasharray: 60;
				stroke-dashoffset: 0;
			}
			polyline {
				stroke-dasharray: 22;
				stroke-dashoffset: 66;
			}

			&.disabled {
				@apply bg-gray-200;
				cursor: not-allowed;
			}

			&:hover {
				&:before {
					opacity: 1;
				}
				svg {
					stroke: #ff4081;
				}
			}
		}
	}

	input.cbx:checked + .check {
		svg {
			stroke: #ff4081;
			path {
				stroke-dashoffset: 60;
				transition: all 0.3s linear;
			}
			polyline {
				stroke-dashoffset: 42;
				transition: all 0.2s linear;
				transition-delay: 0.15s;
			}
		}
	}

</style>
