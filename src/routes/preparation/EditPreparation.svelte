<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { UPDATE_PREPARATION } from "./mutations";
	import { GET_PICKINGS, GET_PICKING_DETAILS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import Icon from "svelte-awesome";
	import AddOrderModal from "./AddOrderModal.svelte";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import PreparationRoutes from "./routes";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let preparation = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de la préparation en cours...";

	onMount(async () => {
		isLoading = true;
		preparation = await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(PreparationRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour de la préparation...";
		await mutate({
			mutation: UPDATE_PREPARATION,
			variables: {
				id: preparation.id,
				name: preparation.name,
				purchaseOrderIds: preparation.purchaseOrders.map((p) => p.id),
			},
			errorsHandler,
			success: () => routerInstance.goTo(PreparationRoutes.List),
			successNotification: "Votre préparation a bien été modifiée",
			errorNotification: "Impossible de modifier la préparation",
			clearCache: [GET_PICKINGS],
		});
	};

	onDestroy(() => (preparation = null));

	const buttons = [
		{
			text: "Supprimer",
			color: "red",
			click: () => {},
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier une préparation" previousPage={PreparationRoutes.List} {buttons} />
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<div class="form-control">
			<label for="reason">Nom *</label>
			<input bind:value={preparation.name} id="batch" type="text" />
		</div>
		<div class="form-control">
			<div class="w-full">
				<label>Commandes à préparer</label>
				<button
					type="button"
					on:click|preventDefault={() => open(AddOrderModal, { preparation })}
					class="btn btn-outline btn-lg mb-2"
				>
					Ajouter une commande
				</button>
				{#each preparation.purchaseOrders as purchaseOrder}
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
