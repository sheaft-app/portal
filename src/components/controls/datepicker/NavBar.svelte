<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let month;
	export let year;
	export let start;
	export let end;
	export let canIncrementMonth;
	export let canDecrementMonth;
	export let monthsOfYear;

	let monthSelectorOpen = false;
	let availableMonths;

	$: {
		let isOnLowerBoundary = start.getFullYear() === year;
		let isOnUpperBoundary = end.getFullYear() === year;
		availableMonths = monthsOfYear.map((m, i) => {
			return Object.assign(
				{},
				{
					name: m[0],
					abbrev: m[1],
				},
				{
					selectable:
						(!isOnLowerBoundary && !isOnUpperBoundary) ||
						((!isOnLowerBoundary || i >= start.getMonth()) && (!isOnUpperBoundary || i <= end.getMonth())),
				}
			);
		});
	}

	function toggleMonthSelectorOpen() {
		monthSelectorOpen = !monthSelectorOpen;
	}

	function monthSelected(event, { m, i }) {
		event.stopPropagation();
		if (!m.selectable) return;
		dispatch("monthSelected", i);
		toggleMonthSelectorOpen();
	}
</script>

<div class="title">
	<div class="scal-heading-section">
		<div
			class="scal-control"
			class:scal-enabled={canDecrementMonth}
			on:click={() => dispatch("incrementMonth", -1)}
		>
			<i class="scal-arrow scal-left" />
		</div>
		<div class="scal-label" on:click={toggleMonthSelectorOpen}>
			{monthsOfYear[month][0]}
			{year}
		</div>
		<div class="scal-control" class:scal-enabled={canIncrementMonth} on:click={() => dispatch("incrementMonth", 1)}>
			<i class="scal-arrow scal-right" />
		</div>
	</div>
	<div class="scal-month-selector" class:scal-open={monthSelectorOpen}>
		{#each availableMonths as monthDefinition, index}
			<div
				class="scal-month-selector--month"
				class:scal-selected={index === month}
				class:scal-selectable={monthDefinition.selectable}
				on:click={(e) => monthSelected(e, { m: monthDefinition, i: index })}
			>
				<span>{monthDefinition.abbrev}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.scal-heading-section {
		font-size: 20px;
		padding: 24px 15px;
		display: flex;
		justify-content: space-between;
		color: #3d4548;
		font-weight: bold;
	}
	.scal-label {
		cursor: pointer;
	}
	.scal-month-selector {
		position: absolute;
		top: 75px;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		transition: all 300ms;
		transform: scale(1.2);
		opacity: 0;
		visibility: hidden;
		z-index: 1;
		text-align: center;
	}
	.scal-month-selector.scal-open {
		transform: scale(1);
		visibility: visible;
		opacity: 1;
	}
	.scal-month-selector--month {
		width: 31.333%;
		margin: 0.5%;
		height: 23%;
		display: inline-block;
		color: #4a4a4a;
		border: 1px solid #efefef;
		opacity: 0.2;
	}
	.scal-month-selector--month.scal-selectable {
		opacity: 1;
	}
	.scal-month-selector--month.scal-selectable:hover {
		cursor: pointer;
		box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.15);
		border-color: #009688;
		color: #009688;
	}
	.scal-month-selector--month.scal-selected {
		background: none;
		border-color: #ff4081;
		color: #ff4081;
	}
	.scal-month-selector--month:before {
		content: " ";
		display: inline-block;
		height: 100%;
		vertical-align: middle;
	}
	.scal-month-selector--month span {
		vertical-align: middle;
		display: inline-block;
	}

	.scal-control {
		padding: 0 8px;
		opacity: 0.2;
		transform: translateY(3px);
	}

	.scal-control.scal-enabled {
		opacity: 1;
		cursor: pointer;
	}

	.scal-arrow {
		display: inline-block;
		width: 18px;
		height: 18px;
		border-style: solid;
		border-color: #a9a9a9;
		border-width: 0;
		border-bottom-width: 2px;
		border-right-width: 2px;
	}

	.scal-arrow.scal-right {
		transform: rotate(-45deg);
		-webkit-transform: rotate(-45deg);
	}

	.scal-arrow.scal-left {
		transform: rotate(135deg);
		-webkit-transform: rotate(135deg);
	}
</style>
