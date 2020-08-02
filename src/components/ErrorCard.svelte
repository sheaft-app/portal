<script>
	import Icon from "svelte-awesome";
	import { slide } from 'svelte/transition';
	import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
	import { errors } from "../stores/errors";

	export let errorsHandler = null, displayIcon = true, classes = null;

	let componentErrors = [];

	const getErrors = () => {
		if (!errorsHandler) {
			return;//console.error("Prop errorsHandler cannot be null.");
		}

		componentErrors = errorsHandler.getErrors();
	}

	$: getErrors($errors);
</script>

{#if componentErrors.length >= 1}
	<div class="mb-3 p-4 bg-red-500 text-white shadow lg:flex flex-row {classes}" in:slide>
		{#if displayIcon}
				<Icon data={faExclamationTriangle} class="hidden lg:block lg:mr-2 lg:mt-2 lg:mb-0 mb-2" />
		{/if}
		<div>
				<slot />
				{#each componentErrors as error}
					<p>{error.message}</p>
				{/each}
		</div>
	</div>
{/if}

<style>
	p {
		@apply mb-2;
	}
</style>