<script>
	import { createEventDispatcher } from "svelte";
	import { flip } from "svelte/animate";
	import Icon from "svelte-awesome";
	import { faBars, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
	import isEqual from "lodash/isEqual";

	const dispatch = createEventDispatcher();

	export let data = [],
		component = null,
		activeItemRule = null,
		disableGrab = false,
		isPristine = true,
		displayButtons = true,
		classes = "",
		dropEvent = () => {},
		multipleDropEvent = () => {};

	let ghost;
	let grabbed;
	let lastTarget;
	let mouseY = 0; // pointer y coordinate within client
	let offsetY = 0; // y distance from top of grabbed element to pointer
	let layerY = 0; // distance from top of list to top of client
	let originalOrder = data;
	let newOrder = originalOrder;

	$: isPristine = isEqual(
		originalOrder.map((i) => i.name),
		newOrder.map((i) => i.name)
	);

	export const reset = () => {
		data = originalOrder;
		newOrder = originalOrder;
	};

	export const getAndSave = () => {
		const values = newOrder.map((d) => d.name);

		return dispatch("save", {
			data: values,
		});
	};

	function grab(clientY, element) {
		if (disableGrab) return;
		// modify grabbed element
		const elementToCopy = element.closest(".item-dragdrop");
		grabbed = elementToCopy;
		grabbed.dataset.grabY = clientY;
		// modify ghost element (which is actually dragged)
		ghost.innerHTML = grabbed.innerHTML;
		// record offset from cursor to top of element
		// (used for positioning ghost)
		offsetY = grabbed.getBoundingClientRect().y - clientY;
		drag(clientY);
	}
	// drag handler updates cursor position
	function drag(clientY) {
		if (grabbed) {
			mouseY = clientY;
			layerY = ghost.parentNode.getBoundingClientRect().y;
		}
	}
	// touchEnter handler emulates the mouseenter event for touch input
	// (more or less)
	function touchEnter(ev) {
		drag(ev.clientY);
		// trigger dragEnter the first time the cursor moves over a list item
		let target = document.elementFromPoint(ev.clientX, ev.clientY).closest(".item-dragdrop");
		if (target && target != lastTarget) {
			lastTarget = target;
			dragEnter(ev, target);
		}
	}
	function dragEnter(ev, target) {
		// swap items in data
		if (grabbed && target != grabbed && target.classList.contains("item-dragdrop")) {
			moveDatum(parseInt(grabbed.dataset.index), parseInt(target.dataset.index));
		}
	}
	// does the actual moving of items in data
	function moveDatum(from, to) {
		let temp = data[from];
		data = [...data.slice(0, from), ...data.slice(from + 1)];
		data = [...data.slice(0, to), temp, ...data.slice(to)];
	}
	function release(ev) {
		newOrder = data;
		dispatch("changedOrder", newOrder);
		grabbed = null;
	}
	function removeDatum(index) {
		data = [...data.slice(0, index), ...data.slice(index + 1)];
	}
</script>

<div class="sorting-list">
	<div
		bind:this={ghost}
		id="ghost"
		class={grabbed ? "item haunting" : "item"}
		style={"top: " + (mouseY + offsetY - layerY) + "px"}
	>
		<p />
	</div>
	<div
		class="list"
		on:mousemove={function (ev) {
			drag(ev.clientY);
		}}
		on:touchmove={function (ev) {
			drag(ev.touches[0].clientY);
		}}
		on:mouseup={function (ev) {
			release(ev);
		}}
		on:touchend={function (ev) {
			release(ev.touches[0]);
		}}
	>
		{#if component}
			{#each data as datum, i (datum.id ? datum.id : JSON.stringify(datum))}
				<div
					class="item-dragdrop {classes}"
					class:cursor-move={!disableGrab}
					class:active={activeItemRule !== null ? activeItemRule(datum) : ""}
					data-grabY="0"
					id={grabbed && (datum.id ? datum.id : JSON.stringify(datum)) == grabbed.dataset.id ? "grabbed" : ""}
					data-index={i}
					data-id={datum.id ? datum.id : JSON.stringify(datum)}
					on:dropped={dropEvent}
					on:dropped-multiple={multipleDropEvent}
					on:mouseenter={function (ev) {
						ev.stopPropagation();
						dragEnter(ev, ev.target);
					}}
					on:mousedown={function (ev) {
						grab(ev.clientY, this);
					}}
					on:touchmove={function (ev) {
						ev.stopPropagation();
						ev.preventDefault();
						touchEnter(ev.touches[0]);
					}}
					on:touchstart={function (ev) {
						grab(ev.touches[0].clientY, this);
					}}
					animate:flip={{ duration: 200 }}
				>
					{#if displayButtons}
						<div class="buttons w-2/12">
							<button
								class="up"
								type="button"
								style={"visibility: " + (i > 0 ? "" : "hidden") + ";"}
								on:click={function (ev) {
									moveDatum(i, i - 1);
								}}
							>
								<Icon data={faChevronUp} />
							</button>
							<button
								class="down"
								type="button"
								style={"visibility: " + (i < data.length - 1 ? "" : "hidden") + ";"}
								on:click={function (ev) {
									moveDatum(i, i + 1);
								}}
							>
								<Icon data={faChevronDown} />
							</button>
						</div>
					{/if}
					<div class="w-10/12">
						<svelte:component this={component} props={datum} />
					</div>
				</div>
			{/each}
		{:else}
			{#each data as datum, i (datum.id ? datum.id : JSON.stringify(datum))}
				<div
					class="item-dragdrop {classes}"
					data-grabY="0"
					id={grabbed && (datum.id ? datum.id : JSON.stringify(datum)) == grabbed.dataset.id ? "grabbed" : ""}
					data-index={i}
					on:dropped={dropEvent}
					on:mouseenter={function (ev) {
						ev.stopPropagation();
						dragEnter(ev, ev.target);
					}}
					on:mousedown={function (ev) {
						grab(ev.clientY, this);
					}}
					on:touchmove={function (ev) {
						ev.stopPropagation();
						ev.preventDefault();
						touchEnter(ev.touches[0]);
					}}
					on:touchstart={function (ev) {
						grab(ev.touches[0].clientY, this);
					}}
					data-id={datum.id ? datum.id : JSON.stringify(datum)}
					animate:flip={{ duration: 200 }}
				>
					<div class="buttons w-2/12">
						<button
							class="up"
							type="button"
							style={"visibility: " + (i > 0 ? "" : "hidden") + ";"}
							on:click={function (ev) {
								moveDatum(i, i - 1);
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px"
								><path d="M0 0h24v24H0V0z" fill="none" /><path
									d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"
								/></svg
							>
						</button>
						<button
							class="down"
							type="button"
							style={"visibility: " + (i < data.length - 1 ? "" : "hidden") + ";"}
							on:click={function (ev) {
								moveDatum(i, i + 1);
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px"
								><path d="M0 0h24v24H0V0z" fill="none" /><path
									d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
								/></svg
							>
						</button>
					</div>
					<div class="content w-10/12">
						<p>{datum}</p>
					</div>
					<div
						class="mover"
						on:mousedown={function (ev) {
							grab(ev.clientY, this);
						}}
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.sorting-list {
		position: relative;
		@apply mb-2;
	}
	.list {
		z-index: 0;
		display: flex;
		flex-direction: column;
	}
	.item-dragdrop {
		box-sizing: border-box;
		display: flex;
		@apply justify-between mb-1 shadow;
		width: 100%;
		min-height: 3em;
		border-radius: 2px;
		user-select: none;
	}
	.item-dragdrop:not(.active) {
		background-color: white;
	}
	.item-dragdrop:last-child {
		margin-bottom: 0;
	}
	.item-dragdrop > * {
		margin: auto;
	}
	.buttons {
		width: 32px;
		min-width: 32px;
		margin: auto 0;
		display: flex;
		flex-direction: column;
	}
	.mover {
		cursor: grab;
	}
	.buttons button {
		cursor: pointer;
		width: 18px;
		height: 18px;
		margin: 0 auto;
		padding: 0;
		border: 1px solid rgba(0, 0, 0, 0);
	}
	.buttons button:focus {
		border: 1px solid black;
	}
	.delete {
		width: 32px;
	}
	#grabbed {
		opacity: 0;
	}
	#ghost {
		pointer-events: none;
		z-index: -5;
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		background-color: #fafafa;
		align-items: center;
		@apply shadow;
		display: inline-flex;
		opacity: 0;
	}
	#ghost * {
		pointer-events: none;
	}
	#ghost.haunting {
		z-index: 20;
		opacity: 1;
	}
</style>
