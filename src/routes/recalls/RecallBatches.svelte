<script>
	import { getContext, onMount } from "svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import AddBatchModal from "./AddBatchModal.svelte";
	import Icon from "svelte-awesome";
	import { faPlus } from "@fortawesome/free-solid-svg-icons";
	import { GET_BATCHES } from "./queries";
	import RecallRoutes from "./routes";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let recall, errorsHandler, isLoading;

	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const { clearApolloCache, query } = getContext("api");

	let batches = [];

	const headers = [
		{ label: "Numéro", mobile: true },
		{ label: "DLC/DDM", mobile: true },
		{ label: "Actions", mobile: false },
	];

	const removeBatch = (batch) => {
		if (batch.checked) recall.batches = recall.batches.filter((p) => p.id !== batch.id);
		else {
			batch.markForDeletion = true;
			recall.batches = recall.batches;
		}
	};

	const cancelRemoveBatch = (batch) => {
		batch.markForDeletion = false;
		recall.batches = recall.batches;
	};

	const addBatch = () => {
		open(AddBatchModal, {
			errorsHandler,
			batches,
			alreadyPresentBatches: recall.batches.map((p) => p.id),
			onSuccess: (res) => {
				recall.batches = [...recall.batches, ...res];
				recall = recall;
			},
		});
	};

	onMount(async () => {
		batches = await query({
			query: GET_BATCHES,
			errorsHandler,
			error: () => routerInstance.goTo(RecallRoutes.List),
			errorNotification: "Impossible de récupérer les lots pour la campagne.",
		});
	});
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
		{#each recall.batches as batch}
			<tr class:bg-green-200={batch.checked} class:bg-red-200={batch.markForDeletion}>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 200px;">
						{batch.number}
						{#if !batch.markForDeletion}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => removeBatch(batch)}
								disabled={isLoading}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => cancelRemoveBatch(batch)}
								disabled={isLoading}
							>
								Annuler
							</button>
						{/if}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate">
						{batch.dlc ? format(new Date(batch.dlc), "P", { locale: fr }) : ""}{batch.ddm
							? format(new Date(batch.ddm), "P", { locale: fr })
							: ""}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden lg:table-cell">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{#if !batch.markForDeletion}
							<button
								type="button"
								class="btn btn-outline btn-lg"
								on:click={() => removeBatch(batch)}
								disabled={isLoading}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn btn-outline btn-lg"
								on:click={() => cancelRemoveBatch(batch)}
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
				<button type="button" class="flex items-center btn-link" on:click={addBatch} disabled={isLoading}>
					<Icon data={faPlus} class="mr-2" />
					Ajouter des lots
				</button>
			</td>
		</tr>
	</tbody>
</table>
