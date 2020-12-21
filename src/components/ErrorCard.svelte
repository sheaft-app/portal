<script>
	import Icon from "svelte-awesome";
	import { slide } from 'svelte/transition';
	import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
	import { errors } from "../stores/errors";
	import { createNewTicket } from "../services/SheaftFreshdesk";
	import { authAuthenticated, authUserAccount } from "../stores/auth";

	export let errorsHandler = null, displayIcon = true, classes = null, componentErrors = [], retry = false;
	let bgColor = "bg-red-500";
	const getErrors = () => {
		if (!errorsHandler) {
			return;//console.error("Prop errorsHandler cannot be null.");
		}

		componentErrors = errorsHandler.getErrors();
		
		if(componentErrors.filter(e => e.code == "BadRequest" || e.code == "Unexpected" || e.code == "EXEC_INVALID_TYPE").length > 0)
			bgColor = "bg-red-500";
		else
			bgColor = "bg-orange-500";
	}

	const refresh = () => {
		location.reload();
	};
	
	const scrollTo = (node) => {
		var headerOffset = document.getElementById('navbar').offsetHeight;
		var elementPosition = node.offsetTop;
		var offsetPosition = elementPosition - headerOffset;
		
		window.scrollTo({
				top: offsetPosition,
				behavior: "smooth"
		});  
	}

	const openHelp= () => {
		createNewTicket(null, $authUserAccount.profile, componentErrors)
	}

	$: getErrors($errors);
</script>

{#if componentErrors.length >= 1}
	<div use:scrollTo class="mb-10 p-4 {bgColor} text-white lg:flex flex-row {classes}" in:slide>
		{#if displayIcon}
			<div class="hidden lg:block">
				<Icon data={faExclamationTriangle} class="lg:mr-2 lg:mt-2 lg:mb-0 mb-2" />
			</div>
		{/if}
		<div class="text-center lg:text-left" style="word-break: break-word;">
				<slot />
				{#each componentErrors as error}
					<p>{@html error.message}</p>
				{/each}
				{#if $authAuthenticated}					
				<p class="mt-2">
					Si le problème persiste, contactez le service technique en <a href="javascript:void(0)" on:click="{openHelp}" style="color:white;font-weight:bold;">cliquant ici</a>
					</p>
				{:else}
				<p class="mt-2">
					Si le problème persiste, contactez le service technique en envoyant un email à <a href="mailto:support@sheaft.com" style="color:white;font-weight:bold;">support@sheaft.com</a>
					</p>
				{/if}
				{#if retry}
					<button class="btn btn-lg btn-white m-auto lg:m-0" on:click={refresh}>Recharger la page</button>
				{/if}
		</div>
	</div>
{/if}

<style>
	p {
		@apply mb-2;
	}
</style>