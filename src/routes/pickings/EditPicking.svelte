<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { UPDATE_PICKING } from "./mutations";
	import { GET_PICKINGS, GET_PICKING_DETAILS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import Icon from "svelte-awesome";
	import AddOrderModal from "./AddOrderModal.svelte";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import PickingRoutes from "./routes";
	import PickingStatus from "../../enums/PickingStatus";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let picking = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de la préparation en cours...";

	onMount(async () => {
		isLoading = true;
		picking = await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(PickingRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour de la préparation...";
		await mutate({
			mutation: UPDATE_PICKING,
			variables: {
				id: picking.id,
				name: picking.name,
				purchaseOrderIds: picking.purchaseOrders.map((p) => p.id),
			},
			errorsHandler,
			success: () => routerInstance.goTo(PickingRoutes.List),
			successNotification: "Votre préparation a bien été modifiée",
			errorNotification: "Impossible de modifier la préparation",
			clearCache: [GET_PICKINGS],
		});
	};

	onDestroy(() => (picking = null));

	const buttons =
		picking && picking.status != PickingStatus.Completed.Value
			? [
					{
						text: "Supprimer",
						color: "red",
						click: () => {},
					},
			  ]
			: [];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier une préparation" previousPage={PickingRoutes.List} {buttons} />
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<div class="form-control">
			<label for="batch">Nom *</label>
			<input bind:value={picking.name} id="batch" type="text" />
		</div>
		<div class="form-control">
			<div class="w-full">
				<label>Commandes à préparer</label>
				{#if picking.status != PickingStatus.Completed.Value}
					<button
						type="button"
						on:click|preventDefault={() => open(AddOrderModal, { picking })}
						class="btn btn-outline btn-lg mb-2"
					>
						Ajouter une commande
					</button>
				{/if}
				{#each picking.purchaseOrders as purchaseOrder}
					<div class="bg-white px-4 py-2 shadow rounded">
						<p class="font-semibold mb-2">{purchaseOrder.sender.name}</p>
						{#each purchaseOrder.products as product}
							<p>{product.name} x{product.quantity}</p>
						{/each}
					</div>
				{/each}
			</div>
		</div>
		<div class="form-control mt-5">
			<button
				type="button"
				on:click={handleSubmit}
				class:disabled={isLoading}
				class="btn btn-primary btn-xl justify-center w-full md:w-auto"
			>
				<Icon data={isLoading ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={isLoading} />
				Valider
			</button>
		</div>
	</PageBody>
</TransitionWrapper>
