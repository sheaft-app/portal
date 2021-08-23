<!-- détails d'un produit -->
<script>
	import { fly } from "svelte/transition";
	import { getContext, onMount } from "svelte";
	import { GET_BATCHES } from "../queries";
	import { SET_PICKING_PRODUCT_PREPARED_QUANTITY } from "../mutations";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import SheaftErrors from "../../../services/SheaftErrors";
	import ProductCounter from "../../delivery-batches/process/ProductCounter.svelte";
	import PickingRoutes from "../routes";
	import Icon from "svelte-awesome";
	import CreateBatchModal from "../../batches/CreateBatchModal.svelte";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import ValidatePickingModal from "./ValidatePickingModal.svelte";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
import { formatConditioningDisplay } from "../../../helpers/app";

	export let pickingId;
	export let products = [];

	const errorsHandler = new SheaftErrors();
	const { query, mutate } = getContext("api");
	const { open } = getContext("modal");
	const routerInstance = GetRouterInstance();

	let previousStepper = 0;
	let isSubmitting = false;
	let selectedBatches = [];
	let stepper = 0;
	let displayedBatches = [];
	let batches = [];

	onMount(async () => {
		batches = await query({
			query: GET_BATCHES,
			errorsHandler,
			errorNotification: "Impossible de charger les lots",
		});

		displayedBatches = batches;
	});

	const handleSaveAndContinue = async (product, end = false) => {
		// simple denormalization for getSelectedBatches
		products[stepper].selectedBatches = selectedBatches.map((b) => ({ id: b }));
		await mutate({
			mutation: SET_PICKING_PRODUCT_PREPARED_QUANTITY,
			variables: {
				id: pickingId,
				productId: product.id,
				completed: false,
				batches: selectedBatches,
				preparedBy: null,
				preparedQuantities: product.clients.map((c) => ({
					purchaseOrderId: c.purchaseOrderId,
					preparedQuantity: c.prepared,
				})),
			},
			success: () => {
				if (end) routerInstance.goTo(PickingRoutes.List);
			},
			errorsHandler,
			errorNotification: "Impossible de sauvegarder la préparation.",
		});
	};

	const openValidateModal = (product) =>
		open(ValidatePickingModal, {
			variables: { id: pickingId },
			products,
			save: () => handleSaveAndContinue(product),
		});

	const previous = () => {
		if (stepper > 0) {
			previousStepper = stepper;
			--stepper;
		}
	};

	const next = (product) => {
		if (stepper < products.length - 1) {
			previousStepper = stepper;
			handleSaveAndContinue(product);
			++stepper;
		} else {
			openValidateModal(product);
		}
	};

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
			displayedBatches = batches.filter(
				(b) => b.number.includes(e.target.value) || selectedBatches.includes(b.id)
			);
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

	const getSelectedBatches = async (product) => {
		selectedBatches = products[stepper]?.selectedBatches?.map((b) => b.id) || [];
	};

	const autoFillStoresProduct = () => {
		products[stepper].clients = products[stepper].clients.map(c => {
			if(!c.prepared)
				c.prepared = c.expected;

			return c;
		});
	}

	$: stepper, getSelectedBatches();
	$: disabledStep3 = isSubmitting;
</script>

{#each products as product, index (product.id)}
	{#if index == stepper}
		<p class="text-xl text-primary font-semibold">
			<select on:change={(e) => stepper = e.target.value}>
				{#each products as product, index}
					<option selected={index == stepper} value={index}>
						{product.name}
						{formatConditioningDisplay(product.conditioning, product.quantityPerUnit, product.unit)}
					</option>
				{/each}
			</select>
		</p>
		<div in:fly|local={{ x: previousStepper > stepper ? -800 : 800, duration: 400 }}>
			<p class="font-semibold py-4">Quantités par magasin <span on:click={() => autoFillStoresProduct()} class="cursor-pointer text-accent">(tout pré-remplir)</span></p>
			<div class="m-auto">
				{#each product.clients as client, index}
					<div
						class="flex flex-wrap justify-between border-gray-300 pb-2 items-center"
						class:border-b={index !== product.clients.length - 1}
					>
						<div>
							<p class="font-semibold">{client.name}</p>
							<p>{client.expected} commandé(s)</p>
						</div>
						<div class="w-1/2">
							<ProductCounter label="préparé(s)" bind:value={client.prepared} />
						</div>
					</div>
				{/each}
			</div>
			<p class="font-semibold py-4">Numéros de lots des quantités préparées</p>
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
						<p class="font-semibold">{batch.number}</p>
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
			<div class="mt-5 pb-5 w-full px-4 space-y-3 m-auto" style="max-width: 500px;">
				<button
					disabled={isSubmitting}
					class:disabled={stepper == 0}
					on:click={() => previous()}
					type="button"
					class="block btn btn-lg btn-outline w-full text-center justify-center">Retour</button
				>
				<button
					type="button"
					class="block btn btn-lg btn-outline w-full text-center justify-center"
					disabled={disabledStep3}
					class:disabled={disabledStep3}
					on:click={() => handleSaveAndContinue(product, true)}
				>
					{#if isSubmitting}
						<Icon data={faCircleNotch} class="mr-2" spin />
					{/if}
					Sauvegarder et continuer plus tard
				</button>
				<button
					type="button"
					class="block btn btn-lg btn-accent w-full text-center justify-center"
					disabled={disabledStep3}
					class:disabled={disabledStep3}
					on:click={() => next(product)}
				>
					{#if index == products.length - 1}
						Terminer la préparation
					{:else}
						Valider et continuer
					{/if}
				</button>
			</div>
		</div>
	{/if}
{/each}
