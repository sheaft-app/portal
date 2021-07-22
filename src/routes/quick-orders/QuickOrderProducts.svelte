<script>
	import { getContext, onMount } from "svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import AddProductModal from "./AddProductModal.svelte";
	import Icon from "svelte-awesome";
	import { faPlus } from "@fortawesome/free-solid-svg-icons";

	export let quickOrder,
		producersProducts = [],
		errorsHandler,
		isLoading;

	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const { clearApolloCache } = getContext("api");

	const headers = [
		{ label: "Nom", mobile: true },
		{ label: "Producteur", mobile: true },
		{ label: "Quantité", mobile: true },
		{ label: "Actions", mobile: false },
	];

	const removeProduct = (product) => {
		if (product.checked) quickOrder.products = quickOrder.products.filter((p) => p.id !== product.id);
		else {
			product.markForDeletion = true;
			quickOrder.products = quickOrder.products;
		}
	};

	const cancelRemoveProduct = (product) => {
		product.markForDeletion = false;
		quickOrder.products = quickOrder.products;
	};

	const addProduct = () => {
		open(AddProductModal, {
			errorsHandler,
			producersProducts,
			alreadyPresentProducts: quickOrder.products.map((p) => p.id),
			onSuccess: (res) => {
				quickOrder.products = [...quickOrder.products, ...res];
				quickOrder = quickOrder;
			},
		});
	};
</script>

<table class="shadow">
	<thead>
		<tr class="bg-white">
			{#each headers as header}
				<th
					class:hidden={!header.mobile}
					class="px-3 md:px-6 py-3 border-b border-gray-300 text-left lg:table-cell
                    text-xs leading-4 font-medium text-gray-600 uppercase
                    tracking-wider"
				>
					{header.label}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each quickOrder.products as product}
			<tr class:bg-green-200={product.checked} class:bg-red-200={product.markForDeletion}>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 200px;">
						{product.name}
						<p class="text-gray-600">#{product.reference}</p>
						{#if !product.markForDeletion}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => removeProduct(product)}
								disabled={isLoading}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => cancelRemoveProduct(product)}
								disabled={isLoading}
							>
								Annuler
							</button>
						{/if}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate">
						{product.producer.name}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 100px;">
						<input
							bind:value={product.quantity}
							id="grid-price"
							type="number"
							step="1"
							name="quantity"
							placeholder="ex : 7"
							disabled={isLoading}
						/>
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden lg:table-cell">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{#if !product.markForDeletion}
							<button
								type="button"
								class="btn btn-outline btn-lg"
								on:click={() => removeProduct(product)}
								disabled={isLoading}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn btn-outline btn-lg"
								on:click={() => cancelRemoveProduct(product)}
								disabled={isLoading}
								>Annuler
							</button>
						{/if}
					</div>
				</td>
			</tr>
		{/each}
		<tr class="bg-white" colspan="100">
			<td class="px-3 md:px-6 py-2 whitespace-no-wrap border-b border-gray-200">
				<button type="button" class="flex items-center btn-link" on:click={addProduct} disabled={isLoading}>
					<Icon data={faPlus} class="mr-2" />
					Ajouter des produits
				</button>
			</td>
		</tr>
	</tbody>
</table>
