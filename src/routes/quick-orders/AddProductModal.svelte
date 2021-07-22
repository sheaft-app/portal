<script>
	import { getContext, onMount } from "svelte";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import Select from "../../components/controls/select/Select.svelte";

	export let alreadyPresentProducts = [],
		producersProducts = [],
		onSuccess,
		close,
		errorsHandler;

	const { query } = getContext("api");

	let allProducts = [];
	let products = [];
	let producers = null;
	let tempProducersProducts = [];
	let allSelected = false;
	let isLoading = false;

	const handleSubmit = async () => {
		products = [...products, ...getSelectedProducts()];
		if (onSuccess) onSuccess(products);
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

	const toggleAll = () => {
		let hasSelectedAll = true;
		if (getAllChecked()) hasSelectedAll = false;

		if (producers && producers.length > 0) {
			for (let j = 0; j < producers.length; j++) {
				for (let i = 0; i < tempProducersProducts.length; i++) {
					if (tempProducersProducts[i].id !== producers[j].id) continue;
					tempProducersProducts[i].products = tempProducersProducts[i].products.map((p) => ({
						...p,
						checked: hasSelectedAll,
					}));
					producers[j].products = tempProducersProducts[i].products;
				}
			}
		} else {
			for (let i = 0; i < tempProducersProducts.length; i++) {
				tempProducersProducts[i].products = tempProducersProducts[i].products.map((p) => ({
					...p,
					checked: hasSelectedAll,
				}));
			}
		}

		refreshAllChecked();
		tempProducersProducts = tempProducersProducts;
	};

	const toggleProduct = (product) => {
		product.checked = !product.checked;
		tempProducersProducts = tempProducersProducts;
		refreshAllChecked();
	};

	onMount(async () => {
		tempProducersProducts = JSON.parse(JSON.stringify(producersProducts));
		for (let i = 0; i < tempProducersProducts.length; i++) {
			tempProducersProducts[i].products = tempProducersProducts[i].products
				.filter((p) => !alreadyPresentProducts.includes(p.id))
				.map((p) => ({
					...p,
					checked: false,
				}));
		}
	});

	$: selectedProducers = producers && producers.length > 0 ? producers : tempProducersProducts;

	const refreshAllChecked = () => {
		allSelected = getAllChecked();
	};

	const getAllChecked = () => {
		let checked = false;
		for (let i = 0; i < selectedProducers.length; i++) {
			checked = selectedProducers[i].products.filter((p) => !p.checked).length === 0;
			if (!checked) break;
		}

		return checked;
	};
</script>

<div class="pb-2">
	<div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
		<h3 class="text-lg font-semibold text-white mb-0">Choisir des produits à ajouter</h3>
	</div>
	<div class="form-control pt-4">
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
				on:select={refreshAllChecked}
			/>
		</div>
	</div>
	<div class="flex items-center cursor-pointer mt-3 mb-2" on:click={() => toggleAll()}>
		<div class="w-1/12">
			<InputCheckbox checked={allSelected} />
		</div>
		{#if producers && producers.length > 1}
			<p>Sélectionner tous les produits de ces producteurs</p>
		{:else if producers && producers.length > 0}
			<p>Sélectionner tous les produits de ce producteur</p>
		{:else}
			<p>Sélectionner tous les produits</p>
		{/if}
	</div>
	{#if tempProducersProducts.length > 0}
		{#each selectedProducers as producer}
			{#if !producers || producers.length > 1}
				<div class="flex border-b border-gray-400 py-4">
					<p class="font-semibold">
						{producer.name}
					</p>
				</div>
			{/if}
			{#if producer.products && producer.products.length > 0}
				{#each producer.products as product}
					<div
						class="flex border-b border-gray-400 py-2 items-center cursor-pointer"
						on:click={() => toggleProduct(product)}
					>
						<div class="w-1/12">
							<InputCheckbox checked={product.checked} />
						</div>
						<p class:font-semibold={product.checked}>
							{product.name}
						</p>
					</div>
				{/each}
			{:else}
				<p class="my-3">Ce producteur ne possède pas d'autre produit.</p>
			{/if}
		{/each}
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={handleSubmit}
			>Ajouter ces {getSelectedProducts()} produits</button
		>
	{:else}
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
	{/if}
</div>
