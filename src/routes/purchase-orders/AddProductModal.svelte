<script>
	import { getContext, onMount } from "svelte";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import { products } from "./stores";

	export let alreadyPresentProducts = [],
		storeProducts = [],
		close,
		errorsHandler;

	const { query } = getContext("api");

	let allProducts = [];

	const handleSubmit = async () => {
		const temp = allProducts.filter((p) => p.checked);

		$products = [
			...$products,
			...temp.map((r) => ({
				...r,
			})),
		];
		close();
	};

	const toggleAll = () => {
		let checked = !hasSelectedAll;
		allProducts = allProducts.map((p) => ({
			...p,
			checked: checked,
		}));
	};

	onMount(async () => {
		allProducts = storeProducts
			.filter((p) => !alreadyPresentProducts.includes(p.id))
			.map((p) => ({
				...p,
				checked: false,
			}));
	});

	$: hasSelectedAll = allProducts.filter((p) => !p.checked).length == 0;
</script>

<div class="pb-2">
	<div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
		<h3 class="text-lg font-semibold text-white mb-0">Choisir des produits à ajouter</h3>
	</div>
	{#if allProducts.length > 0}
		<div class="flex items-center cursor-pointer mt-3 mb-2" on:click={() => toggleAll()}>
			<div class="w-1/12">
				<InputCheckbox checked={hasSelectedAll} />
			</div>
			<p class>Tout sélectionner</p>
		</div>
		{#each allProducts as product}
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
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={handleSubmit}>Ajouter ces produits</button
		>
	{:else}
		<p class="my-3">Ce client ne posséde pas d'autre produit.</p>
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
	{/if}
</div>
