<script>
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import GetRouterInstance from "../services/SheaftRouter";

	export let previousPage;
	export let previousPageParams = {};
	export let buttons = [],
		name = "",
		subname;

	const routerInstance = GetRouterInstance();

</script>

<svelte:head>
	<title>{name}</title>
</svelte:head>

<section class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
	{#if previousPage}
		<div class="mb-3">
			<button class="text-gray-600 items-center flex uppercase" on:click={() => routerInstance.goTo(previousPage, previousPageParams)}>
				<Icon data={faChevronLeft} class="mr-2 inline" />
				{previousPage.Name}
			</button>
		</div>
	{/if}

	<h1 class="font-semibold uppercase mb-1">{name}</h1>
	{#if subname}
		<p>{subname}</p>
	{/if}
	{#if buttons && buttons.length > 0}
		<div class="flex mt-2">
			{#each buttons as button}
				{#if !button.hidden}
					<button
						class="btn btn-lg bg-white text-{button.color}-500 border border-{button.color}-500 hover:bg-{button.color}-500 hover:text-white mr-3"
						disabled={button.disabled}
						on:click={button.click}
					>
						{button.text}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
	<slot></slot>
</section>
