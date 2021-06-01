<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let selectedValue = [];
	export let activeSelectedValue = undefined;
	export let isDisabled = false;
	export let getSelectionLabel = undefined;

	function handleClear(i, event) {
		event.stopPropagation();
		dispatch("multiItemClear", { i });
	}

</script>

{#each selectedValue as value, i}
	<div
		class="ssp-multiSelectItem {activeSelectedValue === i ? 'ssp-active' : ''}
    {isDisabled ? 'ssp-disabled' : ''}"
	>
		<div class="ssp-multiSelectItem_label">
			{@html getSelectionLabel(value)}
		</div>
		{#if !isDisabled}
			<div class="ssp-multiSelectItem_clear" on:click={(event) => handleClear(i, event)}>
				<svg width="100%" height="100%" viewBox="-2 -2 50 50" focusable="false" role="presentation">
					<path
						d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
            l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
					/>
				</svg>
			</div>
		{/if}
	</div>
{/each}

<style>
	.ssp-multiSelectItem {
		background: var(--multiItemBG, #ebedef);
		margin: var(--multiItemMargin, 5px 5px 0 0);
		border-radius: var(--multiItemBorderRadius, 16px);
		height: var(--multiItemHeight, 32px);
		line-height: var(--multiItemHeight, 32px);
		display: flex;
		cursor: default;
		padding: var(--multiItemPadding, 0 10px 0 15px);
	}

	.ssp-multiSelectItem_label {
		margin: var(--multiLabelMargin, 0 5px 0 0);
	}

	.ssp-multiSelectItem:hover,
	.ssp-multiSelectItem.ssp-active {
		background-color: var(--multiItemActiveBG, #006fff);
		color: var(--multiItemActiveColor, #fff);
	}

	.ssp-multiSelectItem.ssp-disabled:hover {
		background: var(--multiItemDisabledHoverBg, #ebedef);
		color: var(--multiItemDisabledHoverColor, #c1c6cc);
	}

	.ssp-multiSelectItem_clear {
		border-radius: var(--multiClearRadius, 50%);
		background: var(--multiClearBG, #52616f);
		width: var(--multiClearWidth, 16px);
		height: var(--multiClearHeight, 16px);
		position: relative;
		top: var(--multiClearTop, 8px);
		text-align: var(--multiClearTextAlign, center);
		padding: var(--multiClearPadding, 1px);
	}

	.ssp-multiSelectItem_clear:hover,
	.ssp-active .ssp-multiSelectItem_clear {
		background: var(--multiClearHoverBG, #fff);
	}

	.ssp-multiSelectItem_clear:hover svg,
	.ssp-active .ssp-multiSelectItem_clear svg {
		fill: var(--multiClearHoverFill, #006fff);
	}

	.ssp-multiSelectItem_clear svg {
		fill: var(--multiClearFill, #ebedef);
		vertical-align: top;
	}

</style>
