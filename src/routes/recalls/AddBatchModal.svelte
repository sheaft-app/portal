<script>
	import { getContext, onMount } from "svelte";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let alreadyPresentBatches = [],
		batches = [],
		onSuccess,
		close,
		errorsHandler;

	const { query } = getContext("api");

	let allProducts = [];
	let tempBatches = [];
	let isLoading = false;
	let selectedBatches = [];
	let hasSelectedAll = false;

	const handleSubmit = async () => {
		selectedBatches = [...selectedBatches, ...tempBatches.filter((p) => p.checked)];
		if (onSuccess) onSuccess(selectedBatches);
		close();
	};

	const toggleAll = () => {
		hasSelectedAll = !hasSelectedAll;
		tempBatches = tempBatches.map((p) => ({
			...p,
			checked: hasSelectedAll,
		}));
	};

	const toggleBatch = (batch) => {
		batch.checked = !batch.checked;
		tempBatches = tempBatches;
	};

	onMount(async () => {
		tempBatches = JSON.parse(JSON.stringify(batches));
		tempBatches = tempBatches
			.filter((p) => !alreadyPresentBatches.includes(p.id))
			.map((p) => ({
				...p,
				checked: false,
			}));
	});

	$: allSelected = tempBatches.filter((p) => !p.checked).length === 0;
</script>

<div class="pb-2">
	<div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
		<h3 class="text-lg font-semibold text-white mb-0">Choisir des lots à ajouter</h3>
	</div>
	<div class="flex items-center cursor-pointer mt-3 mb-2" on:click={() => toggleAll()}>
		<div class="w-1/12">
			<InputCheckbox checked={allSelected} />
		</div>
		<p>Sélectionner tous les lots</p>
	</div>
	{#if tempBatches && tempBatches.length > 0}
		{#each tempBatches as batch}
			<div class="flex border-b border-gray-400 py-2 items-center cursor-pointer" on:click={() => toggleBatch(batch)}>
				<div class="w-1/12">
					<InputCheckbox checked={batch.checked} />
				</div>
				<p class:font-semibold={batch.checked}>
					{batch.number} ({batch.dlc ? format(new Date(batch.dlc), "P", { locale: fr }) : ""}{batch.ddm
						? format(new Date(batch.ddm), "P", { locale: fr })
						: ""})
				</p>
			</div>
		{/each}
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={handleSubmit}>Ajouter ces lots </button>
	{:else}
		<p class="my-3">Vous ne possèdez pas d'autre lot.</p>
		<button class="btn btn-accent btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
	{/if}
</div>
