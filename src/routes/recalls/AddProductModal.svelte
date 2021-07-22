<script>
	import { getContext, onMount } from "svelte";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";

	export let alreadyPresentProducts = [],
		products = [],
		onSuccess,
		close,
		errorsHandler;

	const { query } = getContext("api");

	let allProducts = [];
	let tempProducts = [];
	let isLoading = false;
	let selectedProducts = [];
	let hasSelectedAll = false;

	const handleSubmit = async () => {
		selectedProducts = [...selectedProducts, ...tempProducts.filter((p) => p.checked)];
		if (onSuccess) onSuccess(selectedProducts);
		close();
	};

	const toggleAll = () => {
		hasSelectedAll = !hasSelectedAll;
		tempProducts = tempProducts.map((p) => ({
			...p,
			checked: hasSelectedAll,
		}));
	};

	const toggleProduct = (product) => {
		product.checked = !product.checked;
		tempProducts = tempProducts;
	};

	onMount(async () => {
		tempProducts = JSON.parse(JSON.stringify(products));
		tempProducts = tempProducts
			.filter((p) => !alreadyPresentProducts.includes(p.id))
			.map((p) => ({
				...p,
				checked: false,
			}));
	});

	$: allSelected = tempProducts.filter((p) => !p.checked).length === 0;
</script>

<div class="pb-2">
	<div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
		<h3 class="text-lg font-semibold text-white mb-0">Choisir des produits à ajouter</h3>
	</div>
	<div class="flex items-center cursor-pointer mt-3 mb-2" on:click={() => toggleAll()}>
		<div class="w-1/12">
			<InputCheckbox checked={allSelected} />
		</div>
		<p>Sélectionner tous les produits</p>
	</div>
	{#if tempProducts && tempProducts.length > 0}
		{#each tempProducts as product}
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
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={handleSubmit}
			>Ajouter ces produits
		</button>
	{:else}
		<p class="my-3">Vous ne possèdez pas d'autre produit.</p>
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
	{/if}
</div>
