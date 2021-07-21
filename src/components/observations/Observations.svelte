<script>
	import { fly } from "svelte/transition";
	import { onMount, getContext, createEventDispatcher, onDestroy } from "svelte";
	import { GET_OBSERVATIONS } from "../queries";
	import Chat from "./Chat.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import { faTimes, faChevronLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
  	import { portal } from "svelte-portal";
	
	export let observations = [];
	export let title = "Observations";

	const dispatch = createEventDispatcher();
	const errorsHandler = new SheaftErrors();
	const { query } = getContext("api");

	let isLoading = false;
	let selectedObservation = null;

	var popStateListener = (event) => {
		if (selectedObservation) {
			return selectedObservation = null;
		} 
		return close();
	};

	onMount(async () => {
		window.addEventListener("popstate", popStateListener, false);
		history.pushState({ observations }, "Observations");

		if (observations.length > 0) {
			return;
		}

		isLoading = true;
		observations = await query({
			query: GET_OBSERVATIONS,
			errorsHandler,
			error: () => close(),
			errorNotification: "Impossible de récupérer les observations."
		});
		isLoading = false;
	})

	onDestroy(() => {
		window.removeEventListener("popstate", popStateListener, false);
	});

	const close = () => dispatch('close');

	const selectObservation = observation => {
		history.pushState({ observation }, "Observations");
		selectedObservation = observation;
	}
</script>

<div
	transition:fly|local={{ x: -600, duration: 300 }}
	class="fixed active overflow-y-scroll overflow-x-hidden shadow left-0 top-0
		h-screen observations-panel bg-white px-4"
	style="z-index: 10; padding-bottom: 70px;"
>
	<div class="mb-3 mt-3">
		{#if selectedObservation}
			<button class="text-gray-600 items-center flex uppercase" on:click={() => selectedObservation = null}>
				<Icon data={faChevronLeft} class="mr-2 inline" />
				Retour
			</button>
		{:else}
			<button class="text-gray-600 items-center flex uppercase" on:click={close}>
				<Icon data={faTimes} class="mr-2 inline" />
				Fermer
			</button>
		{/if}
	</div>
	<h1 class="font-semibold uppercase t">{title}</h1>
	<span class="bg-primary h-1 w-20 block mt-2 mb-4" />
	{#if isLoading}
		<p>Chargement...</p>
	{:else if !selectedObservation}
		<div in:fly|local={{ x: 200, duration: 300 }}>
			{#each observations as observation}
				<div class="flex bg-white shadow px-4 py-2 rounded hover:bg-gray-100 cursor-pointer mb-2 items-center" 
					on:click={() => selectObservation(observation)}>
					<div class="w-1/12">
						<img
							src={observation.user.picture ?? "img/icons/store.svg"}
							alt="Photo"
							class="w-8 h-8 rounded-full"
						/>
					</div>
					<div class="w-9/12 ml-3">
						<p class="font-semibold">{observation.user.name}</p>
						<p class="text-gray-600 truncate" style="max-width: 200px;">{observation.comment}</p>
						{#if observation.replies.length > 0}
							<p class="text-green-500 text-sm">
								<Icon data={faCheck} class="mr-2" /> 
								Vous avez répondu à cette observation
							</p>
						{/if}
					</div>
					<p class="text-gray-600 w-2/12">{format(new Date(observation.createdOn), "P", { locale: fr })}</p>
				</div>
			{:else}
				<p>Aucune observation remontée.</p>
			{/each}
		</div>
	{:else}
		<div transition:fly|local={{ x: 200, duration: 300 }}>
			<Chat 
				on:previous={() => selectedObservation = null} 
				observation={selectedObservation} 
			/>
		</div>
	{/if}
</div>
<div use:portal={"body"} class="cursor-pointer w-full h-full opacity-50 bg-black fixed hidden
lg:block top-0"
	style="z-index: 7;"
	on:click={close}
/>

<style lang="scss">
	$panel-size: 600px;

	.observations-panel {
		width: $panel-size;

		@media (max-width: 1024px) {
			width: 100%;
		}

		@media (max-width: 1024px) {
			top: 45px;
			padding-bottom: 115px !important;
		}
	}
</style>