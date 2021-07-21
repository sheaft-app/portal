<script>
	import { GET_BATCH_DETAILS } from "./queries";
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import GetRouterInstance from "../../services/SheaftRouter";
	import BatchesRoutes from "./routes";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import { timeSpanToTime } from "../../helpers/app";
	import Observations from "../../components/observations/Observations.svelte";

	export let params = {};

	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let batch;
	let displayObservationsPanel = false;
	let isLoading = true;

	onMount(async () => {
		isLoading = true;
		batch = await query({
			query: GET_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(BatchesRoutes.History),
			errorNotification: "Impossible de trouver le lot.",
		});
		console.log(batch);
		isLoading = false;
	});
</script>

<TransitionWrapper>
	<PageHeader name="Détails du lot" previousPage={BatchesRoutes.List} />
	<PageBody {errorsHandler} {isLoading}>
		<p class="text-2xl font-semibold">
			Lot numéro {batch.number}
		</p>
		<p>créé le {format(new Date(batch.createdOn), "PPPP", { locale: fr })}</p>
		{#if batch.dlc}
			<p>DLC : {format(new Date(batch.dlc), "PPPP", { locale: fr })}</p>
		{/if}
		{#if batch.dluo}
			<p>DDM : {format(new Date(batch.ddm), "PPPP", { locale: fr })}</p>
		{/if}
		{#if batch.observations.length > 0}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100
				shadow md:rounded md:mb-2 mt-3"
			>
				<p class="uppercase font-bold leading-none">Des observations ont été remontées !</p>
				<div class="mt-2">
					<p>Des observations ont été remontées par un ou plusieurs magasins concernant ce lot.</p>
					<p>Vous pouvez les consulter en cliquant sur le bouton ci-dessous.</p>
					<button class="btn btn-outline btn-lg mt-2" on:click={() => displayObservationsPanel = true}>Voir les observations</button>
				</div>
			</div>
		{/if}
		{#each batch.products as product}
			<div
				class="bg-white overflow-hidden rounded-lg p-3 lg:p-6 shadow flex
				relative flex-wrap justify-between mt-3"
			>
				<p>{product.name}</p>
			</div>
		{/each}

		{#if displayObservationsPanel}
			<Observations 
				title="Observations du lot" 
				observations={batch.observations} 
				on:close={() => displayObservationsPanel = false}
			/>
		{/if}
	</PageBody>
</TransitionWrapper>
