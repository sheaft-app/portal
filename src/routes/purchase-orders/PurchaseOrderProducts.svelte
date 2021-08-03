<script>
	import { getContext, onMount } from "svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import AddProductModal from "./AddProductModal.svelte";
	import Icon from "svelte-awesome";
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import { products } from "./stores";

	export let purchaseOrder,
		storeProducts = [],
		errorsHandler;

	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const { clearApolloCache } = getContext("api");

	const headers = [
		{ label: "Nom", mobile: true },
		{ label: "Prix HT", mobile: true },
		{ label: "Quantité", mobile: true },
		{ label: "Actions", mobile: false },
	];

	const removeProduct = (product) => {
		if (product.checked) $products = $products.filter((p) => p.id != product.id);
		else product.markForDeletion = true;

		$products = $products;
	};

	const cancelRemoveProduct = (product) => {
		product.markForDeletion = false;
		$products = $products;
	};

	const addProduct = () =>
		open(AddProductModal, {
			errorsHandler,
			storeProducts,
			alreadyPresentProducts: $products.map((p) => p.id),
		});

	$: purchaseOrder.products = $products;
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
		{#each $products as product}
			<tr class:bg-green-200={product.checked} class:bg-red-200={product.markForDeletion}>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{product.name}
						<p class="text-gray-600">#{product.reference}</p>
						{#if !product.markForDeletion}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => removeProduct(product)}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => cancelRemoveProduct(product)}
							>
								Annuler
							</button>
						{/if}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 100px;">
						{product.wholeSalePrice}€
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 100px;">
						<input
							bind:value={product.quantity}
							id="grid-price"
							required
							type="number"
							step="1"
							name="quantity"
							placeholder="ex : 7"
						/>
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden lg:table-cell">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{#if !product.markForDeletion}
							<button type="button" class="btn btn-outline btn-lg" on:click={() => removeProduct(product)}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn btn-outline btn-lg"
								on:click={() => cancelRemoveProduct(product)}
								>Annuler
							</button>
						{/if}
					</div>
				</td>
			</tr>
		{/each}
		<tr class="bg-white" colspan="100">
			<td class="px-3 md:px-6 py-2 whitespace-no-wrap border-b border-gray-200">
				<button type="button" class="flex items-center btn-link" on:click={addProduct}>
					<Icon data={faPlus} class="mr-2" />
					Ajouter des produits
				</button>
			</td>
		</tr>
	</tbody>
</table>
