<script>
	import Icon from "svelte-awesome";
	import { slide } from 'svelte/transition';
	import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
	import { errors } from "../stores/errors";

	export let errorsHandler = null, displayIcon = true, classes = null, componentErrors = [], retry = false;

	const getErrors = () => {
		if (!errorsHandler) {
			return;//console.error("Prop errorsHandler cannot be null.");
		}

		componentErrors = errorsHandler.getErrors();
	}

	const refresh = () => {
		location.reload();
	};

	$: getErrors($errors);
</script>

{#if componentErrors.length >= 1}
	<div class="mb-10 p-4 border border-red-500 text-red-500 lg:flex flex-row {classes}" in:slide>
		{#if displayIcon}
			<div class="hidden lg:block">
				<Icon data={faExclamationTriangle} class="lg:mr-2 lg:mt-2 lg:mb-0 mb-2" />
			</div>
		{/if}
		<div class="text-center lg:text-left" style="word-break: break-word;">
				<slot />
				{#each componentErrors as error}
					<p>{error.message}</p>
				{/each}
				<p class="mt-2">Si le problème persiste, contactez le service technique.</p>
				{#if retry}
					<button class="btn btn-lg btn-accent m-auto lg:m-0" on:click={refresh}>Réessayer</button>
				{/if}
		</div>
	</div>
{/if}

<style>
	p {
		@apply mb-2;
	}
</style>