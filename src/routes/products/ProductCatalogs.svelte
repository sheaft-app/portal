<script>
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import CatalogKind from "../../enums/CatalogKind";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import SelectAddCatalog from "./SelectAddCatalog.svelte";

	export let catalogs = [];
	export let form;

	let headers = [
		{ label: "Nom", mobile: true },
		{ label: "Visible par", mobile: true },
		{ label: "Prix HT", mobile: true },
		{ label: "Ajouté le", mobile: false },
		{ label: "Actions", mobile: false },
	];

	const removeCatalog = (catalog) => {
		if (catalog.checked) catalogs = catalogs.filter((c) => c.id != catalog.id);
		else catalog.markForDeletion = true;

		catalogs = catalogs;
	};

	const cancelRemoveCatalog = (catalog) => {
		catalog.markForDeletion = false;
		catalogs = catalogs;
	};
</script>

<table class="shadow w-full">
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
		{#each catalogs as catalog}
			<tr class:bg-green-200={catalog.checked} class:bg-red-200={catalog.markForDeletion}>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{catalog.name}
						{#if !catalog.markForDeletion}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => removeCatalog(catalog)}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn-link block lg:hidden"
								on:click={() => cancelRemoveCatalog(catalog)}
							>
								Annuler
							</button>
						{/if}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 table-cell">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{CatalogKind.label(catalog.kind)}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 100px;">
						<input
							bind:value={catalog.wholeSalePricePerUnit}
							id="grid-price"
							required
							type="number"
							use:bindClass={{ form, name: "wholeSalePricePerUnit" }}
							step=".01"
							name="wholeSalePricePerUnit"
							placeholder="ex : 2.49"
						/>
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden lg:table-cell">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{catalog.addedOn
							? format(new Date(catalog.addedOn), "PP", { locale: fr })
							: format(new Date(), "PP", { locale: fr })}
					</div>
				</td>
				<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden lg:table-cell">
					<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
						{#if !catalog.markForDeletion}
							<button type="button" class="btn btn-outline btn-lg" on:click={() => removeCatalog(catalog)}
								>Retirer
							</button>
						{:else}
							<button
								type="button"
								class="btn btn-outline btn-lg"
								on:click={() => cancelRemoveCatalog(catalog)}
								>Annuler
							</button>
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</tbody>
	<tfoot>
		<tr>
			<td colspan="2" class="px-3 md:px-6 py-2 whitespace-no-wrap border-b border-gray-200">
				<SelectAddCatalog bind:catalogs />
			</td>
		</tr>
	</tfoot>
</table>
