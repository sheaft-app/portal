<script>
	import Action from "./Action.svelte";
	import Icon from "svelte-awesome";
	import { faCircle } from "@fortawesome/free-solid-svg-icons";
	import { toggleMoreActions } from "../../stores/app";

	export let actions = [],
		selectedItemsNumber = 0,
		show = true;

	let action = actions && actions.length == 1 ? actions[0] : null;
</script>

{#if show}
	{#if actions.some((c) => !c.disabled || (c.disabled && !c.hideIfDisabled))}
		<div
			class="p-2 mb-4 bg-white actions-bar rounded hidden md:block border border-gray-400"
			style="z-index: 1; max-width: fit-content;"
		>
			<div class="flex justify-between">
				{#each actions as act}
					<Action
						hideIfDisabled={act.hideIfDisabled}
						displaySelectedItemsNumber={act.displaySelectedItemsNumber}
						{selectedItemsNumber}
						click={act.click}
						disabled={act.disabled}
						text={act.text}
						icon={act.icon}
						color={act.color}
					/>
				{/each}
			</div>
		</div>

		<div class="fixed md:hidden" style="right: 20px; bottom: 20px; z-index: 2;">
			<button
				aria-label={action ? action.text : "Voir les actions disponibles"}
				on:click={action ? () => action.click() : () => toggleMoreActions.set(!$toggleMoreActions)}
				class="px-3 bg-{action ? `${action.color}-500` : 'accent'} py-3 h-16 w-16
			transition duration-200 ease-in-out rounded-full items-center flex
			justify-center shadow-lg text-white focus:outline-none"
				style="right: 20px; bottom: 20px;"
			>
				{#if action}
					<Icon data={action.icon} scale="1" class="inline" />
				{:else if selectedItemsNumber > 0}
					<div class="flex w-2/4 justify-center items-center">
						<span class="text-xl font-semibold">{selectedItemsNumber}</span>
					</div>
				{:else}
					<div class="inline-flex w-2/4 justify-between">
						<Icon data={faCircle} scale=".4" class=" inline" />
						<Icon data={faCircle} scale=".4" style="width: 6px;" />
						<Icon data={faCircle} scale=".4" class=" inline" />
					</div>
				{/if}
			</button>
			{#if $toggleMoreActions}
				<div class="absolute bg-white shadow-xl border border-gray-400" style="right: 0; bottom: 80px; width: max-content;">
					{#each actions as act}
						<Action
							{selectedItemsNumber}
							displaySelectedItemsNumber={act.displaySelectedItemsNumber}
							click={act.click}
							hideIfDisabled={act.hideIfDisabled}
							disabled={act.disabled}
							text={act.text}
							icon={act.icon}
							color={act.color}
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}
