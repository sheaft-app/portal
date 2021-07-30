<!-- détails d'un produit -->
<script>
	import { onMount, getContext } from "svelte";
	import { GET_BATCHES, GET_PICKING_DETAILS, GET_PICKINGS } from "../queries";
	import { SET_PICKING_PRODUCT_PREPARED_QUANTITY } from "../mutations";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import SheaftErrors from "../../../services/SheaftErrors";
	import ProductCounter from "../../delivery-batches/process/ProductCounter.svelte";
	import { denormalizeProduct } from "../pickingForm";
	import PickingRoutes from "../routes";
	import TransitionWrapper from "../../../components/TransitionWrapper.svelte";
	import PageHeader from "../../../components/PageHeader.svelte";
	import PageBody from "../../../components/PageBody.svelte";
	import Icon from "svelte-awesome";
	import CreateBatchModal from "./../../batches/CreateBatchModal.svelte";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import ValidateProductModal from "./ValidateProductModal.svelte";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";

	export let params;

	const errorsHandler = new SheaftErrors();
	const { query, mutate } = getContext("api");
	const { open } = getContext("modal");
	const routerInstance = GetRouterInstance();

	let product = null;
	let preparedBy = null;
	let batches = [];
	let isLoading = true;
	let isSubmitting = false;
	let selectedBatches = [];
	let stepper = 1;
	let displayedBatches = [];

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			success: async (res) => {
				let products = res.productsToPrepare.filter((p) => p.productId == params.productId);
				let preparedProducts = res.preparedProducts.filter((p) => p.productId == params.productId);

				if (products.length == 0) {
					routerInstance.goTo(PickingRoutes.Process, { id: params.id });
				}

				batches = await query({
					query: GET_BATCHES,
					errorsHandler,
					errorNotification: "Impossible de charger les lots",
				});

				displayedBatches = batches;

				if (preparedProducts[0] && preparedProducts[0].batches) {
					selectedBatches = preparedProducts[0].batches.map((b) => b.id);
				}

				product = denormalizeProduct(products, preparedProducts);
			},
			error: () => routerInstance.goTo(PickingRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
		});

		isLoading = false;
	});

	const handleSaveAndContinue = async () => {
		isSubmitting = true;
		await mutate({
			mutation: SET_PICKING_PRODUCT_PREPARED_QUANTITY,
			variables: {
				id: params.id,
				productId: params.productId,
				completed: false,
				batches: selectedBatches,
				preparedBy: null,
				preparedQuantities: product.clients.map((c) => ({
					purchaseOrderId: c.purchaseOrderId,
					preparedQuantity: c.prepared,
				})),
			},
			errorsHandler,
			success: () => routerInstance.goTo(PickingRoutes.Process, { id: params.id }),
			successNotification: "Préparation sauvegardée",
			errorNotification: "Impossible de sauvegarder la préparation",
			clearCache: [params.id, GET_PICKINGS],
		});
		isSubmitting = true;
	};

	const openValidateModal = () =>
		open(ValidateProductModal, {
			variables: {
				id: params.id,
				productId: params.productId,
				completed: true,
				batches: selectedBatches,
				preparedBy,
				preparedQuantities: product.clients.map((c) => ({
					purchaseOrderId: c.purchaseOrderId,
					preparedQuantity: c.prepared,
				})),
			},
		});

	const openCreateBatchModal = () =>
		open(CreateBatchModal, {
			onClose: (res) => {
				if (res.success) {
					batches = [res.data, ...batches];
					displayedBatches = batches;
					selectedBatches = [...selectedBatches, res.data.id];
				}
			},
		});

	const handleFilterInput = (e) => {
		if (e.target.value) {
			displayedBatches = batches.filter((b) => b.number.includes(e.target.value) || selectedBatches.includes(b.id));
		} else {
			displayedBatches = batches;
		}
	};

	const handleBatchSelect = (id) => {
		if (selectedBatches.includes(id)) {
			selectedBatches = selectedBatches.filter((b) => b !== id);
		} else {
			selectedBatches = [...selectedBatches, id];
		}
	};

	$: disabledStep3 = isSubmitting;
</script>

<TransitionWrapper>
	<PageHeader
		name={product?.name ? `Préparation ${product.name}` : "Préparation"}
		previousPage={PickingRoutes.Process}
		previousPageParams={{ id: params.id }}
		subname={`${product?.total} à préparer` || "Chargement..."}
	/>
	<PageBody {errorsHandler} {isLoading} noResultsPage={null} loadingMessage="Chargement du produit...">
		{#if !isLoading}
			{#if stepper == 1}
				<div class="m-auto">
					{#each product.clients as client, index}
						<div
							class="flex flex-wrap justify-between border-gray-300 pb-2 items-center"
							class:border-b={index !== product.clients.length - 1}
						>
							<div>
								<p class="font-semibold">{client.name}</p>
								<p>{client.expected} à préparer</p>
							</div>
							<div class="w-1/2">
								<ProductCounter label="préparé(s)" bind:value={client.prepared} />
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-5 pb-5 w-full px-4">
					<button
						type="button"
						class="block btn btn-lg btn-accent w-full text-center justify-center"
						on:click={() => (stepper = 2)}
					>
						Suivant
					</button>
				</div>
			{:else if stepper == 2}
				{#if batches.length}
					<div class="form-control">
						<label>Chercher par numéro de lot</label>
						<input on:input={handleFilterInput} placeholder="Tapez un numéro de lot" />
					</div>
					<button class="btn-link mb-2 mt-2" on:click={openCreateBatchModal}>+ Créer un autre lot</button>
					{#each displayedBatches as batch}
						<div
							class="mb-2 bg-white shadow rounded px-4 py-2 cursor-pointer"
							on:click={() => handleBatchSelect(batch.id)}
							class:bg-primary={selectedBatches.includes(batch.id)}
						>
							<p class="font-semibold">Lot {batch.number}</p>
							{#if batch.dlc}
								<p>DLC : {format(new Date(batch.dlc), "PPPP", { locale: fr })}</p>
							{/if}
							{#if batch.ddm}
								<p>DDM : {format(new Date(batch.ddm), "PPPP", { locale: fr })}</p>
							{/if}
						</div>
					{/each}
				{:else}
					<p>
						Si nécessaire, vous pouvez lier la préparation du produit à un lot. Dans ce cas, <a
							href="javascript:void(0)"
							on:click={openCreateBatchModal}>cliquez ici</a
						> pour créer un lot.
					</p>
				{/if}
				<div class="mt-5 pb-5 w-full px-4 space-y-3">
					<button
						disabled={isSubmitting}
						on:click={() => (stepper = 1)}
						type="button"
						class="block btn btn-lg btn-outline w-full text-center justify-center">Retour</button
					>
					{#if !product.completed}
						<button
							type="button"
							class="block btn btn-lg btn-accent w-full text-center justify-center"
							disabled={disabledStep3}
							class:disabled={disabledStep3}
							on:click={() => handleSaveAndContinue()}
						>
							{#if isSubmitting}
								<Icon data={faCircleNotch} class="mr-2" spin />
							{/if}
							Sauvegarder et continuer plus tard
						</button>
					{/if}
					<button
						type="button"
						class="block btn btn-lg btn-accent w-full text-center justify-center"
						disabled={disabledStep3}
						class:disabled={disabledStep3}
						on:click={openValidateModal}
					>
						Valider ce produit
					</button>
				</div>
			{/if}
		{/if}
	</PageBody>
</TransitionWrapper>
