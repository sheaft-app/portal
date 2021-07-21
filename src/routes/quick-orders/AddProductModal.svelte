<script>
	import { getContext, onMount } from "svelte";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import { products } from "./stores";
	import Select from "../../components/controls/select/Select.svelte";

	export let alreadyPresentProducts = [],
		producersProducts = [],
		close,
		errorsHandler;

	const { query } = getContext("api");

	let allProducts = [];
	let producers = null;
	let tempProducersProducts = [];
	let hasSelectedAll = false;
	let isLoading = false;

	const handleSubmit = async () => {
		$products = [...$products, ...getSelectedProducts()];
		close();
	};

	const getSelectedProducts = () => {
		let allProducts = [];
		for (let i = 0; i < tempProducersProducts.length; i++) {
			let checkedProducts = tempProducersProducts[i].products.filter((p) => p.checked);
			if (checkedProducts && checkedProducts.length > 0) allProducts = [...allProducts, ...checkedProducts];
		}

		return allProducts;
	};

	const toggleAll = (producers) => {
		hasSelectedAll = !hasSelectedAll;
		for (let i = 0; i < producers.length; i++) {
			producers[i].products = producers[i].products.map((p) => ({
				...p,
				checked: hasSelectedAll,
			}));
		}
	};

	const allProductsCheck = (producers) => {
		let checked = false;

		for (let i = 0; i < producers.length; i++) {
			checked = producers[i].products.filter((p) => !p.checked).length === 0;
			if (!checked) break;
		}

		return checked;
	};

	onMount(async () => {
		tempProducersProducts = producersProducts;
		for (let i = 0; i < producersProducts.length; i++) {
			tempProducersProducts[i].products = producersProducts[i].products
				.filter((p) => !alreadyPresentProducts.includes(p.id))
				.map((p) => ({
					...p,
					checked: false,
				}));
		}
	});

	$: selectedProducers = producers && producers.length > 0 ? producers : tempProducersProducts;
</script>

<div class="pb-2">
	<div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
		<h3 class="text-lg font-semibold text-white mb-0">Choisir des produits à ajouter</h3>
	</div>
	<div class="form-control">
		<div class="w-full">
			<Select
				isMulti={true}
				bind:selectedValue={producers}
				getOptionLabel={(option) => option.name}
				getSelectionLabel={(option) => option.name}
				optionIdentifier="id"
				disabled={isLoading}
				placeholder="N'afficher que certains producteur"
				items={tempProducersProducts}
			/>
		</div>
	</div>
	{#if producersProducts.length > 0}
		{#each selectedProducers as producer}
			<div
				class="flex items-center cursor-pointer mt-3 mb-2"
				on:click={() => toggleAll(producers && producers.length > 0 ? producers : tempProducersProducts)}
			>
				<div class="w-1/12">
					<InputCheckbox
						checked={allProductsCheck(producers && producers.length > 0 ? producers : tempProducersProducts)}
					/>
				</div>
				{#if producers && producers.length > 0}
					<p>Sélectionner tous les produits de ces producteurs</p>
				{:else}
					<p>Sélectionner tous les produits</p>
				{/if}
			</div>
			{#each producer.products as product}
				<div
					class="flex border-b border-gray-400 py-2 items-center cursor-pointer"
					on:click={() => (product.checked = !product.checked)}
				>
					<div class="w-1/12">
						<InputCheckbox checked={product.checked} />
					</div>
					<p class:font-semibold={product.checked}>{product.name}</p>
				</div>
			{/each}
		{/each}
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={handleSubmit}
			>Ajouter ces {getSelectedProducts()} produits</button
		>
	{:else}
		<p class="my-3">Ce producteur ne possède pas d'autre produit.</p>
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
	{/if}
</div>
