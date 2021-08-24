<script>
	import DeliverySummaryProduct from "./DeliverySummaryProduct.svelte";
	import { GET_RETURNABLES, GET_DELIVERY_BATCH_DETAILS } from "../queries";
	import { COMPLETE_DELIVERY } from "../mutations";
	import { onMount, getContext } from "svelte";
	import SheaftErrors from "../../../services/SheaftErrors";
	import ProductCounter from "./ProductCounter.svelte";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import DeliveryBatchesRoutes from "../routes";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import ErrorCard from "../../../components/ErrorCard.svelte";

	export let delivery;
	export let deliveryBatchId;
	export let numberOfDeliveries;
	export let close;

	const { query, mutate } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let returnables = [];

	let receptionedBy = null;
	let comment = null;

	let isLoadingReturnables = true;
	let isSubmitting = false;
	let step = 1;

	onMount(async () => {
		delivery.products = delivery.products.map(p => {p.delivered = p.quantity; return p;});
		
		isLoadingReturnables = true;
		returnables = await query({
			query: GET_RETURNABLES,
			errorsHandler,
			errorNotification: "Un problème est survenu pendant la récupération des consignes.",
		});

		isLoadingReturnables = false;
	});

	const handleSubmit = async () => {
		isSubmitting = true;

		let returnedProducts = [];
		delivery.products.forEach((p) => {
			if (p.delivered > p.quantity) {
				returnedProducts = [
					...returnedProducts,
					{
						id: p.productId,
						kind: "EXCESS",
						quantity: p.delivered - p.quantity,
					},
				];
			} else if (p.delivered < p.quantity) {
				returnedProducts = [
					...returnedProducts,
					{
						id: p.productId,
						kind: "MISSING",
						quantity: p.quantity - p.delivered,
					},
				];
			}
		});

		await mutate({
			mutation: COMPLETE_DELIVERY,
			variables: {
				id: delivery.id,
				receptionedBy,
				comment,
				returnedProducts,
				returnedReturnables: returnables
					.filter((r) => r.count > 0)
					.map((r) => ({ id: r.id, quantity: r.count })),
			},
			errorsHandler,
			success: async () => {
				close();
				await routerInstance.goTo(DeliveryBatchesRoutes.NextDelivery, { id: deliveryBatchId });
			},
			successNotification: "Compte-rendu validé avec succès !",
			errorNotification: "Impossible de compléter la livraison. Veuillez réessayer.",
			clearCache: [deliveryBatchId],
		});
		isSubmitting = false;
	};
</script>

<div class="relative pb-40">
	<div class="flex justify-between">
		<p class="uppercase text-gray-600">Compte-rendu</p>
		<p>{delivery.position + 1}/{numberOfDeliveries}</p>
	</div>
	<ErrorCard {errorsHandler} />
	<p class="text-primary text-xl font-semibold uppercase mt-2">{delivery.client.name}</p>
	<p>{delivery.address.line1}</p>
	<p>{delivery.address.zipcode} {delivery.address.city}</p>
	{#if step == 1}
		<div>
			{#each delivery.products as product, index}
				<DeliverySummaryProduct {product} {index} numberOfProducts={delivery.products.length - 1} />
			{/each}
		</div>
		{#if !isLoadingReturnables}
			<div class="bottom-cta fixed lg:static w-full px-4 space-y-3 z-10">
				<button
					disabled={isSubmitting}
					type="button"
					class="block btn btn-lg btn-outline w-full text-center justify-center cancel"
					on:click={close}>Annuler</button
				>
				<button
					type="button"
					class="block btn btn-lg btn-accent w-full text-center justify-center"
					on:click={() => ++step}>Suivant</button
				>
			</div>
		{/if}
	{:else}
		{#if returnables && returnables.length > 0}
			<div class="py-2">
				<p class="text-lg font-medium">Avez-vous récupéré des consignes ?</p>
				<p class="text-gray-600">Si oui, vous pouvez les comptabiliser ici avant de valider le compte-rendu.</p>
			</div>
			{#each returnables as returnable}
				<div class="flex justify-between items-center space-x-2">
					<div>
						<p>{returnable.name}</p>
					</div>
					<div class="w-1/2">
						<ProductCounter
							bind:value={returnable.count}
							disabled={isSubmitting}
							label="Récupérées"
							showLabel={false}
							color="gray-800"
						/>
					</div>
				</div>
			{/each}
		{/if}
		<div class="form-control w-full mt-3">
			<label for="receptionedBy">Livraison réceptionnée par</label>
			<input
				id="receptionedBy"
				bind:value={receptionedBy}
				disabled={isSubmitting}
				type="text"
				placeholder="ex: Stéphanie A. (optionel)"
			/>
		</div>
		<div class="form-control w-full">
			<label for="comment">Commentaire (optionnel)</label>
			<textarea id="comment" bind:value={comment} class="block" />
		</div>
		<div class="bottom-cta fixed lg:static w-full px-4 space-y-3 z-10">
			<button
				disabled={isSubmitting}
				type="button"
				class="block btn btn-lg btn-outline w-full text-center justify-center cancel"
				on:click={() => --step}>Retour</button
			>
			<button
				type="button"
				class="block btn btn-lg btn-accent w-full text-center justify-center"
				disabled={isSubmitting}
				class:disabled={isSubmitting}
				on:click={handleSubmit}
			>
				{#if isSubmitting}
					<Icon data={faCircleNotch} class="mr-2" spin />
				{/if}
				Valider le compte-rendu
			</button>
		</div>
	{/if}
</div>

<style lang="postcss">
	.cancel:not(:hover) {
		@apply bg-white !important;
	}
</style>
