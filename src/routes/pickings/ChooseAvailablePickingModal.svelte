<script>
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_AVAILABLE_PICKINGS, GET_PICKINGS } from "./queries.js";
	import { CREATE_PICKING } from "./mutations.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import { getContext, onMount } from "svelte";
	import AvailablePickingItem from "./AvailablePickingItem.svelte";
	import Guid from "../../helpers/Guid";
	import GetRouterInstance from "../../services/SheaftRouter";
	import PickingRoutes from "./routes";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	export let close;

	let isLoading = false;
	let selected = null;
	let pickings = [];

	onMount(async () => {
		await query({
			query: GET_AVAILABLE_PICKINGS,
			variables: { includePendingPurchaseOrders: true },
			success: (res) => (pickings = res.data.map((r) => ({ ...r, id: Guid.NewGuid() }))),
			errorsHandler,
			errorNotification: "Impossible de charger les préparations disponibles",
		});
	});

	const handleSubmit = async () => {
		const selectedPicking = pickings.find((d) => d.id == selected);
		isLoading = true;
		await mutate({
			mutation: CREATE_PICKING,
			variables: {
				name: selectedPicking.name,
				autostart: false,
				purchaseOrderIds: selectedPicking.clients.reduce((acc, curr) => {
					acc = [...acc, ...curr.purchaseOrders.map((p) => p.id)];
					return acc;
				}, []),
			},
			success: async (res) => await routerInstance.goTo(PickingRoutes.Edit, { id: res.id }),
			errorsHandler,
			errorNotification: "Impossible de créer la préparation",
			clearCache: [GET_AVAILABLE_PICKINGS, GET_PICKINGS],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Créer une préparation"
	{isLoading}
	{close}
	valid={selected !== null}
	submit={handleSubmit}
	submitText="Confirmer"
	closeText="Annuler"
>
	{#if pickings && pickings.length > 0}
		<p>Sélectionnez la préparation à créer.</p>
		<p class="mb-5">Vous pourrez par la suite joindre d'autres commandes à cette préparation si nécessaire.</p>
		{#each pickings as picking}
			<div class="mb-2">
				<AvailablePickingItem {picking} bind:selected />
			</div>
		{/each}
	{:else}
		<p>Aucune préparation n'est prête à être créée.</p>
		<p>Nous vous proposerons automatiquement des préparations quand des commandes sont en attente ou acceptées.</p>
	{/if}
</ActionConfirm>
