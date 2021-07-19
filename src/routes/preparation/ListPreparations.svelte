<script>
	import { getContext, onMount } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { GET_PICKINGS } from "./queries.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import ChooseAvailablePreparationModal from "./ChooseAvailablePreparationModal.svelte";
	import PreparationItem from "./PreparationItem.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import { writable } from "svelte/store";
	import { faPlay, faHistory } from "@fortawesome/free-solid-svg-icons";
	import PreparationRoutes from "./routes";
	import GetRouterInstance from "../../services/SheaftRouter";

	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();
	const { query } = getContext("api");
	const { open } = getContext("modal");

	let isLoading = false;
	let items = writable([]);

	const actions = [
		{
			click: () => handleCreatePreparation(),
			text: "Lancer une préparation",
			icon: faPlay,
			color: "green",
		},
		{
			click: () => routerInstance.goTo(PreparationRoutes.History),
			text: "Voir l'historique",
			icon: faHistory,
			color: "blue",
		},
	];

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_PICKINGS,
			errorsHandler,
			success: (res) => items.set(res.data),
			errorNotification: "Impossible de récupérer les préparations",
		});
		isLoading = false;
	});

	const handleCreatePreparation = () => open(ChooseAvailablePreparationModal);
</script>

<TransitionWrapper>
	<PageHeader name="Préparations" previousPage={null} subname={null} />
	<PageBody
		{errorsHandler}
		{isLoading}
		noResults={$items.length < 1}
		noResultsPage={null}
		loadingMessage="Chargement des préparations..."
	>
		<Actions {actions} />
		{#if $items.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-32">
				{#each $items as preparation}
					<PreparationItem {preparation} />
				{/each}
			</div>
		{:else}
			<p class="text-center">Aucune préparation en cours</p>
			<button on:click={handleCreatePreparation} class="btn btn-lg btn-accent m-auto mt-4"
				>Lancer une préparation</button
			>
		{/if}
	</PageBody>
</TransitionWrapper>
