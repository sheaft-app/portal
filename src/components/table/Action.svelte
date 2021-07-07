<script>
	import Icon from "svelte-awesome";
	import { toggleMoreActions } from "../../stores/app";

	export let click = () => {},
		hideIfDisabled = false,
		disabled = false,
		text = "",
		icon = null,
		color = "gray",
		selectedItemsNumber = 0,
		displaySelectedItemsNumber = false;

	const handleClick = () => {
		$toggleMoreActions = false;
		click();
	}

</script>

{#if !disabled || !hideIfDisabled}
	<button
		on:click={handleClick}
		{disabled}
		aria-label={text}
		class="{!disabled ? `text-${color}-500 hover:text-${color}-300 cursor-pointer` : `text-gray-500 cursor-not-allowed`}
		py-3 px-3 md:py-1 rounded items-center flex transition duration-300 ease-in-out"
	>
		{#if icon}
			<Icon data={icon} class="mr-2 inline w-4 h-3" />
		{/if}
		<span>{text}</span>
		{#if selectedItemsNumber > 0 && displaySelectedItemsNumber && !disabled}
			<span>&nbsp;({selectedItemsNumber})</span>
		{/if}
	</button>
{/if}
